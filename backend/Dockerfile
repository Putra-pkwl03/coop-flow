# FROM php:8.4-fpm

# # Install dependencies sistem dan ekstensi PHP yang dibutuhkan Laravel & PostgreSQL
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     libpng-dev \
#     libjpeg62-turbo-dev \
#     libfreetype6-dev \
#     locales \
#     zip \
#     jpegoptim optipng pngquant gifsicle \
#     vim \
#     unzip \
#     git \
#     curl \
#     libonig-dev \
#     libzip-dev \
#     libpq-dev

# # Clear cache
# RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# # Install php extensions (sangat penting libpq-dev & pdo_pgsql untuk PostGIS)
# RUN docker-php-ext-install pdo_pgsql mbstring zip exif pcntl

# # Install Composer di dalam container
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# # Set working directory di dalam container
# WORKDIR /var/www

# # Salin semua source code backend ke dalam container
# COPY . .

# # Set permission agar web server bisa membaca file storage Laravel
# RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# EXPOSE 9000
# CMD ["php-fpm"]



FROM php:8.4-fpm

# 1. Install dependencies sistem dan ekstensi PHP
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libonig-dev \
    libzip-dev \
    libpq-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Install php extensions
RUN docker-php-ext-install pdo_pgsql mbstring zip exif pcntl

# 3. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Set working directory
WORKDIR /var/www

# 5. Salin semua source code
COPY . .

# 6. BANGET PENTING: Install dependensi composer (menghasilkan folder vendor/)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# 7. Set permission
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

# 8. Jalankan Laravel HTTP server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]