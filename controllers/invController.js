const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) { //req is the url that comes from inventory route
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " Vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by inventory id (each car)
This function will retrieve the information based on the parameter, get the view built in utilities and render it on inventory/vehicle. This function will use getVehicleByInventoryId
 * ************************** */

invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getVehicleByInventoryId(inventory_id)
  const content = await utilities.buildVehicleContent(data)
  let nav = await utilities.getNav()
  const year = data[0].inv_year
  const makeName = data[0].inv_make
  const modelName = data[0].inv_model
  res.render("./inventory/vehicle", {
    title: `${year} ${makeName} ${modelName}`,
    nav,
    content,
  })
}

/* ***************************
 *  Build Management view
 * ************************** */
invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
  })
}

/* ***************************
 *  Build New Classification view
 * ************************** */
invCont.buildNewClassification = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Register New Classification
 * ************************** */

invCont.registerNewClassification = async function(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  //We have to send the variables to a model to handle the query and insert data into the table
  const regClassification = await invModel.registerClassification(classification_name);

  if(regClassification) {

    let nav = await utilities.getNav();

    req.flash(
      "notice",
      "The new classification was successfully added."
    );
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management", 
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
    });
  }
}

/* ***************************
 *  Build New Inventory Form view
 * ************************** */
invCont.buildNewInventory = async function(req, res, next) {
  let nav = await utilities.getNav()
  let dropDownClassificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    dropDownClassificationList,
    errors: null,
  })
}

/* ***************************
 *  Register New Inventory Element
 * ************************** */

invCont.registerNewInventory = async function(req, res, next) {
  let nav = await utilities.getNav();

  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;

  const regInventory = await invModel.registerInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);

  if(regInventory) {

    req.flash(
      "notice",
      `The new ${inv_make} ${inv_model} was successfully added.`
    );
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management", 
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    let dropDownClassificationList = await utilities.buildClassificationList(classification_id);
    res.status(501).render("./inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      dropDownClassificationList,
    });
  }
}

module.exports = invCont