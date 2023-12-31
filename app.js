/**************************************************************************
 * ******** ITE5315 – Assignment 2
 * * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * * No part of this assignment has been copied manually or electronically from any other source
 * * (including web sites) or distributed to other students.
 * ** Name: Eswar Kumar Kota Student ID: N01538388 Date: 11-02-2023*
 * *********************************************************************************/

// Importing  express modules
var express = require("express");
var path = require("path");
const fs = require("fs").promises;
const handlebars = require("handlebars");

// Creating an Express application
var app = express();

// Define the port as either port number specified in environment or use default 3000
const port = process.env.PORT || 3000;

// Set up static file serving middleware to serve files from the 'public' directory
app.use(express.static(path.join(__dirname, "public"))); // to access static files
app.set("views", path.join(__dirname, "views")); // for Vercel.json made this folder public
app.use("/public", express.static("public"));

//Setting Express-handlebars as the template engine
const exphbs = require("express-handlebars");
const hbs = exphbs.create({
  extname: ".hbs",
  helpers: {
    jsonPrettyPrint: function (jsonData) {//JSON data with formatting
      return JSON.stringify(jsonData, null, 2);
    },
    highlightZeroRating: function (rating) {//apply the "zero" class to ratings when they are 0.
      return rating === 0 ? "zero" : rating;
    },
    eq: function (a, b) {// check if two values are equal
      return a === b;
    },
  },
});
app.engine("hbs", hbs.engine);// register handlebar as templet engine
app.set("view engine", "hbs");//setting the default view engine

(async () => {
  //IIFE - Immediately Invoked Function Expression
  try {
    const data = await fs.readFile(
      path.join(__dirname, "SuperSales.json"),
      "utf-8"
    );
    jsonData = JSON.parse(data);
    console.log("JSON Data Loaded:");
  } catch (error) {
    console.error("Error loading JSON data:", error);
  }
})();

// New route 1

app.get("/data", async (req, res) => {
  try {
    console.log(jsonData);
    res.render("data", { title: "Data Page", jsonData: jsonData });
  } catch (error) {
    console.error("Error rendering 'data' view:", error);
    res.status(500).send("Internal Server Error");
  }
});

// New route 2

app.get("/data/invoiceNo/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    console.log(index);
    if (index < 0 || index >= jsonData.length) {
      // Error handling for wrong entry
      res
        .status(400)
        .send('<h1 style="color:red;">Invalid index provided</h1>');
      return;
    }
    const invoiceNo = jsonData[index]?.["Invoice ID"];
    console.log(invoiceNo);
    if (invoiceNo) {
      const renderedHtml = await hbs.render("views/invoiceNo.hbs", { title: "Invoice Number Page", index: index, invoiceNo: invoiceNo });
      res.send(renderedHtml);
    }
  } catch (error) {
    console.error("Error finding Invoice Number", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route 3
app.get("/search/productLine", (req, res) => {
  res.render("productLineSearchForm");// for ProductLine search form
});

// Handling the product line search form after submission
app.get("/search/productLine/result", async (req, res) => {
  try {
    const searchProductLine = req.query.productLine;
    console.log("Search Product Line:", searchProductLine);
    const matchingProducts = jsonData.filter(
      (product) => product["Product line"] === searchProductLine
    );

    if (matchingProducts.length > 0) {
      res.render("productSearchResults", { products: matchingProducts });
    } else {
      res.render("noMatchingProductLine");
    }
  } catch (error) {
    console.error("Error processing search:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Route 4

app.get("/search/invoiceID", async (req, res) => {
  res.render("searchInvoiceIDForm");
});

// Handling the Invoice search form after submission
app.get("/search/invoiceID/result", async (req, res) => {
  try {
    const searchInvoiceID = req.query.invoiceID;
    console.log("Search Invoice ID:", searchInvoiceID);

    const matchingInvoices = jsonData.filter(
      (item) => item["Invoice ID"] === searchInvoiceID
    );

    if (matchingInvoices.length > 0) {
      res.render("searchInvoiceIDResult", { invoices: matchingInvoices });
    } else {
      res.render("noMatchingInvoiceID");
    }
  } catch (error) {
    console.error("Error processing search:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Route 7
app.get("/viewData", (req, res) => {
  res.render("viewData", { salesData: jsonData });
});

//Route 8
app.get("/viewName", (req, res) => {
  res.render("viewName", { salesData: jsonData });
});

// Route 9
app.get("/viewRatings", (req, res) => {
  res.render("zeroHelper", { salesData: jsonData });
});

// Route 10a
app.get("/viewRatings10a", (req, res) => {
  res.render("viewData10a", { salesData: jsonData });
});

// Route 10b
app.get("/viewRatings10b", (req, res) => {
  res.render("viewData10b", { salesData: jsonData });
});


// Render the 'index.hbs' view and passing data(title) to it
app.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});

// Route handler for the '/users' route
app.get("/users", function (req, res) {
  res.send("respond with a resource");
});

// Handle wrong routes and also passing data to error.hbs
app.get("*", function (req, res) {
  res.render("error", { title: "Error", message: "Wrong Route" });
});
// Start the server and listen to port specified
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app