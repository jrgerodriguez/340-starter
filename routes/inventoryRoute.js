// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const mgmtValidate = require('../utilities/management-validation')

// Just the Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId)); //This will get the classificationId and use the method buildByClassificationId from the object invController.

//Route for each car based on inventory id, this will be used by buildInventoryID to get the parameter
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

/** Route for management */
router.get("/", utilities.handleErrors(invController.buildManagement));

/** Route for add new classification */
router.get("/add-classification", utilities.handleErrors(invController.buildNewClassification));

/** Route for add new inventory */
router.get("/add-inventory", utilities.handleErrors(invController.buildNewInventory));

/** Post to add new classification */
router.post(
    "/add-classification",
    mgmtValidate.newClassificationRules(),
    mgmtValidate.checkClassificationData,
    utilities.handleErrors(invController.registerNewClassification)
);

/** Post to add new inventory element */
router.post(
    "/add-inventory",
    mgmtValidate.newInventoryRules(),
    mgmtValidate.checkInventoryData,
    utilities.handleErrors(invController.registerNewInventory)
);

module.exports = router;

