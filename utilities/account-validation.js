const utilities = require(".");
const { body, validationResult } = require("express-validator"); //body allows the validator to access the body object of the request which contains all the data. The validationResult object contains all errors detected by the validation process, basically it retrieves all errors and body accesses the data.
const accountModel = require("../models/account-model")
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname") //looks inside the HTTPRequest body for a name - value pair
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email)
      if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
      }
    }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) { //If empty return these elements to make the view and stay on register
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required."),

    body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),

  ]
}

/* ******************************
 * Check data and return errors or continue to Login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) { //If empty return these elements to make the view and stay on register
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}


/*  **********************************
 *  Account Information Update Rules
 * ********************************* */
validate.accountInfoUpdateRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname") //looks inside the HTTPRequest body for a name - value pair
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email, {req}) => {
      const originalAccount = await accountModel.getAccountById(req.body.account_id);
      const originalEmail = originalAccount ? originalAccount.account_email : null;
      console.log(req.body.account_id)
      console.log(originalEmail)
      console.log(account_email)
      if (account_email !== originalEmail && await accountModel.checkExistingEmail(account_email)) {
        throw new Error("This email is already in use.");
      }
    }),
  ];
};

/* ******************************
 * Check data and return errors or continue to Update Account Information
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) { //If empty return these elements to make the view and stay on register
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
    return
  }
  next()
}

/*  **********************************
 * Password Update Rules
 * ********************************* */
validate.passwordUpdateRules = () => {
return [
    body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),

  ]
}

/*  **********************************
 *  New Comment Validation Rules
 * ********************************* */
validate.newCommentRules = () => {
  return [
    body("comment")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Submit a comment, field cannot be empty."),
  ];
};

/* ******************************
 * Check data and return errors or continue to register comment
 * ***************************** */

validate.checkNewCommentData = async (req, res, next) => {
  let errors = []
  errors = validationResult(req)
  if(!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const { account_id } = req.body;
    const data = await accountModel.getAllComments()
    const comments = await utilities.displayComments(data, account_id) 
    res.render("./account/comments", {
      title: "Comments",
      nav,
      errors,
      comments
    })
    return   
  }
  next()
}

module.exports = validate