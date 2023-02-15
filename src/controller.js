import request from "request";
import {
    createOrUpdateUser,
    getUserCount,
    getUserIDFromGuardID,
    getUserInfo,
    getUserList,
    modifyUserBalance
} from "./db/user.js";
import {createTransaction, getTransactionListByUser} from "./db/transaction.js";
import {getAppList} from "./db/app.js";
import {getItemList} from "./db/item.js";

function errorHandler() {
    return function (err, req, res, next) {
        res.status(500)
        res.render('error', {error: err})
    }
}

function isLoggedIn(req) {
    return req.session.user_id !== undefined
}

export function login(req, res) {
    if (isLoggedIn(req)) {
        res.redirect('/dashboard')
    } else {
        res.redirect(process.env.GUARD_URL + '/login?returnURL=' + encodeURIComponent(process.env.BASE_URL +
            '/callback?returnURL=' + encodeURIComponent(req.query.returnURL || '/dashboard')))
    }
}

export function dashboard(req, res) {
    if (isLoggedIn(req)) {
        let user = getUserInfo(req.session.user_id)
        let transactionlist = getTransactionListByUser(req.session.user_id)
        Promise.all([user, transactionlist]).then(([user, transactionlist]) => {
            res.render('dashboard', {user: user, transactions: transactionlist})
        }).catch(errorHandler)
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent('/dashboard'))
    }
}


export function index(req, res) {
    getUserCount().then(count => {
        if (isLoggedIn(req)) {
            getUserInfo(req.session.user_id).then(userinfo => {
                res.render('index', {usercount: count, user: userinfo})
            }).catch(errorHandler)
        } else {
            res.render('index', {usercount: count})
        }
    }).catch(errorHandler)
}

export function callback(req, res) {
    let {GUARDTOKEN, returnURL} = req.query
    if (GUARDTOKEN !== undefined) {
        request(process.env.GUARD_URL + '/sso?GUARDTOKEN=' + GUARDTOKEN, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    let ssoResponse = JSON.parse(body)
                    if (ssoResponse.uuid && ssoResponse.displayname) {
                        req.session.guard_id = ssoResponse.uuid
                        return createOrUpdateUser(ssoResponse.uuid, ssoResponse.displayname).then(async () => {
                            req.session.user_id = await getUserIDFromGuardID(ssoResponse.uuid)
                            return res.redirect(returnURL || '/dashboard')
                        }).catch(errorHandler)
                    } else {
                        res.status(response.statusCode).send(body)
                    }
                }
            }
        )
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent(returnURL || '/dashboard'))
    }
}


export function shop(req, res) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.user_id).then(user => {
                res.render('shop', {user: user})
            }
        ).catch(errorHandler)
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent('/shop'))
    }
}

export function items(req, res) {
    if (isLoggedIn(req)) {
        let itemlist = getItemList(req.session.user_id);
        let user = getUserInfo(req.session.user_id)
        Promise.all([itemlist, user]).then(values => {
            res.render('items', {user: values[1], items: values[0]})
        }).catch(errorHandler)
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent('/items'))
    }
}

export function transactions(req, res) {
    if (isLoggedIn(req)) {
        let user = getUserInfo(req.session.user_id)
        let transactionlist = getTransactionListByUser(req.session.user_id)
        Promise.all([user, transactionlist]).then(values => {
            console.log(values[1])
            res.render('transactions', {user: values[0], transactions: values[1]})
        }).catch(errorHandler)
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent('/transactions'))
    }
}

export function apps(req, res) {
    if (isLoggedIn(req)) {
        let apps = getAppList()
        let user = getUserInfo(req.session.user_id)
        Promise.all([apps, user]).then(values => {
            res.render('apps', {user: values[1], apps: values[0]})
        }).catch(errorHandler)
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent('/apps'))
    }
}

export function developers(req, res) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.user_id).then(user => {
                res.render('developers', {user: user})
            }
        ).catch(errorHandler)
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent('/developers'))
    }
}

export function transfer(req, res) {
    if (isLoggedIn(req)) {
        let user = getUserInfo(req.session.user_id)
        let userlist = getUserList()
        Promise.all([user, userlist]).then(([user, userlist]) => {
            console.log(userlist)
            res.render('transfer', {
                user: user,
                users: userlist,
                amount: req.query.amount,
                to: req.query.to,
                reason: req.query.reason,
                error: req.query.error
            })
        }).catch(errorHandler)
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent('/transfer'))
    }
}

export function postTransfer(req, res) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.user_id).then(user => {
                if (user.balance < req.body.amount) {
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
                    modifyUserBalance(user.user_id, req.body.amount * -1).then(
                        modifyUserBalance(toUser.user_id, req.body.amount)).then(
                        createTransaction(user.user_id, user.user_id, toUser.user_id, null, req.body.amount, req.body.reason)).then(
                        createTransaction(toUser.user_id, user.user_id, toUser.user_id, null, req.body.amount, req.body.reason)).then(
                        () => {
                            res.redirect('/transactions')
                        }).catch(errorHandler)
                })
            }
        )
    } else {
        res.redirect('/login?returnURL=' + encodeURIComponent('/transfer?amount=' + req.body.amount + '&to=' + req.body.to + '&reason=' + req.body.reason))
    }
}
