import {getUserInfo, getUserList, modifyUserBalance} from "../db/user.js";
import {createTransaction} from "../db/transaction.js";
import {errorHandler} from "./../util/controller_utils.js";

export async function renderTransfer(req, res) {
    res.render('transfer', {
        user: req.temp.user,
        users: await getUserList(),
        path: req.originalUrl,
        amount: req.query.amount,
        to: req.query.to,
        reason: req.query.reason,
        error: req.query.error
    })
}

export function processTransfer(req, res) {
    if (req.temp.user.balance < req.body.amount) {
        res.redirect('/transfer?amount=' + req.body.amount + '&to=' + req.body.to + '&reason=' + req.body.reason + '&error=insufficient-funds')
        return
    }
    if (req.body.amount <= 0 || req.body.amount > 100000) {
        res.redirect('/transfer?amount=' + req.body.amount + '&to=' + req.body.to + '&reason=' + req.body.reason + '&error=invalid-amount')
        return
    }
    if (req.body.reason === undefined) {
        res.redirect('/transfer?amount=' + req.body.amount + '&to=' + req.body.to + '&reason=' + req.body.reason + '&error=invalid-reason')
        return;
    }
    getUserInfo(req.body.to).then(toUser => {
        if (toUser === undefined) {
            res.redirect('/transfer?amount=' + req.body.amount + '&to=' + req.body.to + '&reason=' + req.body.reason + '&error=invalid-receiver')
            return
        }
        modifyUserBalance(req.temp.user.user_id, req.body.amount * -1).then(
            modifyUserBalance(toUser.user_id, req.body.amount)).then(
            createTransaction(req.temp.user.user_id, req.temp.user.user_id, toUser.user_id, null, req.body.amount * -1, "Transfer: "+req.body.reason)).then(
            createTransaction(toUser.user_id, req.temp.user.user_id, toUser.user_id, null, req.body.amount, "Transfer: "+req.body.reason)).then(
            () => {
                res.redirect('/transactions')
            }).catch(errorHandler)
    })
}