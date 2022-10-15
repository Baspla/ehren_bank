import express from "express";
import {
    addUserBalance,
    getAppIDbyToken,
    getAppInfo,
    getUserBalance,
    getUserInfo,
    getUserList,
    userExists
} from "./db/db.js";
import {permissions} from "./permissions.js";

export function restapi() {
    const router = express.Router()
    router.use((req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(403).json({error: 'Fehlender Token!'});
        }
        if (!req.headers.authorization.startsWith('Bearer ')) {
            return res.status(403).json({error: 'Falscher Authorization Header!'});
        }
        const token = req.headers.authorization.split(' ')[1];
        getAppIDbyToken(token).then(appid => {
            console.log(appid)
            if (appid) {
                req.temp = {appid: appid}
                next()
            } else {
                res.status(401).json({error: 'Ungültiger Token!'})
            }
        })
    })
    router.use('/users', users())
    router.use('/app', app())
    router.use('/coupons', coupons())
    router.use('/shops', shops())
    return router
}

//
// /users
//
function users() {
    const router = express.Router()
    router.get('/', (req, res) => {
        getUserList().then(users => {
            res.send(users)
        })
    })
    router.use('/:uuid', uuid())
    return router
}

//
// /users/:uuid
//
function uuid() {
    const router = express.Router()
    router.get('/', (req, res) => {
        getUserInfo(req.temp.uuid).then(user => {
            res.send(user)
        })
    })
    router.use('/balance', balance())
    router.use('/items', items())
    const storeUUID = (req, res, next) => {
        req.temp.uuid = req.params.uuid
        userExists(req.temp.uuid).then(exists => {
            if (exists) {
                next()
            } else {
                res.status(404).json({error: 'User nicht gefunden!'})
            }
        })
    }
    return [storeUUID, router]
}


function appHasPermission(permission) {
    return (req,res,next)=>{
        if(req.temp.appid){
            getAppInfo(req.temp.appid).then(app=>{
                if((app.permissions & 1>>permission) === 1){
                    next()
                }else{
                    res.status(403).json({error: 'Keine Berechtigung!'})
                }
            })
        }else{
            res.status(403).json({error: 'Keine Berechtigung!'})
        }
    }
}

//
// /users/:uuid/balance
//
function balance() {
    const router = express.Router()
    router.get('/', (req, res) => {
        getUserBalance(req.temp.uuid).then(balance => {
            res.status(200).json({balance:balance})
        })
    })
    router.patch('/', appHasPermission(permissions.BALANCE),(req, res) => {
        if(req.body.add&&req.body.description) {
            const add = parseInt(req.body.add)
            const description = req.body.description
            if (add <= 0) {
                res.status(400).json({error: 'add muss größer 0 sein!'})
                return
            }
            addUserBalance(req.temp.appid,req.temp.uuid, add,description).then(balance => {
                res.status(200).json({balance:balance})
            })
        } else {
            res.status(400).json({error: 'Fehlender Parameter!'})
        }
    })
    return router
}

//
// /users/:uuid/items
//
function items() {
    const router = express.Router()
    router.get('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.use('/:itemid', itemid())
    return router
}

//
// /users/:uuid/items/:itemid
//
function itemid() {
    const router = express.Router()
    router.post('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.use((req, res, next) => {
        if (itemExists(req.temp.uuid, req.temp.itemid)) {
            next()
        } else {
            res.status(404).json({error: 'Item nicht gefunden!'})
        }
    })
    router.get('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.patch('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.delete('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    const storeItemID = (req, res, next) => {
        req.temp.itemid = req.params.itemid
        next()
    }
    return [storeItemID, router]
}


//
// /app
//
function app() {
    const router = express.Router()
    router.get('/', (req, res) => {
        getAppInfo(req.temp.appid).then(app => {
            res.status(200).json(app)
        })
    })

    router.patch('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    return router
}

//
// /coupons
//
function coupons() {
    const router = express.Router()
    router.get('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.use('/:couponid', couponid())
    return router
}

//
// /coupons/:couponid
//
function couponid() {
    const router = express.Router()

    router.post('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.use((req, res, next) => {
        if (couponExists(req.temp.couponid)) {
            next()
        } else {
            res.status(404).json({error: 'Coupon nicht gefunden!'})
        }
    })
    router.get('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.patch('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.delete('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })

    const storeCouponID = (req, res, next) => {
        req.temp.couponid = req.params.couponid
        next()
    }
    return [storeCouponID, router]
}

//
// /shops
//
function shops() {
    const router = express.Router()
    router.get('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.use('/:shopid', shopid())
    return router
}


//
// /shops/:shopid
//
function shopid() {
    const router = express.Router()
    router.post('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.use((req, res, next) => {
        if (shopExists(req.temp.couponid)) {
            next()
        } else {
            res.status(404).json({error: 'Shop nicht gefunden!'})
        }
    })
    router.get('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.patch('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    router.delete('/', (req, res) => {
        res.status(200).json({message: "Not implemented"})
    })
    const storeShopID = (req, res, next) => {
        req.temp.shopid = req.params.shopid
        next()
    }
    return [storeShopID, router]
}