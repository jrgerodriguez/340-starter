const updateBtn = document.querySelector("button")
if (updateBtn.disabled) {
    updateBtn.style.backgroundColor = "gray"
}

const form = document.querySelector("#updateForm")
    form.addEventListener("change", function () {
      updateBtn.removeAttribute("disabled")
      updateBtn.style.backgroundColor = "#5c6bc0"
})