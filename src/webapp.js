import express from "express";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import {setupDatabase} from "./db/db.js";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {
    callback,
    index,
    login,
    dashboard,
    shop,
    items,
    transactions,
    transfer,
    apps,
    postTransfer,
    developers
} from "./controller.js";
import {restapi} from "./restapi.js";

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
webapp.use('/css', express.static(__dirname + '/../css'))
webapp.use('/js', express.static(__dirname + '/../node_modules/bootstrap/dist/js'))
webapp.use('/favicon.ico', express.static(__dirname + '/../img/favicon.ico'))
webapp.use('/scripts', express.static(__dirname + '/../scripts'))
webapp.use(express.json());
webapp.use(express.urlencoded({extended: true}));
//
// API
//

webapp.use('/api/v1', restapi())
//
// WEP PAGES
//

webapp.get('/', index)

webapp.get('/dashboard', dashboard)

webapp.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

webapp.get('/developers',developers)

webapp.get('/login', login)

webapp.get('/callback', callback)

webapp.get('/shop', shop)

webapp.get('/items', items)

webapp.get('/transactions', transactions)

webapp.get('/transfer', transfer)
webapp.post('/transfer', postTransfer)

webapp.get('/apps', apps)

webapp.get('/registerapp', (req, res) => {
    res.render('admin/registerapp')
})

webapp.get('/deleteapp', (req, res) => {
    res.render('admin/deleteapp')
})


async function start() {
    await setupDatabase().then(() => {
        console.log(`Verbindung zu Datenbank auf ${process.env.DB_HOST}:${process.env.DB_PORT} hergestellt.`)
        webapp.listen(80, () =>
            console.log(`Express wurde gestartet.`)
        );
    })
}

start().then(() => {
});
