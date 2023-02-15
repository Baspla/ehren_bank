import express from "express";
import {permissions} from "./permissions.js";
import {getUserIDFromGuardID, getUserInfo, getUserList, modifyUserBalance} from "./db/user.js";
import {getAppIDFromAPIKey, getAppInfo} from "./db/app.js";
import {createTransaction, getTransactionList} from "./db/transaction.js";

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
                req.temp = {app_id: app_id}
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
    router.use('/test', test())
    return router
}

function appHasPermission(permission) {
    return (req, res, next) => {
        if (req.temp.app_id) {
            getAppInfo(req.temp.app_id).then(app => {
                if ((app.permissions & 1 >> permission) === 1) {
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

function test() {
    const router = express.Router()
    router.get('/', async (req, res) => {
        await createTransaction(4, null, null, 1, 69, "ESGEHT")
        let tlist = await getTransactionList()
        res.send(tlist)
    })
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
    router.use('/:guard_id', guard_id())
    return router
}

//
// /users/:guard_id
//
function guard_id() {
    const router = express.Router()
    const storeUserID = async (req, res, next) => {
        req.temp.guard_id = req.params.guard_id
        req.temp.user_id = await getUserIDFromGuardID(req.params.guard_id)
        getUserInfo(req.temp.user_id).then(info => {
            if (info) {
                req.temp.user = info;
                next()
            } else {
                res.status(404).json({error: 'User nicht gefunden!'})
            }
        })
    }
    router.get('/', (req, res) => {
        getUserInfo(req.temp.user_id).then(user => {
            res.send(user)
        })
    })
    router.use('/balance', balance())
    router.use('/items', items())
    return [storeUserID, router]
}


//
// /users/:guard_id/balance
//
function balance() {
    const router = express.Router()
    router.get('/', (req, res) => {
            res.status(200).json({balance: req.temp.user.balance})
        }
    )
    router.patch('/', appHasPermission(permissions.BALANCE), (req, res) => {
        if (req.body.add && req.body.description) {
            const add = parseInt(req.body.add)
            const description = req.body.description
            if (add <= 0) {
                res.status(400).json({error: 'add muss größer 0 sein!'})
                return
            }
            modifyUserBalance(req.temp.user_id, add).then(balance => {
                createTransaction(req.temp.user_id, null, req.temp.user_id, req.temp.app_id, add, description)
                    .then(transaction => {
                    res.status(200).json({balance: balance})
                })
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
        getFilteredItemList(req.temp.uuid).then(items => {
            res.status(200).json(items)
        }).catch(error => {
            console.log(error)
            res.status(500).json({error: 'Interner Serverfehler!'})
        })
    })
    router.post('/', (req, res) => {
        if (!req.body.name || !req.body.description || !req.body.tags || !req.body.rarity || !req.body.image) {
            return res.status(400).json({error: 'Fehlender Parameter!'})
        }
        if (req.body.rarity < 0 || req.body.rarity > 5) {
            return res.status(400).json({error: 'Ungültige Seltenheit!'})
        }
        if (req.body.description.length > 1000) {
            return res.status(400).json({error: 'Beschreibung zu lang!'})
        }
        if (req.body.name.length > 100) {
            return res.status(400).json({error: 'Name zu lang!'})
        }
        if (req.body.tags.length > 100) {
            return res.status(400).json({error: 'Tags zu lang!'})
        }
        if (req.body.image.length > 1000) {
            return res.status(400).json({error: 'Bild URL zu lang!'})
        }
        if (req.body.name.length < 3) {
            return res.status(400).json({error: 'Name zu kurz!'})
        }
        if (req.body.tags.length < 1) {
            return res.status(400).json({error: 'Zu wenig Tags!'})
        }
        createItem(req.temp.user_id, req.temp.app_id, req.body.name, req.body.description, req.body.tags, req.body.rarity, req.body.image).then(itemid => {
            getItem(itemid).then(item => {
                return res.status(200).json(item)
            })
        }).catch(error => {
            return res.status(500).json({error: 'Interner Serverfehler!'})
        })
    })
    router.use('/:itemid', itemid())
    return router
}

//
// /users/:uuid/items/:itemid
//
function itemid() {
    const router = express.Router()
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
        getAppInfo(req.temp.app_id).then(app => {
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