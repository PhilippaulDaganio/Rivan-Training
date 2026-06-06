from decimal import Decimal
from unittest.mock import Mock, patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from .models import CartUser, Product, orderItem, paymentMethod


@override_settings(
    XENDIT_SECRET_KEY='xnd_test_secret',
    XENDIT_WEBHOOK_TOKEN='xendit-webhook-token',
    XENDIT_CURRENCY='PHP',
    FRONTEND_BASE_URL='http://127.0.0.1:5173',
)
class CheckoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='checkout_user',
            email='checkout@example.com',
            password='test-password-123',
        )
        self.product = Product.objects.create(
            product_name='Catalyst 9200 Series Switch',
            product_price=Decimal('1000.00'),
            brand='Cisco',
            description='Access switch',
            countInStock=10,
        )

    def test_checkout_requires_authentication(self):
        response = self.client.post(reverse('create-checkout'))

        self.assertEqual(response.status_code, 401)

    def test_checkout_rejects_empty_cart(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(reverse('create-checkout'))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error'], 'Your cart is empty.')

    def test_checkout_creates_xendit_invoice_and_clears_cart(self):
        self.client.force_authenticate(self.user)
        CartUser.objects.create(user=self.user, product=self.product, qty=2)
        xendit_response = Mock(ok=True)
        xendit_response.json.return_value = {
            'id': 'inv_test_123',
            'status': 'PENDING',
            'invoice_url': 'https://checkout-staging.xendit.co/web/inv_test_123',
        }

        with patch('base.views.create_xendit_invoice', return_value=xendit_response):
            response = self.client.post(reverse('create-checkout'))

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['invoice_url'], xendit_response.json.return_value['invoice_url'])
        payment = paymentMethod.objects.get(user=self.user)
        self.assertEqual(payment.totalPrice, Decimal('2000.00'))
        self.assertEqual(payment.xendit_invoice_id, 'inv_test_123')
        self.assertEqual(payment.xendit_invoice_url, xendit_response.json.return_value['invoice_url'])
        self.assertEqual(orderItem.objects.filter(payment=payment).count(), 1)
        self.assertFalse(CartUser.objects.filter(user=self.user).exists())

    def test_webhook_rejects_invalid_callback_token(self):
        response = self.client.post(
            reverse('xendit-checkout-webhook'),
            {'external_id': 'checkout-test', 'status': 'PAID'},
            format='json',
            HTTP_X_CALLBACK_TOKEN='wrong-token',
        )

        self.assertEqual(response.status_code, 403)

    def test_paid_webhook_marks_payment_paid_without_duplicate_items(self):
        payment = paymentMethod.objects.create(
            user=self.user,
            totalPrice=Decimal('1000.00'),
            xendit_external_id='checkout-test-paid',
            xendit_status='PENDING',
        )
        orderItem.objects.create(
            product=self.product,
            payment=payment,
            qty=1,
            price=self.product.product_price,
        )
        payload = {
            'id': 'inv_paid_123',
            'external_id': 'checkout-test-paid',
            'status': 'PAID',
            'paid_amount': 1000,
        }

        for _ in range(2):
            response = self.client.post(
                reverse('xendit-checkout-webhook'),
                payload,
                format='json',
                HTTP_X_CALLBACK_TOKEN='xendit-webhook-token',
            )
            self.assertEqual(response.status_code, 200)

        payment.refresh_from_db()
        self.assertTrue(payment.isPaid)
        self.assertIsNotNone(payment.paidAt)
        self.assertEqual(payment.xendit_status, 'PAID')
        self.assertEqual(orderItem.objects.filter(payment=payment).count(), 1)

    def test_expired_webhook_updates_status_without_marking_paid(self):
        payment = paymentMethod.objects.create(
            user=self.user,
            totalPrice=Decimal('1000.00'),
            xendit_external_id='checkout-test-expired',
            xendit_status='PENDING',
        )

        response = self.client.post(
            reverse('xendit-checkout-webhook'),
            {
                'id': 'inv_expired_123',
                'external_id': 'checkout-test-expired',
                'status': 'EXPIRED',
            },
            format='json',
            HTTP_X_CALLBACK_TOKEN='xendit-webhook-token',
        )

        payment.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertFalse(payment.isPaid)
        self.assertEqual(payment.xendit_status, 'EXPIRED')
