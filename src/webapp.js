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
    developers, isLoggedIn, makeadmin, promotions, registerApp, admin, unknownPage, logout, postMakeadmin, debug
} from "./controller.js";
import {restapi} from "./restapi.js";
import {isAdmin} from "./db/admin.js";
import {deleteApp} from "./db/app.js";

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

webapp.get('/logout', logout)

webapp.get('/developers', developers)

webapp.get('/login', login)

webapp.get('/callback', callback)

webapp.get('/shop', shop)

webapp.get('/items', items)

webapp.get('/transactions', transactions)

webapp.get('/transfer', transfer)
webapp.post('/transfer', postTransfer)

webapp.get('/apps', apps)


const adminRouter = express.Router()
adminRouter.get('/', admin)
adminRouter.get('/registerapp', registerApp)
adminRouter.get('/deleteapp', deleteApp)
adminRouter.get('/promotions', promotions)

webapp.use('/admin', checkIsAdmin, adminRouter)

webapp.get('/makeadmin', makeadmin)
webapp.post('/makeadmin', postMakeadmin)

webapp.get('/debug', debug)

webapp.get('*', unknownPage)


async function start() {
    await setupDatabase().then(() => {
        console.log(`Verbindung zu Datenbank auf ${process.env.DB_HOST}:${process.env.DB_PORT} hergestellt.`)
        webapp.listen(80, () =>
            console.log(`Express wurde gestartet.`)
        );
    })
}

function checkIsAdmin(req, res, next) {
    if (isLoggedIn(req)) {
        isAdmin(req.session.user_id).then(isAdmin => {
            if (isAdmin) {
                next()
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent('/admin'))
    }
}

start().then(() => {
});
