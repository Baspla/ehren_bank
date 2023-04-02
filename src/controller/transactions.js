import {getTransactionListByUser} from "../db/transaction.js";

export async function renderTransactions(req, res) {
    res.render('transactions', {
        user: req.temp.user,
        path: req.originalUrl,
        transactions: await getTransactionListByUser(req.session.user_id)
    })
}