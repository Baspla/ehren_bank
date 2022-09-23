function loadApps(username,password){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log(this.responseText)
            const json = JSON.parse(this.responseText);
            if (json.error) {
                alert(json.error.message)
                console.log(json.error.message)
            } else {
                localStorage.setItem("session",json.result.session)
                console.log("Logged in as "+username)
                location.href="/apps"
            }
        }
    }
    xhttp.open("POST", "jsonrpc", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send('{"jsonrpc": "2.0", "method": "login", "params":{"username":"' + username + '", "password":"' + password + '"},"id":"1"}');
}

function onclickLogin() {
    loadApps(document.getElementById("username").value,document.getElementById("password").value)
}

document.getElementById("loginButton").onclick = onclickLogin