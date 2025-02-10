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
  let dropDownClassificationList = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    dropDownClassificationList
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
    let dropDownClassificationList = await utilities.buildClassificationList()

    req.flash(
      "notice",
      "The new classification was successfully added."
    );
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management", 
      nav,
      dropDownClassificationList
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
  let dropDownClassificationList = await utilities.buildClassificationList()

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
      dropDownClassificationList
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build the Edit/Modify View
 * ************************** */
invCont.buildEditView = async (req, res, next) => {
  const inventory_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const elementData = await invModel.getVehicleByInventoryId(inventory_id)
  const elementName = `${elementData[0].inv_make} ${elementData[0].inv_model}`
  let dropDownClassificationList = await utilities.buildClassificationList(elementData[0].classification_id)
  res.render("./inventory/edit-inventory", {
    title: `Edit ${elementName}`,
    nav,
    dropDownClassificationList: dropDownClassificationList,
    errors: null,
    inv_id: elementData[0].inv_id,
    inv_make: elementData[0].inv_make,
    inv_model: elementData[0].inv_model,
    inv_year: elementData[0].inv_year,
    inv_description: elementData[0].inv_description,
    inv_image: elementData[0].inv_image,
    inv_thumbnail: elementData[0].inv_thumbnail,
    inv_price: elementData[0].inv_price,
    inv_miles: elementData[0].inv_miles,
    inv_color: elementData[0].inv_color,
    classification_id: elementData[0].classification_id
  })
}

/* ***************************
 *  Update Inventory Element
 * ************************** */

invCont.updateInventory = async function(req, res, next) {
  let nav = await utilities.getNav();
  // let dropDownClassificationList = await utilities.buildClassificationList()

  const {inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;

  const updateResult = await invModel.updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);

  if(updateResult) {
    const elementName = `${inv_make} ${inv_model}`
    req.flash("notice", `The new ${elementName} was successfully updated.`);
    res.redirect("/inv/")
  } else {
    let dropDownClassificationList = await utilities.buildClassificationList(classification_id);
    const elementName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("./inventory/edit-inventory", {
      title: `Edit ${elementName}`,
      nav,
      dropDownClassificationList: dropDownClassificationList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
}

/* ***************************
 *  Build the Delete View
 * ************************** */
invCont.buildDeleteView = async (req, res, next) => {
  const inventory_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const elementData = await invModel.getVehicleByInventoryId(inventory_id)
  res.render("./inventory/delete-confirm", {
    title: `Confirm Delete`,
    nav,
    errors: null,
    inv_make: elementData[0].inv_make,
    inv_model: elementData[0].inv_model,
    inv_year: elementData[0].inv_year,
    inv_price: elementData[0].inv_price,
    inv_id: elementData[0].inv_id,
  })
}

/* ***************************
 *  Process Deletion of the Inventory Element
 * ************************** */

invCont.deleteInventoryElement = async function(req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  console.log(`This is the inventory id: ${inv_id}`)
  const processDelete = await invModel.deleteVehicleByInventoryId(inv_id)

  if (processDelete) {
    req.flash("notice", "The deletion was successfully processed.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont

