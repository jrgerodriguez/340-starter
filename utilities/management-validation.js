const utilities = require(".");
const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const validate = {};

/*  **********************************
 *  New Classification Validation Rules
 * ********************************* */
validate.newClassificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .matches(/^\S+$/, "g")
      .withMessage("Provide a correct classification name.")
      .custom(async (classification_name) => {
        const classificationExists = await invModel.checkExistingClassification(classification_name);
        if (classificationExists) {
          throw new Error("Classification already exists. Please enter a different one.");
        }
      })
  ];
};

/* ******************************
 * Check data and return errors or continue to add new class
 * ***************************** */

validate.checkClassificationData = async (req, res, next) => {
  const {classification_name} = req.body
  let errors = []
  errors = validationResult(req)
  if(!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors, 
      title: "Add New Classification",
      nav,
      classification_name
    })
    return   
  }
  next()
}

/*  **********************************
 *  New Classification Validation Rules
 * ********************************* */
validate.newInventoryRules = () => {
  return [
    body("classification_id")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage("Choose a classification."),

    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Provide a correct make name."),

      body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Provide a correct model name."),
      
      body("inv_year")
      .trim()
      .escape()
      .notEmpty().withMessage("Year is required.")
      .isInt().withMessage("Year must be a number.")
      .isLength({ min: 4, max: 4 })
      .withMessage("Provide a correct year (4 digits)."),

      body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10 })
      .withMessage("Provide a correct description with at least 10 characters."),

      body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Upload a picture."),

      body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Thumbnail cannot be empty."),

      body("inv_price")
      .trim()
      .escape()
      .notEmpty().withMessage("Price is required.")
      .isInt().withMessage("Price must be a number.")
      .isLength({ min: 1 })
      .withMessage("Provide a price."),

      body("inv_miles")
      .trim()
      .escape()
      .notEmpty().withMessage("Mileage is required.")
      .isInt().withMessage("Mileage must be a number.")
      .isLength({ min: 1 })
      .withMessage("Provide the mileage."),

      body("inv_color")
      .trim()
      .escape()
      .notEmpty().withMessage("Color is required.")
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("Color must contain only letters.")
      .isLength({ min: 1 })
      .withMessage("Provide a color.")
  ];
};

/* ******************************
 * Check data and return errors or continue to add new inventory element
 * ***************************** */

validate.checkInventoryData = async (req, res, next) => {
  const {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id} = req.body
  let errors = []
  errors = validationResult(req)
  if(!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let dropDownClassificationList = await utilities.buildClassificationList(classification_id);
    res.render("inventory/add-inventory", {
      errors, 
      title: "Add New Inventory",
      nav,
      dropDownClassificationList,
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    })
    return   
  }
  next()
}


/* ******************************
 * Check data and return errors or continue to edit inventory element
 * ***************************** */

validate.checkUpdateData = async (req, res, next) => {
  const {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id} = req.body
  let errors = []
  errors = validationResult(req)
  if(!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const elementData = await invModel.getVehicleByInventoryId(inventory_id)
    const elementName = `${elementData[0].inv_make} ${elementData[0].inv_model}`
    let dropDownClassificationList = await utilities.buildClassificationList(classification_id);
    res.render("./inventory/edit-inventory", {
      errors, 
      title: `Edit ${elementName}`,
      nav,
      dropDownClassificationList,
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id
    })
    return   
  }
  next()
}

module.exports = validate
