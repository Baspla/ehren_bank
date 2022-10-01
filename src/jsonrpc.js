// noinspection JSUnresolvedVariable

import './sanitizer.js'
import {errors} from "./errors.js";
import {v4 as uuid} from "uuid";
import {permissions} from "./permissions.js";

let admin_key = uuid();

function recreateAdminKey() {
    admin_key = uuid();
    console.log("Der neue Admin Key ist: " + admin_key)
}

export async function jsonrpcHandler(request, response) {
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
                    let username = request_params.username
                    let password = request_params.password
                    if (await authUser(username, password)) {
                        request.session.username = username;
                        response.send('{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}');
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": ' + errors.auth + ',"id":' + request_id + '}');
                    }
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "userAddApp":
                if (request.session.username) {
                    if (request_params.uid !== undefined && request_params.appId !== undefined) {
                        response.send(await apiAddApp(request_id, request.session.username, request_params.appId, uid))
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                    }
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.sessionExpired + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "userRemoveApp":
                if (request.session.username) {
                    if (request_params.appId !== undefined) {
                        response.send(await apiRemoveApp(request_id, request.session.username, request_params.appId))
                    } else {
                        response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                    }
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.sessionExpired + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "registerUser":
                if (request_params.displayName !== undefined && request_params.username !== undefined && request_params.password !== undefined) {
                    response.send(await apiRegisterUser(request_id, request_params.displayName, request_params.username, request_params.password));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "modifyUser":
                return;
            case "modifyUserPassword":
                return;
            case "registerApp":
                if (request_params.admin !== undefined && request_params.displayName !== undefined && request_params.appId !== undefined && request_params.description !== undefined && request_params.permissions !== undefined) {
                    response.send(await apiRegisterApp(request_id, request_params.admin, request_params.displayName, request_params.appId, request_params.description, request_params.permissions))
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "deleteApp":
                if (request_params.admin !== undefined && request_params.appId !== undefined) {
                    response.send(await apiDeleteApp(request_id, request_params.admin, request_params.appId));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "deleteUser":
                if (request_params.admin !== undefined && request_params.username !== undefined) {
                    response.send(await apiDeleteUser(request_id, request_params.admin, request_params.username));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "getUser":
                if (request_params.uid !== undefined && request_params.appToken !== undefined) {
                    response.send(await apiGetUser(request_id, request_params.appToken, request_params.uid));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "getBalance":
                if (request_params.uid !== undefined && request_params.appToken !== undefined) {
                    response.send(await apiGetBalance(request_id, request_params.appToken, request_params.uid));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "addBalance":
                if (request_params.uid !== undefined && request_params.amount !== undefined && request_params.description !== undefined && request_params.appToken !== undefined) {
                    response.send(await apiAddBalance(request_id, request_params.appToken, request_params.uid, request_params.amount, request_params.description));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "subBalance":
                if (request_params.uid !== undefined && request_params.amount !== undefined && request_params.description !== undefined && request_params.appToken !== undefined) {
                    response.send(await apiSubBalance(request_id, request_params.appToken, request_params.uid, request_params.amount, request_params.description));
                } else {
                    response.send('{"jsonrpc": "2.0", "error": ' + errors.parameters + ',"id":' + request_id + '}');
                }
                response.end();
                return;
            case "allUsers":
                if (request_params.appToken !== undefined) {
                    response.send(await apiAllUsers(request_id, request_params.appToken));
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


async function apiAddApp(request_id, username, appId, uid) {
    if (uid === null) {
        uid = ""
    }
    await addUserApp(username, appId, uid)
    return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
}

async function apiRemoveApp(request_id, username, appId) {
    await removeUserApp(username, appId)
    return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
}

async function apiRegisterUser(request_id, displayName, username, password) {
    if (displayName.match(displaynameRegex) !== null) {
        return '{"jsonrpc": "2.0", "error": ' + errors.displayname + ',"id":' + request_id + '}'
    }
    if (username.match(usernameRegex) !== null) {
        return '{"jsonrpc": "2.0", "error": ' + errors.username + ',"id":' + request_id + '}'
    }

    let success = await createUser(displayName, username, password, 0);
    if (success) {
        return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
    } else {
        return '{"jsonrpc": "2.0", "error": ' + errors.userCreate + ',"id":' + request_id + '}'
    }
}

async function apiRegisterApp(request_id, admin, displayName, appId, description, permissions, usesUID) {
    if (admin === admin_key) {
        recreateAdminKey(request_id)
        return await createApp(displayName, appId, description, permissions, usesUID)
    } else {
        recreateAdminKey(request_id);
        return '{"jsonrpc": "2.0", "error": ' + errors.adminKey + ',"id":' + request_id + '}'
    }
}

async function apiDeleteApp(request_id, admin, appId) {
    if (admin === admin_key) {
        recreateAdminKey(request_id)
        await deleteApp(admin, appId)
        return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
    } else {
        recreateAdminKey(request_id);
        return '{"jsonrpc": "2.0", "error": ' + errors.adminKey + ',"id":' + request_id + '}'
    }
}

async function apiDeleteUser(request_id, admin, username) {
    if (admin === admin_key) {
        recreateAdminKey(request_id)
        await deleteUser(admin, username)
        return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
    } else {
        recreateAdminKey(request_id);
        return '{"jsonrpc": "2.0", "error": ' + errors.adminKey + ',"id":' + request_id + '}'
    }
}


async function apiGetUser(request_id, appToken, uid) {
    let appId = await getAppIdByToken(appToken);
    let username = await getUsernameByUID(appId, uid);
    if (await isAppActiveForUser(appId, username)) {
        if (await hasAppPermission(appId, permissions.USER_INFO)) {
            let display = await getUserDisplay(username);
            return '{"jsonrpc": "2.0", "result":{"username":"' + username + '","display":"' + display + '"},"id":' + request_id + '}'
        } else {
            return '{"jsonrpc": "2.0", "error": ' + errors.permission + ',"id":' + request_id + '}'
        }
    } else {
        return '{"jsonrpc": "2.0", "error": ' + errors.notActive + ',"id":' + request_id + '}'
    }
}

async function apiGetBalance(request_id, appToken, uid) {
    let appId = await getAppIdByToken(appToken);
    if (appId) {
        let username = await getUsernameByUID(appId, uid);
        if (username) {
            if (await hasAppPermission(appId, permissions.USER_BALANCE)) {
                let balance = await getBalance(username);
                return '{"jsonrpc": "2.0", "result":{"username":"' + username + '","balance":"' + balance + '"},"id":' + request_id + '}'
            } else {
                return '{"jsonrpc": "2.0", "error": ' + errors.permission + ',"id":' + request_id + '}'
            }
        } else {
            return '{"jsonrpc": "2.0", "error": ' + errors.notActive + ',"id":' + request_id + '}'
        }
    } else {
        //Unbekannter App Token. Aber keinen Hinweis darauf geben.
        return '{"jsonrpc": "2.0", "error": ' + errors.notActive + ',"id":' + request_id + '}'
    }
}

async function apiAddBalance(request_id, appToken, uid, amount, description) {
    let appId = await getAppIdByToken(appToken);
    let username = await getUsernameByUID(appId, uid);
    if (amount <= 0) {
        return '{"jsonrpc": "2.0", "error": ' + errors.amount + ',"id":' + request_id + '}'
    }
    if (await isAppActiveForUser(appId, username)) {
        if (await hasAppPermission(appId, permissions.USER_BALANCE_ADD)) {
            await incrementBalance(username, amount, appId, description);
            return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
        } else {
            return '{"jsonrpc": "2.0", "error": ' + errors.permission + ',"id":' + request_id + '}'
        }
    } else {
        return '{"jsonrpc": "2.0", "error": ' + errors.notActive + ',"id":' + request_id + '}'
    }
}

async function apiSubBalance(request_id, appToken, uid, amount, description) {
    let appId = await getAppIdByToken(appToken);
    let username = await getUsernameByUID(appId, uid);
    if (amount <= 0) {
        return '{"jsonrpc": "2.0", "error": ' + errors.amount + ',"id":' + request_id + '}'
    }
    if (await isAppActiveForUser(appId, username)) {
        if (await hasAppPermission(appId, permissions.USER_BALANCE_SUB)) {
            let balance = await getBalance(username);
            if (balance - amount < 0) {
                return '{"jsonrpc": "2.0", "error": ' + errors.lowBalance + ',"id":' + request_id + '}'
            }
            await decrementBalance(username, amount, appId, description);
            return '{"jsonrpc": "2.0", "result":{"success":true},"id":' + request_id + '}'
        } else {
            return '{"jsonrpc": "2.0", "error": ' + errors.permission + ',"id":' + request_id + '}'
        }
    } else {
        return '{"jsonrpc": "2.0", "error": ' + errors.notActive + ',"id":' + request_id + '}'
    }
}

async function apiAllUsers(request_id, appToken) {
    let appId = await getAppIdByToken(appToken);
    let uids = getAllUIDs(appId);
    return '{"jsonrpc": "2.0", "error": ' + errors.todo + ',"id":' + request_id + '}'
}