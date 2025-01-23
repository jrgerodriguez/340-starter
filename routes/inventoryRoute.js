// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Just the Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId); //This will get the classificationId and use the method buildByClassificationId from the object invController.

module.exports = router;

