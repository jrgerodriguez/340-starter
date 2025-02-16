const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config()
const accModel = require("../models/account-model");

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul class='ul'>"
  list += '<li class="li"><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li class='li'>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* **************************************
* Build the Individual Vehicle view HTML
* ************************************ */

Util.buildVehicleContent = async function(data) {
  function addComma(number) {
    const numberToString = number.toString()
    if (numberToString > 2) {
      return numberToString.slice(0,2) + "," + numberToString.slice(2);
    }
  }
  let content // Inicializamos la variable content
  if (data.length > 0) {
    const makeAndModel = `${data[0].inv_make} ${data[0].inv_model}`;
    content = '<div class="individual-vehicle-container">'
    content += '<div class="image-container"><img src="' + data[0].inv_thumbnail 
    + '" alt="Image of ' + makeAndModel
    + ' on CSE Motors" /></div>';
    content += '<div class="information-container">';
    content += '<p class="title">' + makeAndModel + '</p>';
    content += '<p>' + 'Price: $' + '<span class="price">' + addComma(data[0].inv_price) + '</span>' + '</p>';
    content += '<p>' + 'Description: ' + '<span class="description">' + data[0].inv_description + '</span>' + '</p>';
    content += '<p>' + 'Color: ' + '<span class="color">' + data[0].inv_color + '</span>' + '</p>';
    content += '<p>' + 'Miles: ' + '<span class="miles">' + addComma(data[0].inv_miles) + '</span>' + '</p>';
    content += '</div>'
    content += '</div>';
  } else {
    content = '<p class="notice">Sorry, no details could be found.</p>'; // Reemplazamos directamente el contenido
  }
  return content;
}


/* **************************************
* Build the select element drop-down list
* ************************************ */

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>- Choose a Classification -</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      String(row.classification_id) === String(classification_id)
    ) {
      classificationList += " selected"
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => { //THIS FUNCTION ASSIGNS A NUMBER 1 TO LOGGEING IN CASE THERE IS A VALID TOKEN, IF NOT THIS FUNCTION DOES NOT STOP THE PROCESS, LET'S THE FLOW CONTINUES BUT IF THE ROUTE HAS THE MIDDLEWARE checkLogin, THE FLOW WILL BE STOPPED BY THAT MIDDLEWARE IF THAT NUMBER 1 IS NOT PRESENT. IN A FEW WORDS THIS FUNCTION KIND OF LET'S checkLogin KNOW WHO HAS A VALID TOKEN.
  if (req.cookies.jwt) {
   jwt.verify( //if the cookie exists, uses the jsonwebtoken "verify" function to check the validity of the token. The function takes three arguments: 1) the token (from the cookie), 2) the secret value stored as an environment variable, and 3) a callback function.
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) { //the callback function (which returns an error or the account data from the token payload).
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1

     next()
    })
  } else {
    res.locals.loggedin = 0
   next()
  }
 }


 /* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.validateAccountType = (req, res, next) => {
  if (res.locals.loggedin === 1 && (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin")) {
    next()
  } if (res.locals.loggedin === 1 && res.locals.accountData.account_type === "Client") {
    req.flash("notice", "You should be Admin or Employee to access.")
    return res.redirect("/account/login")
  } if (res.locals.loggedin !== 1) {
  req.flash("notice", "Please Login.")
  return res.redirect("/account/login");
}
}

/* ****************************************
 *  Make all Comments View
 * ************************************ */

Util.displayComments = async function(data, account_id) {
  let list = `<ul class="comments-ul">`
  data.rows.forEach((row) => {
    list += `<li class="comments-element">
    <p class="comments-content">${row.comment}</p>
    <p class="comments-name">Created By: ${row.account_firstname} ${row.account_lastname}</p>
    <p class="comments-date">${row.date}</p>`
    if (parseInt(account_id) === row.account_id) {
    list += `<a href="#" class="small-button">Eliminate</a>`;
    list += `
    <div class="small-buttons-container">
      <p>Are you sure?</p>
      <div>
        <a href="/account/eliminate-comment/${row.comment_id}" class="confirm-deletion">Yes, delete it</a>
        <a href="#" class="cancel-deletion">Cancel</a>
      </div>
    </div>`;
    }
    list += `</li>`; 
  });
  list += "</ul>";
  return list;
};


module.exports = Util;