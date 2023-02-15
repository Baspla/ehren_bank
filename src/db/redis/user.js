import {getAppInfo} from "../db.js";

/*export async function createOrUpdateUser(rc,uuid, displayname) {
    return Promise.all([
        rc.hSet('cash:user:' + uuid, 'displayname', displayname),
        rc.hSet('cash:user:' + uuid, 'lastlogin', new Date().getTime().toString()),
        rc.hSetNX('cash:user:' + uuid, 'created', new Date().getTime().toString()),
        rc.zAdd('cash:balance', {score: 0, value: uuid}, {NX: true})
    ])
}

export async function getUserInfo(rc,uuid) {
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


export async function getUserCount(rc) {
    return rc.zCard('cash:balance')
}


export async function getUserList(rc,uuid) {
    return rc.zRange('cash:balance', 0, -1).then((uuids) => {
        let promises = []
        for (let uuid of uuids) {
            promises.push(getUserInfo(uuid))
        }
        return Promise.all(promises)
    })
}

export async function getUserBalance(rc,uuid) {
    return rc.zScore('cash:balance', uuid)
}

function addTransaction(rc,appid, uuid, amount, description) {
    let date = new Date().getTime().toString();
    return rc.zAdd('cash:user:' + uuid + ':transactions', {
        score: date,
        value: JSON.stringify({appid: appid, amount: amount, description: description, date: date})
    })
}

export async function getUserTransactions(rc,uuid, limit = -1, offset = 0) {
    return rc.zRange('cash:user:' + uuid + ':transactions', offset, limit, {REV: true}).then((transactions) => {
        return Promise.all(transactions.map(async (transaction) => {
            let trans = JSON.parse(transaction);
            if (trans.appid.startsWith('user:')) {
                trans.name = await getUserInfo(trans.appid.substring(5)).then((user) => {
                    return user.displayname
                });
            } else {
                trans.name = await getAppInfo(trans.appid).then((app) => {
                    return app.name
                });
            }
            return trans
        }))
    })
}

export async function modifyUserBalance(rc,appid, uuid, amount, description) {
    return rc.zIncrBy('cash:balance', amount, uuid).then((newBalance) => {
        return addTransaction(appid, uuid, amount, description).then(() => {
            return newBalance
        })
    })
}

export async function userExists(rc,uuid) {
    return rc.exists('cash:user:' + uuid)
}*/