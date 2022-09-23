function activateAppModal(appId){
    let ask = new bootstrap.Modal('#ask')
    document.getElementById("askName").innerHTML=document.getElementById("name_"+appId).innerHTML;
    document.getElementById("askName2").innerHTML=document.getElementById("name_"+appId).innerHTML;
    document.getElementById("askPermissions").innerHTML=document.getElementById("permissions_"+appId).innerHTML;
    document.getElementById("askOK").onclick = (()=>{activateApp(appId)})
    ask.show()
}

function deactivateAppModal(appId){
    deactivateApp(appId)
}

function activateApp(appId) {
    console.log("Aktiviere " + appId)
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        console.log(this.status)
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log(this.responseText)
            var json = JSON.parse(this.responseText)
            if (json.error) {
                console.log(json.error.message)
            }
            loadApps()
        }
    }
    xhttp.open("POST", "jsonrpc", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send('{"jsonrpc": "2.0", "method": "addApp", "params":{"session":"' + session + '", "appId":"'+appId+'"},"id":"1"}');
}

function deactivateApp(appId) {
    console.log("Deaktiviere " + appId)
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        console.log(this.status)
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log(this.responseText)
            var json = JSON.parse(this.responseText)
            if (json.error) {
                console.log(json.error.message)
            }
            loadApps()
        }
    }
    xhttp.open("POST", "jsonrpc", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send('{"jsonrpc": "2.0", "method": "removeApp", "params":{"session":"' + session + '", "appId":"' + appId + '"},"id":"1"}');
}

function loadApps(){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        console.log(this.status)
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log(this.responseText)
            const json = JSON.parse(this.responseText);
            if (json.error) {
                console.log(json.error.message)
                console.log("Session expired? -> redirect to /login")
                location.href="/login"
            } else {
                displayApps(json.result)
            }
        }
    }
    xhttp.open("POST", "jsonrpc", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send('{"jsonrpc": "2.0", "method": "getApps", "params":{"session":"' + session + '"},"id":"1"}');
}
function displayApps(result){
    let appListElements = document.getElementById("appListElements")
    let appList = document.getElementById("appList")
    appList.hidden=false
    let inner = "";
    for (const i in result) {
        let res = result[i]
        let activeText = (res.active?"Aktiv":"Inaktiv")
        let activeColor = (res.active?"success":"secondary")
        let permissions = ""
        for (const p in res.permissions) {
            permissions = permissions.concat('                <li class="list-group-item">'+res.permissions[p]+'</li>\n')
        }
        let element = '<div class="card mb-4">\n' +
            '    <div class="card-header">\n'+
            '        <h4 id="name_'+res.appId+'" class="card-title">'+res.name+'</h4>\n'+
            '        <div class="badge text-bg-'+activeColor+'">'+activeText+'</div>\n'+
            '    </div>\n'+
            '    <div class="card-body">\n'+
            '        <p>'+res.description+'</p>' +
            '        <p> Dieser Bot darf:' +
            '            <ul id="permissions_'+res.appId+'" class="list-group">\n'+
            permissions +
            '            </ul>\n' +
            '        </p>'+
            '    </div>\n'+
            '    <div class="card-footer justify-content-end d-flex"><button class="btn btn-primary me-2" onclick="activateAppModal(\''+res.appId+'\')" '+(res.active?"hidden":"")+'>Aktivieren</button><button class="btn btn-outline-danger me-2" onclick="deactivateAppModal(\''+res.appId+'\')" '+(res.active?"":"hidden")+'>Deaktivieren</button></div>\n'+
            '</div>'
        inner = inner.concat(element)
    }
    appListElements.innerHTML=inner;
}

let session = localStorage.getItem("session")
if(session==null){
    console.log("No Session found -> redirect to /login")
    location.href="/login"
}else{
    loadApps()
}