import express from "express";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import {setupDatabase} from "./db/db.js";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {restapi} from "./api/restapi.js";
import {
    renderApps,
    renderAppsCreate,
    renderAppsDelete,
    renderAppsEdit,
    renderAppsInfo,
    processAppsCreate,
    processAppsEdit
} from "./controller/admin/apps.js";
import {getUserInfo} from "./db/user.js";
import {
    renderPromotions,
    renderPromotionsCreate,
    renderPromotionsDelete,
    renderPromotionsEdit,
    processPromotionsCreate,
    processPromotionsEdit
} from "./controller/admin/promotions.js";
import {
    processShopCoupon,
    processShopKaufen,
    renderShopInfo,
    renderShopKaufen,
    renderShops
} from "./controller/shop.js";
import {renderItems, renderItemsInfo} from "./controller/items.js";
import {renderTransfer, processTransfer} from "./controller/transfer.js";
import {renderDashboard} from "./controller/dashboard.js";
import {renderIndex} from "./controller/index.js";
import {renderAppsLimited} from "./controller/apps.js";
import {renderDevelopers} from "./controller/developers.js";
import {renderTransactions} from "./controller/transactions.js";
import {renderAdmin} from "./controller/admin/admin.js";
import {callback, login, logout} from "./controller/auth.js";
import {renderDebug} from "./controller/debug.js";
import {renderMakeadmin, processMakeadmin} from "./controller/makeadmin.js";
import {renderUnknownPage} from "./controller/404.js";
import {errorHandler, isLoggedIn} from "./util/controller_utils.js";
import bodyParser from "body-parser";

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
webapp.use('/css', express.static(__dirname + '/../static/css'))
webapp.use('/js', express.static(__dirname + '/../node_modules/bootstrap/dist/js'))
webapp.use('/favicon.ico', express.static(__dirname + '/../static/img/favicon.ico'))
webapp.use('/scripts', express.static(__dirname + '/../static/scripts'))
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

webapp.get('/', renderIndex)

webapp.get('/login', login)
webapp.get('/callback', callback)

const userRouter = express.Router()
userRouter.use(checkIsLoggedIn)
userRouter.use(annotateUserInformation)

userRouter.get('/dashboard', renderDashboard)

userRouter.get('/logout', logout)

userRouter.get('/developers', renderDevelopers)

const shopRouter = express.Router()
shopRouter.get('/', renderShops)
shopRouter.get('/:shop_id', renderShopKaufen)
shopRouter.post('/:shop_id/kaufen', processShopKaufen)
shopRouter.post('/:shop_id/coupon', processShopCoupon)
userRouter.use('/shop', shopRouter)

const itemsRouter = express.Router()
itemsRouter.get('/:item_id', renderItemsInfo)
itemsRouter.get('/', renderItems)
userRouter.use('/items', itemsRouter)

userRouter.get('/transactions', renderTransactions)

userRouter.get('/transfer', renderTransfer)
userRouter.post('/transfer', processTransfer)

userRouter.get('/apps', renderAppsLimited)


const adminRouter = express.Router()
adminRouter.get('/', renderAdmin)

const appRouter = express.Router()
appRouter.get('/', renderApps)
appRouter.get('/create', renderAppsCreate)
appRouter.get('/:app_id/' ,renderAppsInfo)
appRouter.get('/:app_id/edit', renderAppsEdit)
appRouter.get('/:app_id/delete', renderAppsDelete)
appRouter.post('/create', processAppsCreate)
appRouter.post('/:app_id/edit', processAppsEdit)
adminRouter.use('/apps' ,appRouter)


const promotionRouter = express.Router()
promotionRouter.get('/', renderPromotions)
promotionRouter.get('/create', renderPromotionsCreate)
promotionRouter.get('/:promotion_id', (req, res) => res.redirect('/admin/promotions'))
promotionRouter.get('/:promotion_id/edit', renderPromotionsEdit)
promotionRouter.get('/:promotion_id/delete', renderPromotionsDelete)
promotionRouter.post('/create', processPromotionsCreate)
promotionRouter.post('/:promotion_id/edit', processPromotionsEdit)
adminRouter.use('/promotions', promotionRouter)


userRouter.use('/admin', checkIsAdmin, adminRouter)

userRouter.get('/makeadmin', renderMakeadmin)
userRouter.post('/makeadmin', processMakeadmin)

userRouter.get('/debug', renderDebug)

webapp.use(userRouter)
webapp.get('*', renderUnknownPage)

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
