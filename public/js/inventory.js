"use strict";

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList");
classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value;
  console.log(classification_id);
  let classIdURL = "/inv/getInventory/" + classification_id;
  fetch(classIdURL) //This will use the URL to get the JSON that the route will return
    .then(function (response) {
      if (response.ok) {
        return response.json(); //This will be turned into a JavaScript object
      }
      throw Error("Network response was not OK");
    })
    .then(function (data) {
      console.log(data);
      buildInventoryList(data);
    })
    .catch(function (error) {
      console.log("There was a problem: ", error.message);
    });
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  // Set up the table labels
  let dataTable = `
    <thead>
    <tr>
    <th>Vehicle Name</th>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    </tr>
    </thead>`;
  // Set up the table body
  dataTable += `<tbody>`;
  // Iterate over all vehicles in the array and put each in a row
  data.forEach((element) => {
    console.log(element.inv_id + ", " + element.inv_model);
    dataTable += `<tr>
        <td>${element.inv_make} ${element.inv_model}</td>
        <td><a href='/inv/edit/${element.inv_id}' title='Click to update' class="modify-btn">Modify</a></td>
        <td><a href='/inv/delete/${element.inv_id}' title='Click to delete' class="delete-btn">Delete</a></td>
      </tr>`;
  });
  dataTable += `</tbody>`;
  // Display the contents in the Inventory Management view
  inventoryDisplay.innerHTML = dataTable;
}
