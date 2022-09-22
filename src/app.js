const redis = require('redis');
const express = require("express");
const app = express()
const session = require('express-session');
const uuid = require('uuid').v4;
const sanitizer = require('sanitize')();
const crypto = require('crypto')

//
// SETUP
//

let admin_key = uuid();
const rc = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

{

    rc.on('error', err => {
        console.log('Redis Error: ' + err);
    });

    app.set('view engine', 'pug')
    app.use('/css', express.static(__dirname + '/../node_modules/bootstrap/dist/css'))
    app.use('/js', express.static(__dirname + '/../node_modules/bootstrap/dist/js'))
    app.use(session({
        secret: 'jrFje38Q3GXNhmZnbm23U9i',
        resave: true,
        saveUninitialized: true
    }));
    app.use(express.json());
}

//
// UTIL
//

function recreateAdminKey(request_id) {
    admin_key = uuid();
    console.log("Der neue Admin Key ist: " + admin_key)
    return '{"jsonrpc": "2.0", "error": {"code": 8, "message": "New Admin Key created"},"id":' + request_id + '}'
}

async function userExists(username) {
    return rc.zRank("bank:balance", username).then(value => {
        return value !== null
    });
}


async function checkUser(username, password) {
    return await rc.hGet("bank:user:" + username, "password").then(value => {
        if (value !== undefined && value !== null) {
            return value === hash(password)
        }
        return false
    })
}

function hash(password) {
    return crypto.createHash('sha256').update(password).digest('base64');
}


function permissionsToTextArray(permissions) {
    let text = ""
    if((permissions & 1) === 1){
        text+='"Nutzerinfos einsehen",'
    }
    if((permissions>>1 & 1) === 1){
        text+='"Punktestand einsehen",'
    }
    if((permissions>>2 & 1) === 1){
        text+='"Punkte hinzufügen",'
    }
    if((permissions>>3 & 1) === 1){
        text+='"Punkte abziehen",'
    }
    if(text.endsWith(",")) text = text.substring(0,text.length-1)

    return "["+text+"]";
}

//
// SANITIZE
//

const appTokenRegex = /[^a-zA-Z-\d]/g
const transactionDescriptionRegex = /[^a-zA-Z\d\s]/g
const descriptionRegex = /[^a-zA-Z\d\s]/g
const adminRegex = /[^a-zA-Z-\d]/g
const displaynameRegex = /[^a-zA-Z-\d\s\p{Emoji_Presentation}]/gu
const usernameRegex = /[^a-zA-Z-\d]/g
const appIdRegex = /[^a-zA-Z-]/g

function sanitizeAppId(appid) {
    return appid.replaceAll(appIdRegex, "")
}

function sanitizeUsername(username) {
    return username.replaceAll(usernameRegex, "")
}

function sanitizeDisplayname(displayname) {
    return displayname.replaceAll(displaynameRegex, "")
}

function sanitizeAdmin(admin) {
    return admin.replaceAll(adminRegex, "")
}

function sanitizeDescription(description) {
    return description.replaceAll(descriptionRegex, "")
}

function sanitizeTransactionDescription(description) {
    return description.replaceAll(transactionDescriptionRegex, "")
}

function sanitizeAppToken(appToken) {
    return appToken.replaceAll(appTokenRegex, "")
}

function sanitizePermissions(permissions) {
    permissions=parseInt(permissions)
    if (Number.isInteger(permissions))
        if (permissions > 0)
            return permissions;
        else return 0;
    else
        return 0;
}

function sanitizeAmount(amount) {
    if (Number.isInteger(amount))
        if (amount > 0)
            return amount;
        else return 0;
    else
        return 0;
}


//
// JSON FUNCTIONS
//

async function getApps(request_id, username, password) {
    if (await userExists(username)) {
        if (await checkUser(username, password)) {
            let results = "";
            return await rc.sMembers("bank:apps").then(async appList => {
                for (const appId of appList) {
                    await rc.hGetAll("bank:app:" + appId).then(async appInfo => {
                        await rc.sIsMember("bank:user:" + username + ":apps", appId).then(isAppMember => {
                            results += '{"appId":"' + appId + '","name":"' + appInfo.display + '","description":"' + appInfo.description + '","permissions":' + permissionsToTextArray(appInfo.permissions) + ',"active":' + isAppMember + '},'
                        })
                    })
                }
                if (results.endsWith(",")) results = results.substring(0, results.length - 1)
                return '{"jsonrpc": "2.0", "result":[' + results + '],"id":' + request_id + '}'
            })
        }
    }
    return '{"jsonrpc": "2.0", "error": {"code": 12, "message": "Wrong Username or Password"},"id":' + request_id + '}'
}

async function addApp(request_id, username, password, appId) {
    if (await userExists(username)) {
        if (await checkUser(username, password)) {
            rc.sAdd("bank:user:" + username + ":apps", appId)
            return '{"jsonrpc": "2.0", "result":"ok","id":' + request_id + '}'
        }
    }
    return '{"jsonrpc": "2.0", "error": {"code": 12, "message": "Wrong Username or Password"},"id":' + request_id + '}'
}

async function removeApp(request_id, username, password, appId) {
    console.log("removeApp")
    if (await userExists(username)) {
        if (await checkUser(username, password)) {
            rc.sRem("bank:user:" + username + ":apps", appId)
            return '{"jsonrpc": "2.0", "result":"ok","id":' + request_id + '}'
        }
    }
    return '{"jsonrpc": "2.0", "error": {"code": 12, "message": "Wrong Username or Password"},"id":' + request_id + '}'
}

async function registerUser(request_id, displayName, username, password) {
    let v
    if (displayName.match(displaynameRegex) !== null) {
        return '{"jsonrpc": "2.0", "error": {"code": 13, "message": "Malformed Displayname"},"id":' + request_id + '}'
    }
    if (username.match(usernameRegex) !== null) {
        return '{"jsonrpc": "2.0", "error": {"code": 14, "message": "Malformed Username"},"id":' + request_id + '}'
    }
    try {
        v = rc.zAdd("bank:balance", {
            score: 0,
            value: username
        }, {NX: true}).then(value => {
            if (value === 0) {
                return '{"jsonrpc": "2.0", "error": {"code": 9, "message": "Could not create User"},"id":' + request_id + '}'
            } else {
                rc.hSet("bank:user:" + username, "display", displayName, {NX: true});
                rc.hSet("bank:user:" + username, "password", hash(password), {NX: true});
                console.log("Added user " + username + " with Name " + displayName);
                return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
            }
        })
    } catch (err) {
        console.log(err)
        return '{"jsonrpc": "2.0", "error": {"code": 10, "message": "Database Error"},"id":' + request_id + '}'
    }
    return v
}

async function registerApp(request_id, admin, displayName, appId, description, permissions) {
    if (admin === admin_key) {
        return await rc.sAdd("bank:apps",appId,{NX: true}).then(value => {
            if(value!==0){
                let token_uuid = uuid()
                rc.hSet("bank:app:"+appId,"description",description, {NX: true});
                rc.hSet("bank:app:"+appId,"display",displayName, {NX: true});
                rc.hSet("bank:app:"+appId,"permissions",permissions, {NX: true});
                rc.hSet("bank:apps:tokens",token_uuid,appId, {NX: true});
                console.log("Added app " + appId + " with Name " + displayName);
                recreateAdminKey(request_id)
                return '{"jsonrpc": "2.0", "result":{"success":true, "token":"'+token_uuid+'"},"id":' + request_id + '}'
            }else{
                return '{"jsonrpc": "2.0", "error": {"code": 20, "message": "App already exists"},"id":' + request_id + '}'
            }
        })
    } else {
        return recreateAdminKey(request_id);
    }
}

async function deleteApp(request_id, admin, appId) {
    if (admin === admin_key) {
        await rc.sRem("bank:apps",appId)
        await rc.del("bank:app:"+appId)
        return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
    } else {
        return recreateAdminKey(request_id);
    }
}

async function deleteUser(request_id, admin, username) {
    if (admin === admin_key) {
        await rc.zRem("bank:balance", appId)
        await rc.del("bank:app:" + appId)
        return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
    } else {
        return recreateAdminKey(request_id);
    }
}

async function isAppActive(appToken, username) {
    return await rc.hGet("bank:apps:tokens",appToken).then(async value => {
        if(value === null) return false;
        return await rc.sIsMember("bank:user:" + username + ":apps", value)
    })
}

async function getUser(request_id, appToken, username) {
    if (await isAppActive(appToken, username)) {
        let display = await rc.hGet("bank:user:"+username,"display")
        return '{"jsonrpc": "2.0", "result":{"username":"'+username+'","display":"'+display+'"},"id":' + request_id + '}'
    }else{
        return '{"jsonrpc": "2.0", "error": {"code": 100, "message": "App is not active for this user"},"id":' + request_id + '}'
    }
}

async function getBalance(request_id, appToken, username) {
    if (await isAppActive(appToken, username)) {
        let score = await rc.zscore("bank:balance",username)
        return '{"jsonrpc": "2.0", "result":{"username":"'+username+'","balance":"'+score+'"},"id":' + request_id + '}'
    }else{
        return '{"jsonrpc": "2.0", "error": {"code": 100, "message": "App is not active for this user"},"id":' + request_id + '}'
    }
}

async function addBalance(request_id, appToken, username, amount, description) {
    if (await isAppActive(appToken, username)) {
        await rc.zIncrBy("bank:balance",amount,username)

        await rc.hGet("bank:apps:tokens",appToken).then(async value => {
            await rc.zAdd("bank:user:tim:transactions:" + Date.now(), '{"description":"' + description + '","amount":"' + amount + '","appId":"'+value+'","positive":true}')
            return '{"jsonrpc": "2.0", "result":{"username":"' + username + '"},"id":' + request_id + '}'
        })
    }else{
        return '{"jsonrpc": "2.0", "error": {"code": 100, "message": "App is not active for this user"},"id":' + request_id + '}'
    }
}

async function subBalance(request_id, appToken, username, amount, description) {
    if (await isAppActive(appToken, username)) {
        await rc.zIncrBy("bank:balance",-1*amount,username)
        await rc.hGet("bank:apps:tokens",appToken).then(async value => {
            await rc.zAdd("bank:user:tim:transactions:" + Date.now(), '{"description":"' + description + '","amount":"' + amount + '","appId":"'+value+'","positive":false}')
            return '{"jsonrpc": "2.0", "result":{"username":"' + username + '"},"id":' + request_id + '}'
        })
    }else{
        return '{"jsonrpc": "2.0", "error": {"code": 100, "message": "App is not active for this user"},"id":' + request_id + '}'
    }
}

//
// JSON RPC ENDPOINT
//
{
    app.post('/jsonrpc', async function (request, response) {
        if (Array.isArray(request.body)) {
            response.send('{"jsonrpc": "2.0", "error": {"code": 7, "message": "Batch calls are not supported yet"}}');
            response.end();
            return;
        }
        let request_id = request.body.id
        let request_version = request.body.jsonrpc
        let request_method = request.body.method
        let request_params = request.body.params
        if (request_version !== undefined && request_method !== undefined && request_id !== undefined && request_params !== undefined) {
            if (request_version !== "2.0") {
                response.send('{"jsonrpc": "2.0", "error": {"code": 2, "message": "Invalid Version"},"id":' + request_id + '}');
                response.end();
                return;
            }
            switch (request_method) {
                case "getApps":
                    if (request_params.username !== undefined && request_params.password !== undefined) {
                        response.send(await getApps(request_id, sanitizeUsername(request_params.username), request_params.password))
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "addApp":
                    if (request_params.username !== undefined && request_params.password !== undefined && request_params.appId !== undefined) {
                        response.send(await addApp(request_id, sanitizeUsername(request_params.username), request_params.password, sanitizeAppId(request_params.appId)))
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "removeApp":
                    if (request_params.username !== undefined && request_params.password !== undefined && request_params.appId !== undefined) {
                        response.send(await removeApp(request_id, sanitizeUsername(request_params.username), request_params.password, sanitizeAppId(request_params.appId)))
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "registerUser":
                    if (request_params.displayName !== undefined && request_params.username !== undefined && request_params.password !== undefined) {
                        response.send(await registerUser(request_id, request_params.displayName, request_params.username, request_params.password));
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "registerApp":
                    if (request_params.admin !== undefined && request_params.displayName !== undefined && request_params.appId !== undefined && request_params.description !== undefined && request_params.permissions !== undefined) {
                        response.send(await registerApp(request_id, sanitizeAdmin(request_params.admin), sanitizeDisplayname(request_params.displayName), sanitizeAppId(request_params.appId), sanitizeDescription(request_params.description), sanitizePermissions(request_params.permissions)))
                    } else {
                        console.log(request_params)
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "deleteApp":
                    if (request_params.admin !== undefined && request_params.appId !== undefined) {
                        response.send(await deleteApp(request_id, sanitizeAdmin(request_params.admin), sanitizeAppId(request_params.appId)));
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "deleteUser":
                    if (request_params.admin !== undefined && request_params.username !== undefined) {
                        response.send(await deleteUser(request_id, sanitizeAdmin(request_params.admin), sanitizeUsername(request_params.username)));
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "getUser":
                    if (request_params.username !== undefined && request_params.appToken !== undefined) {
                        response.send(await getUser(request_id, sanitizeAppToken(request_params.appToken), sanitizeUsername(request_params.username)));
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "getBalance":
                    if (request_params.username !== undefined && request_params.appToken !== undefined) {
                        response.send(await getBalance(request_id, sanitizeAppToken(request_params.appToken), sanitizeUsername(request_params.username)));
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "addBalance":
                    if (request_params.username !== undefined && request_params.amount !== undefined && request_params.description !== undefined && request_params.appToken !== undefined) {
                        response.send(await addBalance(request_id, sanitizeAppToken(request_params.appToken), sanitizeUsername(request_params.username), sanitizeAmount(request_params.amount), sanitizeTransactionDescription(request_params.description)));
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                case "subBalance":
                    if (request_params.username !== undefined && request_params.amount !== undefined && request_params.description !== undefined && request_params.appToken !== undefined) {
                        response.send(await subBalance(request_id, sanitizeAppToken(request_params.appToken), sanitizeUsername(request_params.username), sanitizeAmount(request_params.amount), sanitizeTransactionDescription(request_params.description)));
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": {"code": 6, "message": "Missing Parameters"},"id":' + request_id + '}');
                    }
                    response.end();
                    return;
                default:
                    response.send('{"jsonrpc": "2.0", "error": {"code": 5, "message": "Invalid Method"},"id":' + request_id + '}');
                    response.end();
                    return;
            }
        } else {
            response.send('{"jsonrpc": "2.0", "error": {"code": 3, "message": "Invalid Request (and Notifications are not accepted)"},"id":null}');
            response.end();
        }
    });
}

//
// WEP PAGES
//
{
    app.get('/', (req, res) => {
        res.redirect("/apps")
    })
    app.get('/register', (req, res) => {
        res.render('register')
    })
    app.get('/deleteuser', (req, res) => {
        res.render('deleteuser')
    })
    app.get('/apps', (req, res) => {
        res.render('apps')
    })
    app.get('/registerapp', (req, res) => {
        res.render('newapp')
    })
    app.get('/deleteapp', (req, res) => {
        res.render('deleteapp')
    })

    async function start() {
        await rc.connect().then(() => {
            console.log(`Verbindung zu Redis auf ${process.env.REDIS_HOST}:${process.env.REDIS_PORT} hergestellt.`)
            app.listen(80, () =>
                console.log(`Express wurde gestartet.`)
            );
        })
    }

    start().then(() => {
    });
}
