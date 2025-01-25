// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");

// Just the Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId)); //This will get the classificationId and use the method buildByClassificationId from the object invController.

//Route for each car based on inventory id, this will be used by buildInventoryID to get the parameter
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

module.exports = router;

