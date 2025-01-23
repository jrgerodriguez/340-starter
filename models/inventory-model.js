const pool = require("../database/") //This line finds the index.js in the database folder and stores its values, methods, etc in a variable named pool. This is in order for us to be able to use the query method in the pool object already built in the index.js inside de database folder, so that we do not have to write it, including the initialization of the pool object every time we need.

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
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
      )
      return data.rows
    } catch (error) {
      console.error("getclassificationsbyid error " + error)
    }
  }

//This function will return all rows from the inventory table where classificiation if matches with the parameter.
//Example: if 3 cars have the same SUV type, I will return them 3 if their classificationId matches with the parameter.  

module.exports = {getClassifications, getInventoryByClassificationId}; //We export it as what is returned will be handled by a utility.