import {getTransactionCountByUser} from "../db/transaction.js";
import {getItemCountByUser} from "../db/item.js";

export async function renderDebug(req, res) {
    res.render('debug', {
        user: req.temp.user, path: req.originalUrl,
        count_transactions: await getTransactionCountByUser(req.session.user_id),
        count_items: await getItemCountByUser(req.session.user_id),
    })
}