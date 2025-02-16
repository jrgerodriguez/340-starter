const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body; //collects and stores the values from the HTML form that are being sent from the browser in the body of the request object. These are the "names" coming from the form which then will be sent to ccountModel.registerAccount as parameters.

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword);

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) { //If the user exists, create the token and go to /account/.
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/") //When directed to /account/, system will take us to the default location "/" in the routes file.
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("./account/account-management", {
    title: "Account Management",
    nav,
  }
  )
} 

/* ****************************************
 *  Deliver Update Account Info view
 * *************************************** */
async function buildUpdateAccountInfo(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav();
  const elementData = await accountModel.getAccountById(account_id)
  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_firstname: elementData.account_firstname,
    account_lastname: elementData.account_lastname,
    account_email: elementData.account_email,
    account_id: elementData.account_id
  });
}

/* ****************************************
 *  Process Account Update
 * *************************************** */
async function processAccountUpdate(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id} = req.body; 
  const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id);

  if (updateResult) {
    req.flash(
      "notice",
      "Your account has been successfully updated."
      
    );
    // Rebuild the JWT with new data
    delete updateResult.account_password;
    const accessToken = jwt.sign(updateResult, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 3600 * 1000,
    });
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    res.status(201).render("./account/account-management", {
      title: "Account Management",
      nav,
      account_firstname
    });
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    });
  }
  }


/* ****************************************
 *  Process Password Update
 * *************************************** */
async function processPasswordUpdate(req, res) {
  let nav = await utilities.getNav();
  const { account_password, account_id} = req.body; 

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const updateResult = await accountModel.updatePassword(hashedPassword, account_id);
  if (updateResult) {
    req.flash(
      "notice",
      "Your password has been successfully updated."
      
    );

    res.status(201).render("./account/account-management", {
      title: "Account Management",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,

    });
  }
  }

  /* ****************************************
 *  Process Logout
 * ************************************ */

async function processLogout(req, res) {
  res.clearCookie("jwt", { path: "/" });
  res.locals.loggedin = 0;
  res.redirect("/");
}

  /* ****************************************
 *  Build Comments View
 * ************************************ */
async function buildCommentsView(req, res) {
  const account_id = req.params.account_id
  let nav = await utilities.getNav()
  const data = await accountModel.getAllComments()
  const comments = await utilities.displayComments(data, account_id) 
  res.render("./account/comments", {
    title: "Comments",
    nav,
    errors:null,
    comments
  }
  )
} 

/* ****************************************
 *  Register New Comment
 * ************************************ */
  async function registerNewComment(req, res) {
    let nav = await utilities.getNav();

    const { comment, account_id } = req.body;

    const regResult = await accountModel.registerComment(comment, account_id);
    
  
    if (regResult) {
      const data = await accountModel.getAllComments()
      const comments = await utilities.displayComments(data, account_id) 
      req.flash(
        "notice",
        "Your comment has been successfully added."
      );
      res.status(201).render("./account/comments", {
        title: "Comments",
        nav,
        errors:null,
        comments
      })
    } else {
      const data = await accountModel.getAllComments()
      const comments = await utilities.displayComments(data, account_id) 
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("./account/comments", {
        title: "Comments",
        nav,
        errors:null,
        comments
      });
    }
  }

  /* ****************************************
 *  Eliminate Comment
 * ************************************ */
    async function eliminateComment(req, res) {
      
      let nav = await utilities.getNav();
  
      const comment_id = req.params.comment_id;

      const delResult = await accountModel.deleteComment(comment_id);
    
      if (delResult) {
        req.flash(
          "notice",
          "Your comment has been successfully eliminated."
        );
        return res.redirect("/account/")
      } else {
        req.flash("notice", "Sorry, the deletion failed, please try again.");
        return res.redirect("/account/")
      }
    }



module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccountInfo, processAccountUpdate, processPasswordUpdate, processLogout, buildCommentsView, registerNewComment, eliminateComment };
