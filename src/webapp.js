import {jsonrpcHandler} from "./jsonrpc.js"
import express from "express";
import session from 'express-session'
import cookieParser from 'cookie-parser';
import {startDB} from "./db/db.js";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {callback, index, login} from "./controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const webapp = express()

webapp.use(cookieParser());
webapp.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))
webapp.set('view engine', 'pug')
webapp.use('/css', express.static(__dirname + '/../node_modules/bootstrap/dist/css'))
webapp.use('/js', express.static(__dirname + '/../node_modules/bootstrap/dist/js'))
webapp.use('/favicon.ico', express.static(__dirname + '/../img/favicon.ico'))
webapp.use('/scripts', express.static(__dirname + '/../scripts'))
webapp.use(express.json());

//
// JSON RPC ENDPOINT
//

webapp.post('/jsonrpc', jsonrpcHandler);

//
// WEP PAGES
//

webapp.get('/', index)

webapp.get('/apps', async (req, res) => {
    if (req.session.uuid !== undefined) {
        let displayname = req.session.displayname
        let apps = await getAppListForUser(uuid)
        res.render('apps', {apps: apps, displayname: displayname})
    } else {
        res.redirect('/login')
    }
})

webapp.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

webapp.get('/login',login)

webapp.get('/callback',callback)

webapp.get('/registerapp', (req, res) => {
    res.render('registerapp')
})

webapp.get('/testing', (req, res) => {
    res.render('testing')
})

webapp.get('/deleteapp', (req, res) => {
    res.render('deleteapp')
})

async function start() {
    await startDB().then(() => {
        console.log(`Verbindung zu Redis auf ${process.env.REDIS_HOST}:${process.env.REDIS_PORT} hergestellt.`)
        webapp.listen(80, () =>
            console.log(`Express wurde gestartet.`)
        );
    })
}

start().then(() => {
});
