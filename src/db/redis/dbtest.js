import {createApp, startDB} from "../db.js";
import * as redis from "redis";
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

export const connection = rc;
startDB().then(() => {
    console.log("Connected to Redis");
})


createApp("testappid","Test App", "A game that is pay2win", "http://localhost",0).then(value => {
    console.log(value);
})