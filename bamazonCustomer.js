let mysql = require("mysql");
let inquirer = require("inquirer");
let chalk = require("chalk");

let connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (error) {
    if (error) throw error;
    console.log("connectedb")
    showProducts();
});

function showProducts() {
    connection.query("SELECT * FROM products", function (error, results) {
        if (error) throw error;
        let productHash = [];
        console.log(chalk.cyan.bold("Products for sale\n") + chalk.underline("ID - Price - Product"));
        for (let i = 0; i < results.length; i++) {
            console.log(chalk.bold(results[i].item_id) + " - " + chalk.green("$" + results[i].price) + " - " + results[i].product_name);
            productHash[results[i].item_id] = {
                "price": results[i].price,
                "product_name": results[i].product_name,
                "stock_quantity": results[i].stock_quantity,
                "product_sales": results[i].product_sales
            };
        }
        console.log("-------------------------------------");
        inquirer.prompt([{
            type: "input",
            message: "Enter the product ID of the one you wish to purchase:",
            name: "selectedProduct"
        }]).then(function (inquirerResults) {
            let inputNumber = parseInt(inquirerResults.selectedProduct);
            if (productHash[inputNumber]) {
                askQuantity(inputNumber, productHash[inputNumber]);
            } else {
                console.log("Not a valid product ID.");
                connection.end();
            }
        })
    });
}

function askQuantity(item_id, product) {
    inquirer.prompt({
        type: "input",
        message: "How many do you want?",
        name: "quantityDemanded"
    }).then(function (secondInquirerResponse) {
        let quantity = parseInt(secondInquirerResponse.quantityDemanded);
        if (quantity && quantity > 0) {
            if (quantity <= product.stock_quantity) {
                let totalCost = quantity * product.price;
                console.log("You purchased " + quantity + " of " + product.product_name + " for a total of $" + totalCost);
                reduceStock(item_id, product.stock_quantity - quantity);
                increaseSales(item_id, product.product_sales + totalCost);
            } else {
                console.log("Insufficient quantity !  Only " + product.stock_quantity + " are in stock.  Sorry!");
                connection.end();
            }
        } else {
            console.log("Invalid quantity entered.");
            connection.end();
        }
    })
}

function reduceStock(item_id, newQuantity) {
    connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [newQuantity, item_id], function(error, results) {
        if (error) throw error;
        console.log("quantity updated!")
    });
}

function increaseSales(item_id, product_sales) {
    connection.query("UPDATE products SET product_sales = ? WHERE item_id = ?", [product_sales, item_id], function(error, results) {
        if (error) throw error;
        console.log("product sales updated!")
        connection.end();
    });
}