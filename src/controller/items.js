import {
    getItemInfo,
    getItemListByUser,
    getItemListByUserAndApp
} from "../db/item.js";
import {getAppInfo} from "../db/app.js";

export async function renderItems(req, res) {
    if (req.query.app) {
        let app = await getAppInfo(req.query.app)
        if (!app) {
            res.redirect('/items')
            return
        }
        res.render('items/items', {
            user: req.temp.user,
            path: req.originalUrl,
            items: await getItemListByUserAndApp(req.session.user_id, app.app_id),
            app: app
        })
    } else {
        res.render('items/items', {
            user: req.temp.user,
            path: req.originalUrl,
            items: await getItemListByUser(req.session.user_id)
        })
    }
}

export async function renderItemsInfo(req, res) {
    let item = await getItemInfo(req.params.item_id)
    res.render('items/info', {user: req.temp.user, path: req.originalUrl, item: item})
}