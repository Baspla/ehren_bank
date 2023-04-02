import express from "express";
import {
    createCoupon,
    deleteCoupon,
    getCouponInfo,
    getCouponList,
    getCouponListByApp,
    getShopListByCoupon
} from "../db/coupon.js";
import {getShopInfo} from "../db/shop.js";

export const couponsRouter = express.Router()

couponsRouter.get('/', provideGetCoupons)
couponsRouter.get('/:coupon_id', provideGetCoupon)
couponsRouter.post('/', processPostCoupons)
couponsRouter.patch('/:coupon_id', processPatchCoupons)
couponsRouter.delete('/:coupon_id', processDeleteCoupons)

couponsRouter.get('/:coupon_id/shops', provideGetCouponShops)
couponsRouter.post('/:coupon_id/shops', processPostCouponShops)
couponsRouter.delete('/:coupon_id/shops/:shop_id', processDeleteCouponShops)

async function provideGetCoupons(req, res) {
    res.status(200).json(await getCouponListByApp(req.temp.app_id))
}

async function provideGetCoupon(req, res) {
    let coupon = await getCouponInfo(req.params.coupon_id)
    if (coupon === null) {
        res.status(404).json({error: 'Coupon nicht gefunden!'})
    } else if (coupon.app_id === req.temp.app_id) {
        res.status(200).json(coupon)
    } else {
        res.status(403).json({error: 'Forbidden'})
    }
}

function validateCoupon(res, code, value, type, startDate, endDate, usageLimit) {
    if (code.length < 3) {
        res.status(400).json({error: 'Der Code muss mindestens 3 Zeichen lang sein!'})
        return false
    }
    if (value < 0) {
        res.status(400).json({error: 'Der Wert muss positiv sein!'})
        return false
    }
    if (!(['percent', 'absolute', 'free', 'bonus'].includes(type))) {
        res.status(400).json({error: 'Der Typ ist ungültig!'})
        return false
    }
    if (startDate > endDate && endDate !== null) {
        res.status(400).json({error: 'Das Startdatum muss vor dem Enddatum liegen!'})
        return false
    }
    if (usageLimit < 0 && usageLimit !== null) {
        res.status(400).json({error: 'Die Verwendungsbeschränkung muss positiv sein!'})
        return false
    }
    return true
}

async function processPostCoupons(req, res) {
    if (req.body.code && req.body.value && req.body.type) {
        const code = req.body.code
        const value = req.body.value
        const type = req.body.type
        const startDate = req.body.startDate || null
        const endDate = req.body.endDate || null
        const usageLimit = req.body.usageLimit || null
        const usageCount = 0
        const created = new Date().getTime()
        if (validateCoupon(res, code, value, type, startDate, endDate, usageLimit)) {
            createCoupon(code, value, type, startDate, endDate, usageLimit, usageCount,created, req.temp.app_id).then(coupon => {
                res.status(200).json(coupon)
            }).catch(err => {
                res.status(500).json({error: err.message})
            })
        }
    } else {
        res.status(400).json({error: 'Fehlende Parameter!'})
    }
}

async function processPatchCoupons(req, res) {
    let info = await getCouponInfo(req.params.coupon_id)
    if (info === null) {
        res.status(404).json({error: 'Coupon nicht gefunden!'})
    } else if (info.app_id === req.temp.app_id) {
        if (req.body.code && req.body.value && req.body.type) {
            const code = req.body.code
            const value = req.body.value
            const type = req.body.type
            const startDate = req.body.startDate || null
            const endDate = req.body.endDate || null
            const usageLimit = req.body.usageLimit || null
            const usageCount = 0
            if (validateCoupon(res, code, value, type, startDate, endDate, usageLimit)) {
                createCoupon(code, value, type, startDate, endDate, usageLimit, usageCount, req.temp.app_id).then(coupon => {
                    res.status(200).json(coupon)
                }).catch(err => {
                    res.status(500).json({error: err.message})
                })
            }
        } else {
            res.status(400).json({error: 'Fehlende Parameter!'})
        }
    } else {
        res.status(403).json({error: 'Forbidden'})
    }
}


async function processDeleteCoupons(req, res) {
    let coupon = await getCouponInfo(req.params.coupon_id)
    if (coupon === null) {
        res.status(404).json({error: 'Coupon nicht gefunden!'})
    } else if (coupon.app_id === req.temp.app_id) {
        deleteCoupon(req.params.coupon_id).then(() => {
            res.status(200).json({message: 'Coupon gelöscht!'})
        }).catch(err => {
            res.status(500).json({error: err.message})
        })
    } else {
        res.status(403).json({error: 'Forbidden'})
    }
}

async function provideGetCouponShops(req, res) {
    let coupon = await getCouponInfo(req.params.coupon_id)
    if (coupon === null) {
        res.status(404).json({error: 'Coupon nicht gefunden!'})
    } else if (coupon.app_id === req.temp.app_id) {
        res.status(200).json(await getShopListByCoupon(req.params.coupon_id))
    } else {
        res.status(403).json({error: 'Forbidden'})
    }
}

async function processPostCouponShops(req, res) {
    let coupon = await getCouponInfo(req.params.coupon_id)
    if (coupon === null) {
        res.status(404).json({error: 'Coupon nicht gefunden!'})
    } else if (coupon.app_id === req.temp.app_id) {
        if (req.body.shop_id) {
            let shop = await getShopInfo(req.body.shop_id)
            if (shop === null) {
                res.status(404).json({error: 'Shop nicht gefunden!'})
            } else if (shop.app_id === req.temp.app_id) {
                addCouponShopLink(req.params.coupon_id, req.body.shop_id).then(() => {
                    res.status(200).json({message: 'Shop hinzugefügt!'})
                }).catch(err => {
                    res.status(500).json({error: err.message})
                })
            } else {
                res.status(403).json({error: 'Forbidden'})
            }
        }
    } else {
        res.status(403).json({error: 'Forbidden'})
    }

}

async function processDeleteCouponShops(req, res) {
    let coupon = await getCouponInfo(req.params.coupon_id)
    if (coupon === null) {
        res.status(404).json({error: 'Coupon nicht gefunden!'})
    } else if (coupon.app_id === req.temp.app_id) {
        if (req.body.shop_id) {
            let shop = await getShopInfo(req.body.shop_id)
            if (shop === null) {
                res.status(404).json({error: 'Shop nicht gefunden!'})
            } else if (shop.app_id === req.temp.app_id) {
                deleteCouponShopLink(req.params.coupon_id, req.body.shop_id).then(() => {
                    res.status(200).json({message: 'Shop entfernt!'})
                }).catch(err => {
                    res.status(500).json({error: err.message})
                })
            } else {
                res.status(403).json({error: 'Forbidden'})
            }
        }
    } else {
        res.status(403).json({error: 'Forbidden'})
    }
}