#!/bin/sh

# Cache konfigurasi & route agar lebih cepat di production
php artisan config:cache
php artisan route:cache

# Jalankan Queue Worker di background (&)
php artisan queue:work --tries=3 --timeout=90 &

# Jalankan Web Server di foreground (utama)
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}