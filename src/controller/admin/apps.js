import {getUserInfo} from "../../db/user.js";
import {errorHandler, isLoggedIn} from "../controller.js";
import {createApp, deleteApp, getAppInfo, getAppList, updateApp} from "../../db/app.js";
import {isAdmin} from "../../db/admin.js";
import * as uuid from "uuid";
import {permissions} from "../../permissions.js";

function generateApikey() {
    return uuid.v4();
}

export async function getApps(req, res) {
    console.log(req)
    res.render('admin/apps/apps', {user: req.temp.user, path: req.baseUrl, apps: await getAppList()})
}

export function getAppsCreate(req, res) {
    res.render('admin/apps/create', {user: req.temp.user, path: req.baseUrl})
}

export function getAppsEdit(req, res) {
    res.render('admin/apps/edit', {user: req.temp.user, path: req.baseUrl})
}

export async function getAppsInfo(req, res) {
    res.render('admin/apps/info', {user: req.temp.user, path: req.baseUrl, app: await getAppInfo(req.params.app_id)})
}


export function postAppsCreate(req, res) {
    console.log(req.body)
    if (req.body.name === undefined || req.body.description === undefined || req.body.url === undefined) {
        res.redirect('/admin/apps/create?error=missing-parameters')
        return
    }
    req.body.permissions = 0
    if(req.body.permissionsBalance){
        req.body.permissions += 1 << permissions.BALANCE
    }
    if(req.body.permissionsItems){
        req.body.permissions += 1 << permissions.ITEMS
    }
    if(req.body.permissionsShop){
        req.body.permissions += 1 << permissions.SHOP
    }
    createApp(req.body.name,req.body.description,req.body.url,req.body.permissions,generateApikey()).then(app_id => {
        res.redirect('/admin/apps/info?app_id=' + app_id)
    }).catch(errorHandler)
}

export function postAppsEdit(req, res) {
    if (req.body.name === undefined || req.body.description === undefined || req.body.url === undefined || req.body.permissions === undefined || req.body.apikey === undefined) {
        res.redirect('/admin/apps/'+req.params.app_id+'/edit?error=missing-parameters')
        return
    }
    updateApp(req.params.app_id,req.body.name,req.body.description,req.body.url,req.body.permissions,req.body.apikey).then(() => {
        res.redirect('/admin/apps/' + req.params.app_id)
    }).catch(errorHandler)
}

export function getAppsDelete(req, res) {
    if (req.body.app_id === undefined) {
        res.redirect('/admin/apps')
        return
    }
    deleteApp(req.body.app_id).then(() => {
        res.redirect('/admin/apps')
    }).catch(errorHandler)
}
