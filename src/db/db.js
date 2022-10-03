import {errors} from "../errors.js";
import {v4 as uuid} from "uuid";
import * as redis from "redis";
import * as crypto from "crypto";

const rc = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

rc.on('error', err => {
    console.log('Redis Error: ' + err);
});

function escape(text) {
    return text.replaceAll(':', '%58').replaceAll('["”“’‘„‘’‚“”„‹›]]', '%quot').replaceAll("'", '%quot');
}

export async function startDB() {
    return rc.connect()
}

export function bool(boolean) {
    return boolean ? 1 : 0;
}

export async function createOrUpdateUser(uuid, displayname) {
    return Promise.all([
        rc.hSet('cash:user:' + username, 'displayname', displayname),
        rc.hSet('cash:user:' + username, 'lastlogin', new Date().getTime()),
        rc.hSet('cash:user:' + username, 'created', new Date().getTime(), {NX: true}),
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
            created: parseInt(values[0].created),
            lastlogin: parseInt(values[0].lastlogin)
        }
    })
}
export async function getUserCount() {
    return rc.zCard('cash:balance')
}