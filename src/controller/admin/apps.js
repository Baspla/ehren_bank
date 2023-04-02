import {createApp, deleteApp, getAppInfo, getAppList, updateApp} from "../../db/app.js";
import * as uuid from "uuid";
import {permissions} from "../../util/permissions.js";
import {errorHandler} from "../../util/controller_utils.js";

function generateApikey() {
    return uuid.v4();
}

export async function renderApps(req, res) {
    res.render('admin/apps/apps', {user: req.temp.user, path: req.originalUrl, apps: await getAppList()})
}

export function renderAppsCreate(req, res) {
    res.render('admin/apps/create', {user: req.temp.user, path: req.originalUrl})
}

export async function renderAppsEdit(req, res) {
    res.render('admin/apps/edit', {user: req.temp.user, path: req.originalUrl, app: await getAppInfo(req.params.app_id)})
}

export async function renderAppsInfo(req, res) {
    res.render('admin/apps/info', {user: req.temp.user, path: req.originalUrl, app: await getAppInfo(req.params.app_id)})
}


function parseAppPermissions(req) {
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
}

export function processAppsCreate(req, res) {
    if (req.body.name === undefined || req.body.description === undefined || req.body.url === undefined) {
        res.redirect('/admin/apps/create?error=missing-parameters')
        return
    }
    parseAppPermissions(req)
    createApp(req.body.name,req.body.description,req.body.url,req.body.permissions,generateApikey()).then(app_id => {
        res.redirect('/admin/apps/' + app_id)
    }).catch(errorHandler)
}


export function processAppsEdit(req, res) {
    if (req.body.name === undefined || req.body.description === undefined || req.body.url === undefined || req.body.apikey === undefined) {
        res.redirect('/admin/apps/'+req.params.app_id+'/edit?error=missing-parameters')
        return
    }
    parseAppPermissions(req)
    updateApp(req.params.app_id,req.body.name,req.body.description,req.body.url,req.body.permissions,req.body.apikey).then(() => {
        res.redirect('/admin/apps/' + req.params.app_id)
    }).catch(errorHandler)
}

export function renderAppsDelete(req, res) {
    if (req.params.app_id === undefined) {
        res.redirect('/admin/apps')
        return
    }
    deleteApp(req.params.app_id).then(() => {
        res.redirect('/admin/apps')
    }).catch(errorHandler)
}
