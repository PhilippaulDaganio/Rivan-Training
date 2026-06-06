from rest_framework import serializers
from .models import CartUser, Product, orderItem, paymentMethod
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )
    class Meta: 
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class CartUserSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartUser
        fields = [
            'id',
            'product',
            'product_id',
            'qty',
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = orderItem
        fields = [
            'id',
            'product',
            'qty',
            'price',
            'subtotal',
        ]

    def get_subtotal(self, obj):
        return obj.price * obj.qty


class PaymentMethodSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = paymentMethod
        fields = [
            'id',
            'totalPrice',
            'isPaid',
            'paidAt',
            'xendit_invoice_id',
            'xendit_invoice_url',
            'xendit_external_id',
            'xendit_status',
            'items',
        ]

    def get_items(self, obj):
        items = orderItem.objects.filter(payment=obj)
        return OrderItemSerializer(items, many=True).data
