import {getAppList} from "../db/app.js";

export async function renderAppsLimited(req, res) {
    res.render('apps', {user: req.temp.user, path: req.originalUrl, apps: await getAppList(req.session.user_id)})
}