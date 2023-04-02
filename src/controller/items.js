import {getItemInfo, getItemList, getItemListByUser} from "../db/item.js";

export async function renderItems(req, res) {
    res.render('items/items', {user: req.temp.user, path: req.originalUrl, items: await getItemListByUser(req.session.user_id)})
}

export async function renderItemsInfo(req, res) {
    let item = await getItemInfo(req.params.item_id)
    res.render('items/info', {user: req.temp.user, path: req.originalUrl, item: item})
}