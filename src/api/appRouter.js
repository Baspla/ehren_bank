import {getAppInfo, updateApp} from "../db/app.js";
import express from "express";

export const appRouter = express.Router()

appRouter.get('/', provideGetAppInfo)
appRouter.patch('/', processPatchAppInfo)

async function provideGetAppInfo(req, res) {
    res.status(200).json(await getAppInfo(req.temp.app_id))
}

async function processPatchAppInfo(req, res) {
    if (req.body.name && req.body.description && req.body.url){
        getAppInfo(req.temp.app_id).then(info => {
            const name = req.body.name
            const description = req.body.description
            const url = req.body.url
            updateApp(req.temp.app_id, name, description, url, info.permissions, info.apikey).then(() => {
                res.status(200).json({success: true})
            }).catch(err => {
                res.status(500).json({error: err.message})
            })
        }).catch(err => {
            res.status(500).json({error: err.message})
        })
    } else {
        res.status(400).json({error: 'Fehlender Parameter!'})
    }
}