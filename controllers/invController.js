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
    title: className + " vehicles",
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


module.exports = invCont