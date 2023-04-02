//
// /users
//

import express from "express";
import {getUserIDFromGuardID, getUserInfo, getUserList, modifyUserBalance} from "../db/user.js";
import {permissions} from "../util/permissions.js";
import {createTransaction} from "../db/transaction.js";
import {appHasPermission} from "./restapi.js";
import {getItemListByUser, getItemListByUserAndApp} from "../db/item.js";

function annotateUserFromGuardID(req, res, next) {
    getUserIDFromGuardID(req.params.guard_id).then(user_id => {
        if (user_id) {
            req.temp.user_id = user_id
            next()
        } else {
            res.status(400).json({error: 'User nicht gefunden!'})
        }
    })
}

export const usersRouter = express.Router()
usersRouter.get('/', provideGetUsers)

usersRouter.get('/:guard_id/', annotateUserFromGuardID, provideGetUser)
usersRouter.get('/:guard_id/balance', annotateUserFromGuardID, appHasPermission(permissions.BALANCE), provideGetBalance)
usersRouter.patch('/:guard_id/balance', annotateUserFromGuardID, appHasPermission(permissions.BALANCE), providePatchBalance)
usersRouter.get('/:guard_id/items', annotateUserFromGuardID, provideGetItems)

async function provideGetUsers(req, res) {
    res.status(200).json(await getUserList())
}

async function provideGetBalance(req, res) {
    res.status(200).json({balance: await getUserInfo(req.temp.user_id).then(user => user.balance)})
}

async function provideGetUser(req, res) {
    res.status(200).json(await getUserInfo(req.temp.user_id))
}


async function providePatchBalance(req, res) {
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
}


async function provideGetItems(req, res) {
    getItemListByUserAndApp(req.temp.user_id,req.temp.app_id).then(items => {
        res.status(200).json(items)
    }).catch(error => {
        console.log(error)
        res.status(500).json({error: 'Interner Serverfehler!'})
    })
}