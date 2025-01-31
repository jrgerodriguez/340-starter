const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav(); //This will contain the string of HTML to generate the navigation bar
  // req.flash("notice", "This is a flash message.");
  res.render("index", { title: "Home", nav }); //What is stored in nav will be sent to index.
};

module.exports = baseController; //The object and therefore the buildHome method are exported to be used elsewhere.
