const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

/** Routes for login and register */

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

/** Route yo register using post */
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

// Build the account management view
router.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountManagement) //Since this is the default location for account, it will applye the function to build the view
)

// Process the Update Account Information View
router.get("/update-account/:account_id", utilities.handleErrors(accountController.buildUpdateAccountInfo))


// Process the account information update
router.post(
    "/process-account-update",
    regValidate.accountInfoUpdateRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(accountController.processAccountUpdate)
)

// Process the password update
router.post(
    "/process-password-update",
    regValidate.passwordUpdateRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(accountController.processPasswordUpdate)
)

// Process Logout
router.get("/logout", utilities.handleErrors(accountController.processLogout))

// Build comments section
router.get("/comments/:account_id", utilities.validateAccountType, utilities.handleErrors(accountController.buildCommentsView))

// Register New Comment
router.post("/save-comment", 
    regValidate.newCommentRules(),
    regValidate.checkNewCommentData,
    utilities.handleErrors(accountController.registerNewComment))

// Eliminate Comment
router.get("/eliminate-comment/:comment_id", utilities.handleErrors(accountController.eliminateComment))


module.exports = router;