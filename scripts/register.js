function onclick(){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        console.log(this.status)
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log(this.responseText)
            var json = JSON.parse(this.responseText)
            if(json.error){
                alert(json.error.message)
                console.log(json.error.message)
            }else{
                location.href = "/apps"
            }
        }
    }
    xhttp.open("POST", "jsonrpc", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send('{"jsonrpc": "2.0", "method": "registerUser", "params":{"displayName":"'+document.getElementById("display").value+'" , "username":"'+document.getElementById("username").value+'", "password":"'+document.getElementById("password").value+'"},"id":"1"}');
}

const alertDiv = document.getElementById('alert')
const alertText = document.getElementById('alert-text')
const alert = (message) => {
    alertDiv.hidden=false
    alertText.innerText=message
}

document.getElementById("btn").onclick=onclick