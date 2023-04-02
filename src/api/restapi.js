import express from "express";
import {getAppIDFromAPIKey, getAppInfo} from "../db/app.js";
import {checkPermission} from "../util/controller_utils.js";
import {usersRouter} from "./usersRouter.js";
import {permissions} from "../util/permissions.js";
import {appRouter} from "./appRouter.js";
import {couponsRouter} from "./couponsRouter.js";
import {shopsRouter} from "./shopsRouter.js";
import {itemsRouter} from "./itemsRouter.js";

export function restapi() {
    const router = express.Router()
    router.use((req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(403).json({error: 'Fehlender Token!'});
        }
        if (!req.headers.authorization.startsWith('Bearer ')) {
            return res.status(403).json({error: 'Falscher Authorization Header!'});
        }
        const apikey = req.headers.authorization.split(' ')[1];
        getAppIDFromAPIKey(apikey).then(app_id => {
            if (app_id) {
                req.temp.app_id=app_id
                next()
            } else {
                res.status(401).json({error: 'Ungültiger Token!'})
            }
        })
    })
    router.get('/', (req, res) => {
        res.json({endpoints: ['/users', '/app', '/coupons', '/shops', '/items']})
    })
    router.use('/users', usersRouter)
    router.use('/app', appRouter)
    router.use('/coupons',appHasPermission(permissions.SHOP), couponsRouter)
    router.use('/shops',appHasPermission(permissions.SHOP), shopsRouter)
    router.use('/items',appHasPermission(permissions.ITEMS), itemsRouter)
    router.use('*', (req, res) => {
        res.status(404).json({error: 'Not found!'})
    })
    return router
}

export function appHasPermission(permission) {
    return (req, res, next) => {
        if (req.temp.app_id) {
            getAppInfo(req.temp.app_id).then(app => {
                if (checkPermission(app.permissions, permission)) {
                    next()
                } else {
                    res.status(403).json({error: 'Keine Berechtigung!'})
                }
            })
        } else {
            res.status(403).json({error: 'Keine Berechtigung!'})
        }
    }
}