function onclick() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        console.log(this.status)
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log(this.responseText)
            var json = JSON.parse(this.responseText)
            if (json.error) {
                alert(json.error.message)
                console.log(json.error.message)
            } else {
                let ask = new bootstrap.Modal('#ask')
                document.getElementById("token").value = json.result.token
                ask.show()
            }
        }
    }
    xhttp.open("POST", "jsonrpc", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    let permissions = 0
    permissions += (document.getElementById("permissionsReadInfo").checked?1:0)
    permissions += (document.getElementById("permissionsReadBalance").checked?1:0)*2
    permissions += (document.getElementById("permissionsAddBalance").checked?1:0)*4
    permissions += (document.getElementById("permissionsSubBalance").checked?1:0)*8
    xhttp.send('{"jsonrpc": "2.0", "method": "registerApp", "params":{"admin":"' + document.getElementById("admin").value + '" ,"displayName":"' + document.getElementById("display").value + '" ,"permissions":"' + permissions + '" , "appId":"' + document.getElementById("appId").value + '", "description":"' + document.getElementById("desc").value + '"},"id":"1"}');
}

document.getElementById("btn").onclick = onclick