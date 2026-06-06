from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

import requests
from django.conf import settings
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from .models import CartUser, Product, orderItem, paymentMethod
from .serializers import (
    CartUserSerializer,
    PaymentMethodSerializer,
    ProductSerializer,
    RegisterSerializer,
    UserSerializer,
)
from rest_framework.response import Response


def parse_qty(value):
    try:
        qty = int(value)
    except (TypeError, ValueError):
        return None

    if qty < 1:
        return None

    return qty


def xendit_amount(value):
    return int(Decimal(value).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def frontend_url(path, external_id):
    base_url = settings.FRONTEND_BASE_URL.rstrip('/')
    return f'{base_url}{path}?external_id={external_id}'


def build_xendit_payload(request, cart_items, total_price, external_id):
    items = []
    for item in cart_items:
        product = item.product
        items.append({
            'name': product.product_name,
            'quantity': item.qty,
            'price': xendit_amount(product.product_price),
            'category': product.brand or 'Product',
        })

    payload = {
        'external_id': external_id,
        'amount': xendit_amount(total_price),
        'description': f'Rivansh checkout #{external_id}',
        'currency': settings.XENDIT_CURRENCY,
        'invoice_duration': 86400,
        'success_redirect_url': frontend_url('/checkout/success', external_id),
        'failure_redirect_url': frontend_url('/checkout/failed', external_id),
        'items': items,
        'metadata': {
            'user_id': request.user.id,
        },
        'should_send_email': False,
    }

    if request.user.email:
        payload['customer'] = {
            'given_names': request.user.username,
            'email': request.user.email,
        }

    return payload


def create_xendit_invoice(payload):
    return requests.post(
        'https://api.xendit.co/v2/invoices',
        auth=(settings.XENDIT_SECRET_KEY, ''),
        json=payload,
        timeout=20,
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_by_id(request, pk):
    try:
        product = Product.objects.get(id=pk)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ProductSerializer(product)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    qty = parse_qty(request.data.get('qty', 1))

    if product_id is None:
        return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    if qty is None:
        return Response({'error': 'Quantity must be at least 1'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    cart_item, created = CartUser.objects.get_or_create(user=request.user, product=product)

    if created:
        cart_item.qty = qty
    else:
        cart_item.qty = cart_item.qty + qty

    cart_item.save()
    serializer = CartUserSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, pk):
    qty = parse_qty(request.data.get('qty'))
    if qty is None:
        return Response(
            {'error': 'Quantity must be at least 1'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        cart_item = CartUser.objects.get(id=pk, user=request.user)
    except CartUser.DoesNotExist:
        return Response(
            {'error': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    cart_item.qty = qty
    cart_item.save()
    serializer = CartUserSerializer(cart_item)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def read_cart(request):
    cart_items = CartUser.objects.filter(user=request.user)
    serializer = CartUserSerializer(cart_items, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, pk):
    try:
        cart_item = CartUser.objects.get(id=pk, user=request.user)
    except CartUser.DoesNotExist:
        return Response(
            {'error': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    cart_item.delete()
    return Response(
        {'message': 'Product removed from cart'},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout(request):
    if not settings.XENDIT_SECRET_KEY:
        return Response(
            {'error': 'Xendit secret key is not configured.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    cart_items = list(
        CartUser.objects.select_related('product').filter(user=request.user)
    )
    if not cart_items:
        return Response(
            {'error': 'Your cart is empty.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    total_price = sum(
        (item.product.product_price * item.qty for item in cart_items),
        Decimal('0.00'),
    )
    if total_price <= 0:
        return Response(
            {'error': 'Checkout total must be greater than zero.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    external_id = f'checkout-{request.user.id}-{uuid4().hex}'
    cart_item_ids = [item.id for item in cart_items]

    with transaction.atomic():
        payment = paymentMethod.objects.create(
            user=request.user,
            totalPrice=total_price,
            xendit_external_id=external_id,
            xendit_status='PENDING',
        )
        orderItem.objects.bulk_create([
            orderItem(
                product=item.product,
                payment=payment,
                qty=item.qty,
                price=item.product.product_price,
            )
            for item in cart_items
        ])

    payload = build_xendit_payload(request, cart_items, total_price, external_id)

    try:
        xendit_response = create_xendit_invoice(payload)
        xendit_data = xendit_response.json()
    except requests.RequestException:
        payment.delete()
        return Response(
            {'error': 'Unable to create Xendit invoice.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    except ValueError:
        payment.delete()
        return Response(
            {'error': 'Xendit returned an invalid invoice response.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if not xendit_response.ok:
        payment.delete()
        return Response(
            {
                'error': 'Xendit invoice creation failed.',
                'details': xendit_data,
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    invoice_url = xendit_data.get('invoice_url')
    if not invoice_url:
        payment.delete()
        return Response(
            {'error': 'Xendit did not return an invoice URL.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    payment.xendit_invoice_id = xendit_data.get('id', '')
    payment.xendit_invoice_url = invoice_url
    payment.xendit_status = xendit_data.get('status', 'PENDING')
    payment.save(update_fields=[
        'xendit_invoice_id',
        'xendit_invoice_url',
        'xendit_status',
    ])
    CartUser.objects.filter(id__in=cart_item_ids, user=request.user).delete()

    serializer = PaymentMethodSerializer(payment)
    return Response(
        {
            'invoice_url': invoice_url,
            'external_id': external_id,
            'payment': serializer.data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkout_status(request, external_id):
    try:
        payment = paymentMethod.objects.get(
            user=request.user,
            xendit_external_id=external_id,
        )
    except paymentMethod.DoesNotExist:
        return Response(
            {'error': 'Checkout was not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = PaymentMethodSerializer(payment)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def xendit_checkout_webhook(request):
    expected_token = settings.XENDIT_WEBHOOK_TOKEN
    if not expected_token:
        return Response(
            {'error': 'Xendit webhook token is not configured.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if request.headers.get('x-callback-token') != expected_token:
        return Response(
            {'error': 'Invalid Xendit callback token.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    payload = request.data.get('data') if isinstance(request.data, dict) else None
    if not isinstance(payload, dict):
        payload = request.data

    external_id = payload.get('external_id')
    if not external_id:
        return Response(
            {'error': 'external_id is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        payment = paymentMethod.objects.get(xendit_external_id=external_id)
    except paymentMethod.DoesNotExist:
        return Response(
            {'error': 'Payment was not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    xendit_status = payload.get('status', '').upper()
    invoice_id = payload.get('id', '')
    invoice_url = payload.get('invoice_url', '')

    if invoice_id:
        payment.xendit_invoice_id = invoice_id
    if invoice_url:
        payment.xendit_invoice_url = invoice_url

    if xendit_status == 'PAID':
        paid_amount = payload.get('paid_amount', payload.get('amount'))
        if paid_amount is not None:
            try:
                paid_amount = xendit_amount(paid_amount)
            except (ArithmeticError, TypeError, ValueError):
                return Response(
                    {'error': 'Invalid paid amount from Xendit.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if paid_amount != xendit_amount(payment.totalPrice):
                return Response(
                    {'error': 'Xendit paid amount does not match checkout total.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        payment.save(update_fields=['xendit_invoice_id', 'xendit_invoice_url'])
        payment.mark_paid()
        return Response({'message': 'Payment marked as paid.'})

    if xendit_status == 'EXPIRED':
        payment.xendit_status = 'EXPIRED'
        payment.save(update_fields=[
            'xendit_invoice_id',
            'xendit_invoice_url',
            'xendit_status',
        ])
        return Response({'message': 'Payment marked as expired.'})

    if xendit_status:
        payment.xendit_status = xendit_status
        payment.save(update_fields=[
            'xendit_invoice_id',
            'xendit_invoice_url',
            'xendit_status',
        ])

    return Response({'message': 'Webhook received.'})


@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        user_serializer = UserSerializer(user)
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
