function activateAppModal(appId,display,usesUID,uid){
    document.getElementById("askName").innerHTML=display;
    document.getElementById("askName2").innerHTML=display;
    document.getElementById("askPermissions").innerHTML=document.getElementById("permissions_"+appId).innerHTML;
    document.getElementById("askUid").hidden = !usesUID
    document.getElementById("askUid").value = usesUID?uid:"";
    document.getElementById("askOK").onclick = (()=>{activateApp(appId,usesUID)})
    let ask = new bootstrap.Modal('#ask')
    ask.show()
}


function deactivateAppModal(appId){
    deactivateApp(appId)
}

const xhttphandler = function () {
    console.log(this.status)
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        console.log(this.responseText)
        var json = JSON.parse(this.responseText)
        if (json.error) {
            console.log(json.error.message)
        }
        location.reload()
    }
}

function activateApp(appId,usesUid) {
    console.log("Aktiviere " + appId)
    let uid = 'null'
    if(usesUid){
        uid='"'+document.getElementById("uid").value+'"'
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onload = xhttphandler
    xhttp.open("POST", "jsonrpc", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send('{"jsonrpc": "2.0", "method": "addApp", "params":{"uid":'+uid+', "appId":"'+appId+'"},"id":"1"}');
}

function deactivateApp(appId) {
    console.log("Deaktiviere " + appId)
    const xhttp = new XMLHttpRequest();
    xhttp.onload = xhttphandler
    xhttp.open("POST", "jsonrpc", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send('{"jsonrpc": "2.0", "method": "removeApp", "params":{"appId":"' + appId + '"},"id":"1"}');
}



//loadApps()