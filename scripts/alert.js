const alertDiv = document.getElementById('alert')
const alertText = document.getElementById('alert-text')
const alert = (message) => {
    alertDiv.hidden = false
    alertText.innerText = message
}