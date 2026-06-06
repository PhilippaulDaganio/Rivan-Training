from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),       
    path('products/', views.product_list, name='product-list'),
    path('products/<int:pk>/', views.get_product_by_id, name='get-product-by-id'),
    path('cart/', views.read_cart, name='read-cart'),
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/update/<int:pk>/', views.update_cart_item, name='update-cart-item'),
    path('cart/remove/<int:pk>/', views.remove_from_cart, name='remove-from-cart'),
    path('checkout/', views.create_checkout, name='create-checkout'),
    path('checkout/status/<str:external_id>/', views.checkout_status, name='checkout-status'),
    path('checkout/xendit/webhook/', views.xendit_checkout_webhook, name='xendit-checkout-webhook'),

    path('register/', views.register_user, name='register-user'),
    path('user-profile/', views.get_user_profile, name='user-profile'),
      
]
