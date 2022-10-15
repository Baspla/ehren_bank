import * as redis from "redis";
import e from "express";

const rc = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

rc.on('error', err => {
    console.log('Redis Error: ' + err);
});

export async function startDB() {
    return rc.connect()
}

export function bool(boolean) {
    return boolean ? 1 : 0;
}

//
// ADMIN
//

export async function makeAdmin(uuid) {
    return rc.sAdd('cash:admin', uuid);
}

export async function isAdmin(uuid) {
    return rc.sIsMember('cash:admin', uuid);
}

export async function removeAdmin(uuid) {
    return rc.sRem('cash:admin', uuid);
}

//
// USER
//

export async function createOrUpdateUser(uuid, displayname) {
    return Promise.all([
        rc.hSet('cash:user:' + uuid, 'displayname', displayname),
        rc.hSet('cash:user:' + uuid, 'lastlogin', new Date().getTime().toString()),
        rc.hSetNX('cash:user:' + uuid, 'created', new Date().getTime().toString()),
        rc.zAdd('cash:balance', {score: 0, value: uuid}, {NX: true})
    ])
}

export async function getUserInfo(uuid) {
    let userData = rc.hGetAll('cash:user:' + uuid);
    let balance = rc.zScore('cash:balance', uuid);
    return Promise.all([userData, balance]).then(values => {
        return {
            uuid: uuid,
            displayname: values[0].displayname,
            balance: values[1],
            created: parseInt(values[0].created) || undefined,
            lastlogin: parseInt(values[0].lastlogin) || undefined
        }
    })
}

export async function getUserCount() {
    return rc.zCard('cash:balance')
}

export async function getUserList() {
    return rc.zRange('cash:balance', 0, -1)
}

export async function getUserBalance(uuid) {
    return rc.zScore('cash:balance', uuid)
}

function addTransaction(appid, uuid, amount, description) {
    let date = new Date().getTime().toString();
    return rc.zAdd('cash:user:' + uuid + ':transactions', {
        score: date,
        value: JSON.stringify({appid: appid, amount: amount, description: description,date: date})
    })
}

export async function addUserBalance(appid, uuid, amount, description) {
    return rc.zIncrBy('cash:balance', amount, uuid).then((newBalance) => {
        return addTransaction(appid, uuid, amount, description).then(() => {
            return newBalance
    })})
}

export async function userExists(uuid) {
    return rc.exists('cash:user:' + uuid)
}

//
// APP
//

export async function getAppIDbyToken(token) {
    return rc.hGet('cash:apptokens', token)
}

export async function createApp(appid, name, description, url, permissions) {
    return Promise.all([
        rc.hSetNX('cash:app:' + appid, 'name', name.toString()),
        rc.hSetNX('cash:app:' + appid, 'description', description.toString()),
        rc.hSetNX('cash:app:' + appid, 'url', url.toString()),
        rc.hSetNX('cash:app:' + appid, 'permissions', permissions.toString()),
        rc.hSetNX('cash:app:' + appid, 'created', new Date().getTime().toString())
    ])
}

export async function getUserTransactions(uuid, limit = -1, offset = 0) {
    return rc.zRange('cash:user:' + uuid + ':transactions', offset, limit, {REV:true}).then((transactions) => {
        return transactions.map((transaction) => {
            return JSON.parse(transaction)
        })
    })
}

export async function getAppInfo(appid) {
    let appData = rc.hGetAll('cash:app:' + appid);
    return appData.then(values => {
        return {
            appid: appid,
            name: values.name,
            description: values.description,
            url: values.url,
            permissions: values.permissions,
            created: parseInt(values.created) || undefined
        }
    })
}

export async function deleteApp(appid) {
    //TODO: Delete App
    //TODO: Delete Maintainer Entries
    //TODO: Delete App Tokens
    //TODO: Delete Coupons
    //TODO: Delete Shop Entries
    //TODO: Don't delete Items?
    return false;
}

export async function updateApp(appid, name, description, url, permissions) {
    return Promise.all([
        rc.hSet('cash:app:' + appid, 'name', name),
        rc.hSet('cash:app:' + appid, 'description', description),
        rc.hSet('cash:app:' + appid, 'url', url),
        rc.hSet('cash:app:' + appid, 'permissions', permissions)
    ])
}