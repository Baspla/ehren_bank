import {createApp, createUser, startDB} from "./db.js";
import {permissions} from "../permissions.js";

startDB().then(() => {
    console.log("Connected to Redis");
})


createApp("Pay2Win Game", "pay2wingame", "A game that is pay2win", permissions.USER_INFO+permissions.USER_BALANCE+permissions.USER_BALANCE_SUB, true).then(value => {
    console.log(value);
})