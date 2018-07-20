let mysql = require("mysql");
let inquirer = require("inquirer");
let chalk = require("chalk");
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
        },
        4: {
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
    inquirer.prompt([{
        name: "viewOrEnter",
        type: "list",
        message: "Select:",
        choices: ["View Product Sales by Department", "Add a New Department"]
    }]).then(function (results) {
        if (results.viewOrEnter === "View Product Sales by Department") {
            viewProducts();
        } else {
            addNewDepartment();
        }
    });
});

function viewProducts() {
    let sqlString = `
    SELECT departments.department_id as dep_id, departments.department_name as dep_name, 
        departments.over_head_costs AS over_head, SUM(products.product_sales) as total_sales, 
        (SUM(products.product_sales) - departments.over_head_costs) AS total_profit
    FROM departments
    LEFT JOIN products ON products.department_id = departments.department_id
    GROUP BY departments.department_id;
    `;
    connection.query(sqlString, function(error, queryResults) {
        if (error) throw error;
        let tableArray = [];
        tableArray.push(["ID", "Name", "Overhead Costs", "Total Sales", "Profit or Loss"]);

        for (let i = 0; i < queryResults.length; i++) {
            tableArray.push([
                queryResults[i].dep_id, 
                queryResults[i].dep_name, 
                "$" + queryResults[i].over_head, 
                "$" + queryResults[i].total_sales, 
                queryResults[i].total_profit
            ]);
        }
        let output = table(tableArray, tableConfig);
        console.log(output);
        connection.end();
    });
}

function addNewDepartment() {
    inquirer.prompt([{
        name: "department_name",
        type: "input",
        message: "Input new depatment name"
    },
    {
        name: "over_head_costs",
        type: "input",
        message: "What are the over-head costs?"
    }]).then(function (results) {
        let object = {
            "department_name": results.department_name,
            "over_head_costs": results.over_head_costs
        };
        connection.query("INSERT INTO departments SET ?", object, function(error, queryResults) {
            if (error) throw error;
            console.log("successfully added department");
            connection.end();
        });
    });
}