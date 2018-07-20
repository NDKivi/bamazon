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
ADD COLUMN product_sales DECIMAL(20, 2) DEFAULT 0.00;

ALTER TABLE products
ADD department_id BIGINT UNSIGNED;
ALTER TABLE products
ADD CONSTRAINT fk_department_id FOREIGN KEY (department_id) REFERENCES departments(department_id);

CREATE TABLE departments (
	department_id SERIAL,
    department_name VARCHAR(255),
	over_head_costs DECIMAL(20, 2)
);