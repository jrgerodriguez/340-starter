const invModel = require("../models/inventory-model");
const Util = {};

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

module.exports = Util;