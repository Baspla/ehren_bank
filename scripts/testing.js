const responseText = document.getElementById('responseText')
const requestText = document.getElementById('requestText')
const errorText = document.getElementById('errorText')
const errorCode = document.getElementById('errorCode')
const error = document.getElementById('error')
const request = document.getElementById('request')
const response = document.getElementById('response')

function onclick() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        console.log(this.status)
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log(this.responseText)
            response.hidden = false;
            responseText.innerText = this.responseText
            const json = JSON.parse(this.responseText);
            if (json.error) {
                error.hidden = false
                errorCode.innerText = "Error " + json.error.code
                errorText.innerText = json.error.message
            } else {
                error.hidden = true
            }
        }
    }
    xhttp.open("POST", "jsonrpc", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    let params = document.getElementById("params").value;
    let body = '{"jsonrpc": "2.0", "method": "' + document.getElementById("method").value + '", "params":{' + params + '},"id":"1"}';
    requestText.innerText = body;
    request.hidden=false;
    xhttp.send(body);
}

document.getElementById("btn").onclick = onclick