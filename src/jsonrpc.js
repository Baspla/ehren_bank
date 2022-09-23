// noinspection JSUnresolvedVariable
require("./sanitizer.js")
const {
    sanitizeUsername, sanitizeAppId, sanitizeAdmin, sanitizeDisplayname, sanitizeAppToken, sanitizeAmount,
    sanitizeTransactionDescription, sanitizeDescription, sanitizePermissions, sanitizeSession, sanitizeUserIdentifier
} = require("./sanitizer");
const crypto = require("crypto");
const errors = require("./errors");
const uuid = require('uuid').v4;
let admin_key = uuid();

function recreateAdminKey(request_id) {
    admin_key = uuid();
    console.log("Der neue Admin Key ist: " + admin_key)
    return '{"jsonrpc": "2.0", "error": ' + errors.adminKey + ',"id":' + request_id + '}'
}

function hash(password) {
    return crypto.createHash('sha256').update(password).digest('base64');
}

async function userExists(username) {
    return rc.zRank("bank:balance", username).then(value => {
        return value !== null
    });
}

async function authUser(username, password) {
    return await rc.hGet("bank:user:" + username, "password").then(value => {
        if (value !== undefined && value !== null) {
            return value === hash(password)
        }
        return false
    })
}

function permissionsToTextArray(permissions) {
    let text = ""
    if ((permissions & 1) === 1) {
        text += '"Nutzerinfos einsehen",'
    }
    if ((permissions >> 1 & 1) === 1) {
        text += '"Punktestand einsehen",'
    }
    if ((permissions >> 2 & 1) === 1) {
        text += '"Punkte hinzufügen",'
    }
    if ((permissions >> 3 & 1) === 1) {
        text += '"Punkte abziehen",'
    }
    if (text.endsWith(",")) text = text.substring(0, text.length - 1)
    else text = '"Nichts"'

    return "[" + text + "]";
}

let rc;
module.exports.setRedisClient = function (client) {
    rc = client;
}
module.exports.jsonrpcHandler = async function (request, response) {
    if (Array.isArray(request.body)) {
        response.send('{"jsonrpc": "2.0", "error": ' + errors.batch + '}');
        response.end();
        return;
    }
    let request_id = request.body.id
    let request_version = request.body.jsonrpc
    let request_method = request.body.method
    let request_params = request.body.params
    if (request_version !== undefined && request_method !== undefined && request_id !== undefined && request_params !== undefined) {
        if (request_version !== "2.0") {
            response.send('{"jsonrpc": "2.0", "error": ' + errors.version + ',"id":' + request_id + '}');
            response.end();
            return;
        }
        switch (request_method) {
            case "login":
                if (request_params.username !== undefined && request_params.password !== undefined) {
                    response.send(await login(request_id, sanitizeUsername(request_params.username), request_params.password))
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "getApps":
                if (request_params.session !== undefined) {
                    response.send(await getApps(request_id, sanitizeSession(request_params.session)))
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "addApp":
                if (request_params.session !== undefined && request_params.appId !== undefined) {
                    response.send(await addApp(request_id, sanitizeSession(request_params.session), sanitizeAppId(request_params.appId)))
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "removeApp":
                if (request_params.session !== undefined && request_params.appId !== undefined) {
                    response.send(await removeApp(request_id, sanitizeSession(request_params.session), sanitizeAppId(request_params.appId)))
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "registerUser":
                if (request_params.displayName !== undefined && request_params.username !== undefined && request_params.password !== undefined) {
                    response.send(await registerUser(request_id, request_params.displayName, request_params.username, request_params.password));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "registerApp":
                if (request_params.admin !== undefined && request_params.displayName !== undefined && request_params.appId !== undefined && request_params.description !== undefined && request_params.permissions !== undefined) {
                    response.send(await registerApp(request_id, sanitizeAdmin(request_params.admin), sanitizeDisplayname(request_params.displayName), sanitizeAppId(request_params.appId), sanitizeDescription(request_params.description), sanitizePermissions(request_params.permissions)))
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "deleteApp":
                if (request_params.admin !== undefined && request_params.appId !== undefined) {
                    response.send(await deleteApp(request_id, sanitizeAdmin(request_params.admin), sanitizeAppId(request_params.appId)));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "deleteUser":
                if (request_params.admin !== undefined && request_params.username !== undefined) {
                    response.send(await deleteUser(request_id, sanitizeAdmin(request_params.admin), sanitizeUsername(request_params.username)));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "getUser":
                if (request_params.uid !== undefined && request_params.appToken !== undefined) {
                    response.send(await getUser(request_id, sanitizeAppToken(request_params.appToken), sanitizeUserIdentifier(request_params.uid)));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "getBalance":
                if (request_params.uid !== undefined && request_params.appToken !== undefined) {
                    response.send(await getBalance(request_id, sanitizeAppToken(request_params.appToken), sanitizeUserIdentifier(request_params.uid)));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "addBalance":
                if (request_params.uid !== undefined && request_params.amount !== undefined && request_params.description !== undefined && request_params.appToken !== undefined) {
                    response.send(await addBalance(request_id, sanitizeAppToken(request_params.appToken), sanitizeUserIdentifier(request_params.uid), sanitizeAmount(request_params.amount), sanitizeTransactionDescription(request_params.description)));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "subBalance":
                if (request_params.uid !== undefined && request_params.amount !== undefined && request_params.description !== undefined && request_params.appToken !== undefined) {
                    response.send(await subBalance(request_id, sanitizeAppToken(request_params.appToken), sanitizeUserIdentifier(request_params.uid), sanitizeAmount(request_params.amount), sanitizeTransactionDescription(request_params.description)));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "allUsers":
                if (request_params.appToken !== undefined) {
                    response.send(await allUsers(request_id, sanitizeAppToken(request_params.appToken)));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            default:
                response.send('{"jsonrpc": "2.0", "error": ' + errors.method + ',"id":' + request_id + '}');
                response.end();
                return;
        }
    } else {
        response.send('{"jsonrpc": "2.0", "error": ' + errors.request + ',"id":null}');
        response.end();
    }
}


async function getApps(request_id, session) {
    let username = await getSessionUser(session)
    if (username!=null) {
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
    return '{"jsonrpc": "2.0", "error": ' + errors.sessionExpired + ',"id":' + request_id + '}'
}

async function addApp(request_id, session, appId) {
    let username = await getSessionUser(session)
    if (username!=null) {
            rc.sAdd("bank:user:" + username + ":apps", appId)
            return '{"jsonrpc": "2.0", "result":"ok","id":' + request_id + '}'
    }
    return '{"jsonrpc": "2.0", "error": ' + errors.sessionExpired + ',"id":' + request_id + '}'
}

async function removeApp(request_id, session, appId) {
    let username = await getSessionUser(session)
    if (username!=null) {
            rc.sRem("bank:user:" + username + ":apps", appId)
            return '{"jsonrpc": "2.0", "result":"ok","id":' + request_id + '}'
    }
    return '{"jsonrpc": "2.0", "error": ' + errors.sessionExpired + ',"id":' + request_id + '}'
}

async function registerUser(request_id, displayName, username, password) {
    let v
    if (displayName.match(displaynameRegex) !== null) {
        return '{"jsonrpc": "2.0", "error": ' + errors.displayname + ',"id":' + request_id + '}'
    }
    if (username.match(usernameRegex) !== null) {
        return '{"jsonrpc": "2.0", "error": ' + errors.username + ',"id":' + request_id + '}'
    }
    try {
        v = rc.zAdd("bank:balance", {
            score: 0,
            value: username
        }, {NX: true}).then(value => {
            if (value === 0) {
                return '{"jsonrpc": "2.0", "error": ' + errors.userCreate + ',"id":' + request_id + '}'
            } else {
                rc.hSet("bank:user:" + username, "display", displayName, {NX: true});
                rc.hSet("bank:user:" + username, "password", hash(password), {NX: true});
                console.log("Added user " + username + " with Name " + displayName);
                return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
            }
        })
    } catch (err) {
        console.log(err)
        return '{"jsonrpc": "2.0", "error":  ' + errors.dbError + ',"id":' + request_id + '}'
    }
    return v
}

async function registerApp(request_id, admin, displayName, appId, description, permissions) {
    if (admin === admin_key) {
        return await rc.sAdd("bank:apps", appId, {NX: true}).then(value => {
            if (value !== 0) {
                let token_uuid = uuid()
                rc.hSet("bank:app:" + appId, "description", description, {NX: true});
                rc.hSet("bank:app:" + appId, "display", displayName, {NX: true});
                rc.hSet("bank:app:" + appId, "permissions", permissions, {NX: true});
                rc.hSet("bank:apps:tokens", token_uuid, appId, {NX: true});
                console.log("Added app " + appId + " with Name " + displayName);
                recreateAdminKey(request_id)
                return '{"jsonrpc": "2.0", "result":{"success":true, "token":"' + token_uuid + '"},"id":' + request_id + '}'
            } else {
                return '{"jsonrpc": "2.0", "error": ' + errors.appExists + ',"id":' + request_id + '}'
            }
        })
    } else {
        return recreateAdminKey(request_id);
    }
}

async function deleteApp(request_id, admin, appId) {
    if (admin === admin_key) {
        await rc.sRem("bank:apps", appId)
        await rc.del("bank:app:" + appId)
        return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
    } else {
        return recreateAdminKey(request_id);
    }
}

async function deleteUser(request_id, admin, username) {
    if (admin === admin_key) {
        await rc.zRem("bank:balance", username)
        await rc.del("bank:app:" + username)
        return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
    } else {
        return recreateAdminKey(request_id);
    }
}

async function isAppActive(appToken, uid) {
    return await rc.hGet("bank:apps:tokens", appToken).then(async value => {
        if (value === null) return false;
        return await rc.sIsMember("bank:user:" + username + ":apps", value)
    })
}

async function getUser(request_id, appToken, uid) {
    if (await isAppActive(appToken, uid)) {
        let display = await rc.hGet("bank:user:" + username, "display")
        return '{"jsonrpc": "2.0", "result":{"username":"' + username + '","display":"' + display + '"},"id":' + request_id + '}'
    } else {
        return '{"jsonrpc": "2.0", "error": ' + errors.notActive + ',"id":' + request_id + '}'
    }
}

async function getBalance(request_id, appToken, uid) {
    if (await isAppActive(appToken, uid)) {
        let score = await rc.zScore("bank:balance", username)
        return '{"jsonrpc": "2.0", "result":{"username":"' + username + '","balance":"' + score + '"},"id":' + request_id + '}'
    } else {
        return '{"jsonrpc": "2.0", "error": ' + errors.notActive + ',"id":' + request_id + '}'
    }
}

async function addBalance(request_id, appToken, uid, amount, description) {
    if (await isAppActive(appToken, uid)) {
        await rc.zIncrBy("bank:balance", amount, username)

        await rc.hGet("bank:apps:tokens", appToken).then(async value => {
            await rc.zAdd("bank:user:tim:transactions:" + Date.now(), '{"description":"' + description + '","amount":"' + amount + '","appId":"' + value + '","positive":true}')
            return '{"jsonrpc": "2.0", "result":{"username":"' + username + '"},"id":' + request_id + '}'
        })
    } else {
        return '{"jsonrpc": "2.0", "error": ' + errors.notActive + ',"id":' + request_id + '}'
    }
}

async function subBalance(request_id, appToken, uid, amount, description) {
    if (await isAppActive(appToken, uid)) {
        let score = await rc.zscore("bank:balance", username)
        if (score - amount < 0) {
            return '{"jsonrpc": "2.0", "error": ' + errors.lowBalance + ',"id":' + request_id + '}'
        }
        await rc.zIncrBy("bank:balance", -1 * amount, username)
        await rc.hGet("bank:apps:tokens", appToken).then(async value => {
            await rc.zAdd("bank:user:tim:transactions:" + Date.now(), '{"description":"' + description + '","amount":"' + amount + '","appId":"' + value + '","positive":false}')
            return '{"jsonrpc": "2.0", "result":{"username":"' + username + '"},"id":' + request_id + '}'
        })
    } else {
        return '{"jsonrpc": "2.0", "error": ' + errors.notActive + ',"id":' + request_id + '}'
    }
}

async function allUsers(request_id, appToken) {
    return '{"jsonrpc": "2.0", "error": ' + errors.todo + ',"id":' + request_id + '}'
}

const algorithm = "aes-256-cbc";
const initVector = crypto.randomBytes(16);
const securityKey = crypto.randomBytes(32);

async function getSessionUser(session) {
    const decipher = crypto.createDecipheriv(algorithm, securityKey, initVector);
    try {
        let decryptedData = decipher.update(session, "hex", "utf-8");
        decryptedData += decipher.final("utf8");
        session = JSON.parse(decryptedData)
        let username = session.username;
        let expires = session.expires;
        if(expires!==undefined&&username!==undefined){
            if(expires<Math.floor(Date.now() / 1000)){
                return null;
            }
            if(await userExists(username)){
                return username
            }
        }
    } catch (error) {
        //console.debug(error)
    }
    return null;
}

async function login(request_id, username, password) {
    if (await authUser(username, password)) {
        let expire_date = Math.floor(Date.now() / 1000) + 86400;
        const cipher = crypto.createCipheriv(algorithm, securityKey, initVector);
        let encryptedData = cipher.update('{"username":"' + username + '","expires":' + expire_date + '}', "utf-8", "hex");
        encryptedData += cipher.final("hex");
        return '{"jsonrpc": "2.0", "result": {"session":"' + encryptedData + '"},"id":' + request_id + '}'
    } else {
        return '{"jsonrpc": "2.0", "error": ' + errors.auth + ',"id":' + request_id + '}'
    }
}