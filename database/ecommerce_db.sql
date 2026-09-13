-- ============================================================
-- E-Commerce Database Schema
-- Database: ecommerce_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;

-- -------------------------------------------------------
-- Table: users
-- -------------------------------------------------------
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar VARCHAR(255) DEFAULT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expiry DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: categories
-- -------------------------------------------------------
CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: products
-- -------------------------------------------------------
CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2) DEFAULT NULL,
  stock INT NOT NULL DEFAULT 0,
  images JSON DEFAULT NULL,
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_category (category_id),
  INDEX idx_slug (slug),
  INDEX idx_price (price),
  INDEX idx_featured (is_featured),
  FULLTEXT INDEX ft_search (name, description, brand)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: cart
-- -------------------------------------------------------
CREATE TABLE cart (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: addresses
-- -------------------------------------------------------
CREATE TABLE addresses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: orders
-- -------------------------------------------------------
CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  payment_method ENUM('cod','razorpay','stripe') NOT NULL DEFAULT 'cod',
  payment_status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSON NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: order_items
-- -------------------------------------------------------
CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_image VARCHAR(255),
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: payments
-- -------------------------------------------------------
CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL UNIQUE,
  payment_gateway VARCHAR(50),
  gateway_order_id VARCHAR(255),
  gateway_payment_id VARCHAR(255),
  gateway_signature VARCHAR(512),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: reviews
-- -------------------------------------------------------
CREATE TABLE reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  comment TEXT,
  is_approved TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product_review (user_id, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: wishlist
-- -------------------------------------------------------
CREATE TABLE wishlist (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product_wish (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Seed Data: Categories
-- -------------------------------------------------------
INSERT INTO categories (name, slug, description, image, is_active) VALUES
('Electronics',    'electronics',    'Phones, Laptops, Gadgets & more',     'electronics.jpg',    1),
('Clothing',       'clothing',       'Men, Women & Kids Fashion',            'clothing.jpg',       1),
('Books',          'books',          'Fiction, Non-Fiction, Textbooks',      'books.jpg',          1),
('Home & Kitchen', 'home-kitchen',   'Appliances, Furniture & Decor',        'home-kitchen.jpg',   1),
('Sports',         'sports',         'Fitness, Outdoor & Sports gear',       'sports.jpg',         1),
('Beauty',         'beauty',         'Skincare, Makeup & Wellness',          'beauty.jpg',         1);

-- -------------------------------------------------------
-- Seed Data: Admin User  (password: Admin@123)
-- -------------------------------------------------------
INSERT INTO users (name, email, password, phone, role, is_verified) VALUES
('Admin User', 'admin@shopease.com', '$2b$12$K8GpDMbdmvd5zxG8kcLmfOmwwvVbS4ZO5bG8XpDhEf8Nxz9qIBEDi', '9999999999', 'admin', 1),
('John Doe',   'john@example.com',  '$2b$12$K8GpDMbdmvd5zxG8kcLmfOmwwvVbS4ZO5bG8XpDhEf8Nxz9qIBEDi', '8888888888', 'user',  1);

-- -------------------------------------------------------
-- Seed Data: Products
-- -------------------------------------------------------
INSERT INTO products (category_id, name, slug, description, price, discount_price, stock, images, brand, sku, is_active, is_featured) VALUES
(1, 'iPhone 15 Pro', 'iphone-15-pro', 'Apple iPhone 15 Pro with A17 Pro chip, 48MP camera system, and titanium design.', 134900.00, 129900.00, 50, '["iphone15pro_1.jpg","iphone15pro_2.jpg"]', 'Apple', 'APPL-IP15P-001', 1, 1),
(1, 'Samsung Galaxy S24', 'samsung-galaxy-s24', 'Samsung Galaxy S24 with Snapdragon 8 Gen 3, 50MP camera, 6.2-inch display.', 79999.00, 74999.00, 80, '["s24_1.jpg","s24_2.jpg"]', 'Samsung', 'SMSN-S24-001', 1, 1),
(1, 'MacBook Air M3', 'macbook-air-m3', 'Apple MacBook Air with M3 chip, 13.6-inch Liquid Retina display, 18-hour battery.', 114900.00, 109900.00, 30, '["macbook_m3_1.jpg"]', 'Apple', 'APPL-MBA-M3-001', 1, 1),
(1, 'Sony WH-1000XM5', 'sony-wh-1000xm5', 'Industry-leading noise canceling wireless headphones with 30-hour battery life.', 29990.00, 24990.00, 100, '["sony_xm5_1.jpg"]', 'Sony', 'SONY-WH1000XM5', 1, 0),
(2, 'Classic White T-Shirt', 'classic-white-tshirt', 'Premium 100% cotton crew neck t-shirt. Available in all sizes.', 799.00, 599.00, 200, '["tshirt_white_1.jpg"]', 'H&M', 'HM-TSHRT-WHT', 1, 0),
(2, 'Slim Fit Jeans', 'slim-fit-jeans', 'Comfortable slim fit stretch denim jeans for everyday wear.', 2499.00, 1999.00, 150, '["jeans_slim_1.jpg"]', 'Levi\'s', 'LVS-JEANS-SLM', 1, 1),
(3, 'Atomic Habits', 'atomic-habits', 'An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear.', 499.00, 349.00, 300, '["atomic_habits.jpg"]', 'Penguin Books', 'PGB-ATHBT-001', 1, 1),
(3, 'The Pragmatic Programmer', 'the-pragmatic-programmer', 'Your journey to mastery — 20th Anniversary Edition by David Thomas & Andrew Hunt.', 799.00, 649.00, 120, '["pragmatic_prog.jpg"]', 'Addison-Wesley', 'AW-TPP-20AE', 1, 0),
(4, 'Instant Pot Duo 7-in-1', 'instant-pot-duo-7in1', '7-in-1 Multi-Use Programmable Pressure Cooker, Slow Cooker, Rice Cooker.', 8999.00, 6999.00, 60, '["instantpot.jpg"]', 'Instant Pot', 'IP-DUO-7IN1', 1, 1),
(5, 'Yoga Mat Premium', 'yoga-mat-premium', 'Non-slip 6mm thick eco-friendly TPE yoga mat with carrying strap.', 1299.00, 999.00, 250, '["yogamat.jpg"]', 'Boldfit', 'BF-YOGA-MAT', 1, 0),
(6, 'Vitamin C Serum', 'vitamin-c-serum', '20% Vitamin C + E + Ferulic Acid brightening serum for radiant skin.', 1499.00, 1199.00, 180, '["vitcserum.jpg"]', 'Minimalist', 'MIN-VTC-SRM', 1, 1),
(1, 'Logitech MX Master 3S', 'logitech-mx-master-3s', 'Advanced wireless mouse with ultra-fast MagSpeed scrolling and ergonomic design.', 9995.00, 8495.00, 75, '["mx_master3s.jpg"]', 'Logitech', 'LOGI-MXM3S', 1, 0);

-- -------------------------------------------------------
-- Seed Data: Reviews
-- -------------------------------------------------------
INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES
(1, 2, 5, 'Excellent Phone!', 'Best iPhone ever. The camera quality is outstanding and battery lasts all day.'),
(2, 2, 4, 'Great Android Phone', 'Smooth performance, great display. Slightly warm during heavy use.'),
(7, 2, 5, 'Life Changing Book', 'This book completely changed how I approach habits. Highly recommended!');

-- Update product ratings
UPDATE products SET rating_avg = 5.0, rating_count = 1 WHERE id = 1;
UPDATE products SET rating_avg = 4.0, rating_count = 1 WHERE id = 2;
UPDATE products SET rating_avg = 5.0, rating_count = 1 WHERE id = 7;
