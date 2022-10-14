import {createApp, startDB} from "./db.js";

startDB().then(() => {
    console.log("Connected to Redis");
})


createApp("testappid","Test App", "A game that is pay2win", "http://localhost",0).then(value => {
    console.log(value);
})