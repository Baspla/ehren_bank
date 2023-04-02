import express from "express";
import {createShop, deleteShop, getShopInfo, getShopListByAppID, updateShop} from "../db/shop.js";

export const shopsRouter = express.Router()
shopsRouter.get('/', provideGetShops)
shopsRouter.get('/:shop_id', provideGetShop)
shopsRouter.post('/', processPostShop)
shopsRouter.patch('/:shop_id', processPatchShop)
shopsRouter.delete('/:shop_id', processDeleteShop)

async function provideGetShops(req, res) {
    res.status(200).json(await getShopListByAppID(req.temp.app_id))
}

async function provideGetShop(req, res) {
    let shop = await getShopInfo(req.params.shop_id)
    if (shop === null) {
        res.status(404).json({error: 'Shop nicht gefunden!'})
    } else if (shop.app_id === req.temp.app_id) {
        res.status(200).json(shop)
    } else {
        res.status(403).json({error: 'Forbidden'})
    }
}

async function processPostShop(req, res) {
    if (req.body.name && req.body.description && req.body.price && req.body.item && req.body.item.name && req.body.item.rarity && req.body.item.tags) {
        const name = req.body.name
        const description = req.body.description
        const image = req.body.image || null
        const price = req.body.price
        const hidden = req.body.hidden || false
        const itemName = req.body.item.name
        const itemDescription = req.body.item.description || null
        const itemImage = req.body.item.image || null
        const itemRarity = req.body.item.rarity
        const itemTags = req.body.item.tags
        const itemButtonText = req.body.item.buttonText || null
        const itemButtonUrl = req.body.item.buttonUrl || null
        const created = new Date().getTime()
        createShop(name, description, image, price, hidden, created, req.temp.app_id, itemName, itemDescription, itemImage, itemRarity, itemTags,itemButtonText,itemButtonUrl).then(shop => {
            res.status(200).json(shop)
        }).catch(err => {
            res.status(500).json({error: err.message})
        })
    } else {
        res.status(400).json({error: 'Fehlender Parameter!'})
    }
}

async function processPatchShop(req, res) {
    getShopInfo(req.params.shop_id).then(shop => {
        if (shop === null) {
            res.status(404).json({error: 'Shop nicht gefunden!'})
        } else if (shop.app_id === req.temp.app_id) {
            if (req.body.name && req.body.description && req.body.price  && req.body.item && req.body.item.name && req.body.item.rarity && req.body.item.tags) {
                const name = req.body.name
                const description = req.body.description
                const image = req.body.image || null
                const price = req.body.price
                const hidden = req.body.hidden || false
                const itemName = req.body.item.name
                const itemDescription = req.body.item.description || null
                const itemImage = req.body.item.image || null
                const itemRarity = req.body.item.rarity
                const itemTags = req.body.item.tags
                const itemButtonText = req.body.item.buttonText || null
                const itemButtonUrl = req.body.item.buttonUrl || null
                updateShop(shop.shop_id, name, description, image, price, hidden, shop.app_id, itemName, itemDescription, itemImage, itemRarity, itemTags,itemButtonText,itemButtonUrl).then(() => {
                    res.status(200).json({success: true})
                }).catch(err => {
                    res.status(500).json({error: err.message})
                })
            } else {
                res.status(400).json({error: 'Fehlender Parameter!'})
            }
        } else {
            res.status(403).json({error: 'Forbidden'})
        }
    }).catch(err => {
        res.status(500).json({error: err.message})
    })
}

async function processDeleteShop(req, res) {
    getShopInfo(req.params.shop_id).then(shop => {
        if (shop === null) {
            res.status(404).json({error: 'Shop nicht gefunden!'})
        } else if (shop.app_id === req.temp.app_id) {
            deleteShop(shop.shop_id).then(() => {
                res.status(200).json({success: true})
            }).catch(err => {
                res.status(500).json({error: err.message})
            })
        } else {
            res.status(403).json({error: 'Forbidden'})
        }
    }).catch(err => {
        res.status(500).json({error: err.message})
    })
}