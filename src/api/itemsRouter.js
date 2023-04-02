import {createItem, deleteItem, getItemInfo, getItemListByApp, updateItem} from "../db/item.js";
import {validate} from "uuid";
import express from "express";
import {appHasPermission} from "./restapi.js";
import {permissions} from "../util/permissions.js";
import {getUserIDFromGuardID} from "../db/user.js";

export const itemsRouter = express.Router()

itemsRouter.get('/', provideGetItems)
itemsRouter.get('/:item_id', provideGetItem)
itemsRouter.post('/', appHasPermission(permissions.ITEMS), providePostItem)
itemsRouter.patch('/:item_id', appHasPermission(permissions.ITEMS), providePatchItem)
itemsRouter.delete('/:item_id', appHasPermission(permissions.ITEMS), provideDeleteItem)

async function provideGetItems(req, res) {
    res.status(200).json(await getItemListByApp(req.temp.app_id))
}

async function provideGetItem(req, res) {
    getItemInfo(req.params.item_id).then(item => {
        if (item === null) {
            res.status(404).json({error: 'Item nicht gefunden!'})
        } else if (item.app_id === req.temp.app_id) {
            res.status(200).json(item)
        } else {
            res.status(403).json({error: 'Forbidden'})
        }
    }).catch(err => {
        res.status(500).json({error: err.message})
    })
}

function validateItem(res, name, description, image, rarity, tags) {
    if (rarity < 0 || rarity > 5) {
        res.status(400).json({error: 'Ungültige Seltenheit!'})
        return false
    }
    if (description && description.length > 1000) {
        res.status(400).json({error: 'Beschreibung zu lang!'})
        return false
    }
    if (name.length > 100) {
        res.status(400).json({error: 'Name zu lang!'})
        return false
    }
    if (tags.length > 100) {
        res.status(400).json({error: 'Tags zu lang!'})
        return false
    }
    if (image && image.length > 1000) {
        res.status(400).json({error: 'Bild URL zu lang!'})
        return false
    }
    if (name.length < 3) {
        res.status(400).json({error: 'Name zu kurz!'})
        return false
    }
    if (tags.length < 1) {
        res.status(400).json({error: 'Zu wenig Tags!'})
        return false
    }
    return true
}

async function providePostItem(req, res) {
    if (req.body.name && req.body.rarity && req.body.tags && req.body.guardId) {
        getUserIDFromGuardID(req.body.guardId).then(userId => {
            const name = req.body.name
            const description = req.body.description || null
            const image = req.body.image || null
            const rarity = req.body.rarity
            const tags = req.body.tags
            const created = new Date().getTime()
            if (validateItem(res, name, description, image, rarity, tags)) {
                createItem(userId, name, description, image, rarity, tags, created, req.temp.app_id).then(item => {
                    res.status(200).json(item)
                }).catch(err => {
                    res.status(500).json({error: err.message})
                })
            }
        }).catch(err => {
            res.status(500).json({error: err.message})
        })
    } else {
        res.status(400).json({error: 'Fehlender Parameter!'})
    }
}

async function providePatchItem(req, res) {
    getItemInfo(req.params.item_id).then(item => {
        if (item === null) {
            res.status(404).json({error: 'Item nicht gefunden!'})
        } else if (item.app_id === req.temp.app_id) {
            if (req.body.name && req.body.description && req.body.image && req.body.rarity && req.body.tags) {
                const name = req.body.name
                const description = req.body.description
                const image = req.body.image
                const rarity = req.body.rarity
                const tags = req.body.tags
                if (validateItem(res, name, description, image, rarity, tags)) {
                    updateItem(req.params.item_id, name, description, image, rarity, tags).then(item => {
                        res.status(200).json(item)
                    }).catch(err => {
                        res.status(500).json({error: err.message})
                    })
                }
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

async function provideDeleteItem(req, res) {
    getItemInfo(req.params.item_id).then(item => {
        if (item === null) {
            res.status(404).json({error: 'Item nicht gefunden!'})
        } else if (item.app_id === req.temp.app_id) {
            deleteItem(req.params.item_id).then(() => {
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