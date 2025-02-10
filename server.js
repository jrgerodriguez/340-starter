/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session");
const pool = require("./database/");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const utilities = require("./utilities/");
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")


/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// bodyParser
/** In order to collect the values from the incoming request body (which comes from the form), we need to make the application aware of that functionality */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
/** This last line tells the express application to read and work with data sent via a URL as well as from a form, stored in the request object's body. The "extended: true" object is a configuration that allows rich objects and arrays to be parsed. */

//Cookie Parser
app.use(cookieParser())

app.use(utilities.checkJWTToken) //This will apply verification for all routes, however checkJWTToken will apply the next() function is the token is not present, this way users will be able to go to routes that don't have the middleware included (checkLogin), they will be able to see the home page for example without having a token but if they have the middleware, they will be directed to ("/account/login")


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);

//Index route
app.use("/account", accountRoute); //When there is an /account route, it will go through this route
app.use("/inv", inventoryRoute);
app.use("/error-link", utilities.handleErrors());
app.get("/", utilities.handleErrors(baseController.buildHome));

// File Not Found Route - must be last route in list, everytime there is an error, "next" will be used and the error hhandler will be triggered
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "The page you were looking for was not found.",
  });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let message;
  if (err.status === 404) {
    message = err.message;
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
  }
  res.render("errors/error", {
    title: err.status || "Server Error",
    message: message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
