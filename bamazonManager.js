const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const { table } = require('table');

const tableConfig = {
    columns: {
        0: {
            alignment: 'right',
        },
        1: {
            alignment: 'left',
        },
        2: {
            alignment: 'right',
        },
        3: {
            alignment: 'right',
        }
    }
};

let connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (error) {
    if (error) throw error;
    mainPrompt();
});

function mainPrompt() {
    inquirer.prompt([
        {
            name: "action",
            type: "list",
            message: "Choose your next action:",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "QUIT"
            ]
        }
    ]).then(function (inquirerResults) {
        switch (inquirerResults.action) {
            case "View Products for Sale":
                viewProducts(false);
                break;
            case "View Low Inventory":
                viewProducts(true);
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "QUIT":
                connection.end();
                break;
        }
    });
}

function viewProducts(isLowInventory) {
    let queryString;
    if (isLowInventory) {
        console.log(chalk.bold("Low Inventory Products"));
        queryString = "SELECT * FROM products WHERE stock_quantity < 6";
    } else {
        console.log(chalk.bold("All Products"));
        queryString = "SELECT * FROM products";
    }
    connection.query(queryString, function (error, queryResults) {
        let tableArray = [];
        tableArray.push(["ID", "Name", "Price", "Stock"]);

        for (let i = 0; i < queryResults.length; i++) {
            tableArray.push([queryResults[i].item_id, queryResults[i].product_name, "$" + queryResults[i].price.toFixed(2), queryResults[i].stock_quantity]);
        }
        let output = table(tableArray, tableConfig);
        console.log(output);
        connection.end();
    });
}

function addToInventory() {
    connection.query("SELECT * FROM products", function (error, queryResults) {
        let choices;
        choices = queryResults.map(function (currentItem) {
            return currentItem.item_id + "-" + currentItem.product_name + "|$"
                + currentItem.price + "|stock=" + currentItem.stock_quantity;
        });
        inquirer.prompt([
            {
                "name": "item",
                "type": "list",
                "choices": choices,
                "message": "Which product would you like to increase?"
            },
            {
                "name": "quantity",
                "type": "input",
                "message": "How many are you adding to the supply?"
            }
        ]).then(function (inquirerResults) {
            let str = inquirerResults.item;
            let item_id = parseInt(str.substr(0, str.indexOf("-")));
            let increase = parseInt(inquirerResults.quantity);
            let currentQuantity = parseInt(str.substr(str.lastIndexOf("=") + 1));
            if (increase && increase > 0) {
                updateStock(item_id, currentQuantity + increase);
            }

        });
    });
}

function addNewProduct() {
    inquirer.prompt([
        {
            name: "name",
            message: "Name of product:",
            type: "input"
        },
        {
            name: "department",
            message: "Department ID of product:",
            type: "input"
        },  
        {
            name: "price",
            message: "Price in dollars:",
            type: "input"
        },
        {
            name: "stock",
            message: "Initial quantity stocked:",
            type: "input"
        }
    ]).then(function (inquirerResults) {
        if (inquirerResults.name && inquirerResults.department && inquirerResults.price && inquirerResults.stock) {
            connection.query("INSERT INTO products (product_name, department_id, price, stock_quantity) VALUES (?, ?, ?, ?)", [inquirerResults.name, inquirerResults.department, parseFloat(inquirerResults.price).toFixed(2), parseInt(inquirerResults.stock)], function (error, results) {
                if (error) throw error;
                console.log("Product added.");
                connection.end();
            });
        }
    });
}

function updateStock(item_id, newQuantity) {
    connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [newQuantity, item_id], function (error, queryResults) {
        if (error) throw error;
        console.log("Stock updated.");
        connection.end();
    });
}