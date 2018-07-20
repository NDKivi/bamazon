CREATE DATABASE bamazon;
USE bamazon;
CREATE TABLE products (
	item_id SERIAL,
    product_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    price DECIMAL(20, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL
);

ALTER TABLE products
ADD COLUMN products_sales DECIMAL(20, 2) DEFAULT 0.00;