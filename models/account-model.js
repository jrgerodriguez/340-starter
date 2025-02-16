const pool = require("../database/");

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}


/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account id
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT * FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    console.error("model error:" + error)
  }
}

/* *****************************
* Process Account Update
* ***************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
    const result = await pool.query(
      "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *",
      [account_firstname, account_lastname, account_email, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("model error:" + error)
  }
}


/* *****************************
* Process Password Update
* ***************************** */
async function updatePassword(account_password, account_id) {
  try {
    const result = await pool.query(
      "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *",
      [account_password, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("model error:" + error)
  }
}


/* *****************************
* Get All Comments
* ***************************** */
async function getAllComments() {
  return await pool.query(
    "SELECT comment_id, comment, comments.account_id, to_char(date, 'Mon DD YYYY') AS date, account_firstname, account_lastname FROM public.comments JOIN public.account  ON comments.account_id = account.account_id ORDER BY comment_id DESC"
  );
}

/* *****************************
*   Register new account
* *************************** */
async function registerComment(comment, account_id){
  try {
    const sql = "INSERT INTO comments (comment, account_id) VALUES ($1, $2) RETURNING *"
    return await pool.query(sql, [comment, account_id])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Eliminate account
* *************************** */
async function deleteComment(comment_id){
  try {
    const sql = "DELETE FROM comments WHERE comment_id = $1"
    return await pool.query(sql, [comment_id])
  } catch (error) {
    return error.message
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword, getAllComments, registerComment, deleteComment}