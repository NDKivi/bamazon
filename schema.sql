CREATE DATABASE bamazon;
USE bamazon;
CREATE TABLE products (
	item_id SERIAL,
    product_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    price DECIMAL(20, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL
);