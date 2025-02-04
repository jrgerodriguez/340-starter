const pool = require("../database/"); //This line finds the index.js in the database folder and stores its values, methods, etc in a variable named pool. This is in order for us to be able to use the query method in the pool object already built in the index.js inside de database folder, so that we do not have to write it, including the initialization of the pool object every time we need.

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* ***************************
 *  Get all vehicle details by inv_Id
 * ************************** */

async function getVehicleByInventoryId(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory WHERE inv_id = $1`, [inventory_id]
    );
    return data.rows
  } catch (error) {
    console.error("getVehicleDetailsByInventoryId" + error)
  }
}

//This function will return all rows from the inventory table where classificiation if matches with the parameter.
//Example: if 3 cars have the same SUV type, I will return them 3 if their classificationId matches with the parameter.

/* *****************************
*   Register new classification
* *************************** */
async function registerClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)"
    return await pool.query(sql, [classification_name]) 
  } catch (error) {
    console.error("registerClassification" + error)
  }
}

/* **********************************
*   Check for existing classification
* *********************************** */

async function checkExistingClassification(classification_name){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error) {
    console.error("checkExistingClassification" + error)
  }
}

/* *****************************
*   Register new Inventory Element
* *************************** */
async function registerInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"
    return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]) 
  } catch (error) {
    console.error("registerInventory" + error)
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleByInventoryId, registerClassification, checkExistingClassification, registerInventory }; //We export it as what is returned will be handled by a utility.
