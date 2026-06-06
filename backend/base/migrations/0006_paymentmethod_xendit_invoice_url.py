# Generated for Xendit hosted checkout invoice URLs.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0005_remove_cartuser_cart_id_cartuser_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='paymentmethod',
            name='xendit_invoice_url',
            field=models.URLField(blank=True, default='', max_length=500),
        ),
    ]
