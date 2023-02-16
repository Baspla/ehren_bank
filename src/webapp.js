import express from "express";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import {setupDatabase} from "./db/db.js";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {
    admin,
    apps,
    callback,
    dashboard,
    debug,
    developers,
    errorHandler,
    index,
    isLoggedIn,
    items,
    login,
    logout,
    makeadmin,
    postMakeadmin,
    postTransfer,
    shop,
    transactions,
    transfer,
    unknownPage
} from "./controller/controller.js";
import {restapi} from "./restapi.js";
import {
    getApps,
    getAppsCreate,
    getAppsDelete,
    getAppsEdit,
    getAppsInfo,
    postAppsCreate,
    postAppsEdit
} from "./controller/admin/apps.js";
import {getUserInfo} from "./db/user.js";
import {
    getPromotions,
    getPromotionsCreate,
    getPromotionsDelete,
    getPromotionsEdit,
    postPromotionsCreate,
    postPromotionsEdit
} from "./controller/admin/promotions.js";

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
webapp.use((req, res, next) => {
    req.temp = {}
    next()
})
//
// API
//

webapp.use('/api/v1', restapi())
//
// WEP PAGES
//

webapp.get('/', index)

webapp.get('/login', login)
webapp.get('/callback', callback)

const userRouter = express.Router()
userRouter.use(checkIsLoggedIn)
userRouter.use(annotateUserInformation)

userRouter.get('/dashboard', dashboard)

userRouter.get('/logout', logout)

userRouter.get('/developers', developers)


userRouter.get('/shop', shop)

userRouter.get('/items', items)

userRouter.get('/transactions', transactions)

userRouter.get('/transfer', transfer)
userRouter.post('/transfer', postTransfer)

userRouter.get('/apps', apps)


const adminRouter = express.Router()
adminRouter.get('/', admin)

const appRouter = express.Router()
appRouter.get('/', getApps)
appRouter.get('/create', getAppsCreate)
appRouter.get('/:app_id/', logParams ,getAppsInfo)
appRouter.get('/:app_id/edit', getAppsEdit)
appRouter.get('/:app_id/delete', getAppsDelete)
appRouter.post('/create', postAppsCreate)
appRouter.post('/:app_id/edit', postAppsEdit)
adminRouter.use('/apps' ,appRouter)


const promotionRouter = express.Router()
promotionRouter.get('/', getPromotions)
promotionRouter.get('/create', getPromotionsCreate)
promotionRouter.get('/edit', getPromotionsEdit)
promotionRouter.get('/delete', getPromotionsDelete)
promotionRouter.post('/create', postPromotionsCreate)
promotionRouter.post('/edit', postPromotionsEdit)
adminRouter.use('/promotions', promotionRouter)


userRouter.use('/admin', checkIsAdmin, adminRouter)

userRouter.get('/makeadmin', makeadmin)
userRouter.post('/makeadmin', postMakeadmin)

userRouter.get('/debug', debug)

webapp.use(userRouter)
webapp.get('*', unknownPage)



function logParams(req, res, next) {
    next()
}

async function start() {
    await setupDatabase().then(() => {
        console.log(`Verbindung zu Datenbank auf ${process.env.DB_HOST}:${process.env.DB_PORT} hergestellt.`)
        webapp.listen(80, () =>
            console.log(`Express wurde gestartet.`)
        );
    })
}

function annotateUserInformation(req, res, next) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.user_id).then(user => {
            req.temp.user = user
            next()
        }).catch(errorHandler)
    } else {
        next()
    }
}

function checkIsLoggedIn(req, res, next) {
    if (isLoggedIn(req)) {
        next()
    } else {
        console.log("Redirecting to " + '/login?returnURL=' + encodeURIComponent(req.path))
        res.redirect('/login?returnURL=' + encodeURIComponent(req.path))
    }
}

function checkIsAdmin(req, res, next) {
    if (req.temp.user.is_admin) {
        next()
    } else {
        res.redirect('/')
    }
}

start().then(() => {
});
