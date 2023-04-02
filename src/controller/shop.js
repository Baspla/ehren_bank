import {getShopInfo, getShopList} from "../db/shop.js";
import {getCouponInfoByCode, isCouponValid, updateCouponUsageCount} from "../db/coupon.js";
import {getUserInfo, modifyUserBalance} from "../db/user.js";
import {createItem} from "../db/item.js";
import {createTransaction} from "../db/transaction.js";

export async function renderShops(req, res) {
    res.render('shop/shop', {user: req.temp.user, path: req.originalUrl, shops: await getShopList()})
}

export async function renderShopInfo(req, res) {
    let shop = await getShopInfo(req.params.shop_id)
    res.render('shop/info', {user: req.temp.user, path: req.originalUrl, shop: shop})
}

export async function renderShopKaufen(req, res) {
    res.render('shop/buy', {
        user: req.temp.user,
        path: req.originalUrl,
        shop: await getShopInfo(req.params.shop_id)
    })
}

export async function processShopKaufen(req, res) {
    let shop_id = req.params.shop_id
    let coupon_code = req.body.coupon

    function now() {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    if (shop_id == null || shop_id === "") {
        res.json({success: false, error: "Invalid request"})
    } else {
        let shop = await getShopInfo(shop_id)
        if (shop == null) {
            return res.json({success: false, error: "Invalid request"})
        }
        let price = shop.price
        let coupon
        let loops = 1
        let prefix = ""
        if (coupon_code != null && coupon_code !== "") {
            coupon = await getCouponInfoByCode(coupon_code)
            if (coupon.length === 0) {
                res.json({success: false, error: "Coupon not valid"})
                return
            } else {
                let valid = await isCouponValid(coupon[0].coupon_id, shop_id)
                if(!valid){
                    res.json({success: false, error: "Coupon not valid"})
                    return
                }
                if (valid[0]['?column?'] === null) {
                    res.json({success: false, error: "Coupon not valid"})
                    return
                }
                price = await calculatePriceWithCoupon(shop_id, coupon[0].type, coupon[0].value)
                if (coupon[0].type==="bonus"){
                    loops = 1+coupon[0].value
                    prefix = loops+"x "
                }
            }
        }
        let userinfo = await getUserInfo(req.temp.user.user_id)
        if (price > userinfo.balance) {
            res.json({success: false, error: "Insufficient funds"})
        } else {
            await modifyUserBalance(req.temp.user.user_id, -price)
            await createTransaction(req.temp.user.user_id, null, null, shop.app_id, -price, "Shop: "+prefix+shop.name)
            for (let i = 0; i < loops; i++) {
                await createItem(req.temp.user.user_id, shop.item_name, shop.item_description, shop.item_image, shop.item_rarity, shop.item_tags, now(), shop.app_id)
            }
            if(coupon != null){
                await updateCouponUsageCount(coupon[0].coupon_id,coupon[0].usage_count+1)
            }
            res.json({success: true})
        }
    }
}

async function calculatePriceWithCoupon(shop_id, type, value) {
    return await getShopInfo(shop_id).then(shop => {
        if (type === "percent") {
            return Math.min(Math.max(0, Math.round(shop.price - (shop.price * (value / 100)))), shop.price)
        } else if (type === "fixed") {
            return Math.max(0, shop.price - value)
        } else if (type === "free") {
            return 0
        } else {
            return shop.price
        }
    }).catch(err => {
        console.log(err)
        return -1
    })
}

export async function processShopCoupon(req, res) {
    let shop_id = req.params.shop_id
    let coupon_code = req.body.coupon
    if (coupon_code == null || coupon_code === "" || shop_id == null || shop_id === "") {
        res.json({success: false, error: "Invalid request"})
    } else {
        await getCouponInfoByCode(coupon_code).then(coupon => {
                if (coupon.length === 0) {
                    res.json({success: false, error: "Coupon not valid"})
                } else {
                    isCouponValid(coupon[0].coupon_id, shop_id).then(valid => {
                            if (valid) {
                                if (valid[0]['?column?'] === null) {
                                    res.json({success: false, error: "Coupon not valid"})
                                    return
                                }
                                calculatePriceWithCoupon(shop_id, coupon[0].type, coupon[0].value).then(price => {
                                    res.json({
                                        success: true, coupon: {
                                            coupon_id: coupon[0].coupon_id,
                                            coupon_code: coupon[0].code,
                                            type: coupon[0].type,
                                            value: coupon[0].value,
                                        }, price: price
                                    })
                                })
                            } else {
                                res.json({success: false, error: "Coupon not valid"})
                            }
                        }
                    )
                }
            }
        )
    }
}