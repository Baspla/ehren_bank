import request from "request";
import {
    createOrUpdateUser,
    getUserCount,
    getUserIDFromGuardID,
    getUserInfo,
    getUserList,
    modifyUserBalance
} from "../db/user.js";
import {createTransaction, getTransactionCountByUser, getTransactionListByUser} from "../db/transaction.js";
import {deleteApp, getAppList} from "../db/app.js";
import {getItemCountByUser, getItemList} from "../db/item.js";
import {isAdmin, makeAdmin} from "../db/admin.js";
import {createPromotion, deletePromotion, getPromotionList, getRandomPromotion} from "../db/promotion.js";

export function errorHandler() {
    return function (err, req, res, next) {
        res.status(500)
        res.render('error', {error: err})
    }
}

export function isLoggedIn(req) {
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

export function logout(req, res) {
    req.session.destroy()
    res.redirect(process.env.BASE_URL + (req.query.returnURL || '/'))
}

export function dashboard(req, res) {
    let user = getUserInfo(req.session.user_id)
    let transactionlist = getTransactionListByUser(req.session.user_id)
    let promotions = getPromotionList()
    Promise.all([user, transactionlist, promotions]).then(([user, transactionlist, promotions]) => {
        res.render('dashboard', {
            user: user,
            path: req.originalUrl,
            transactions: transactionlist,
            promotions: promotions
        })
    }).catch(errorHandler)
}


export function index(req, res) {
    getUserCount().then(count => {
        if (isLoggedIn(req)) {
            getUserInfo(req.session.user_id).then(userinfo => {
                res.render('index', {usercount: count, user: userinfo, path: req.originalUrl})
            }).catch(errorHandler)
        } else {
            res.render('index', {usercount: count, path: req.originalUrl})
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
                            return res.redirect(process.env.BASE_URL + (returnURL || '/dashboard'))
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
    getUserInfo(req.session.user_id).then(user => {
            res.render('shop', {user: user, path: req.originalUrl})
        }
    ).catch(errorHandler)
}

export function items(req, res) {
    let itemlist = getItemList(req.session.user_id);
    let user = getUserInfo(req.session.user_id)
    Promise.all([itemlist, user]).then(values => {
        res.render('items', {user: values[1], items: values[0]})
    }).catch(errorHandler)
}


export function transactions(req, res) {
    let user = getUserInfo(req.session.user_id)
    let transactionlist = getTransactionListByUser(req.session.user_id)
    Promise.all([user, transactionlist]).then(values => {
        res.render('transactions', {user: values[0], transactions: values[1]})
    }).catch(errorHandler)
}

export function apps(req, res) {
    let apps = getAppList()
    let user = getUserInfo(req.session.user_id)
    Promise.all([apps, user]).then(([apps, user]) => {

        res.render('apps', {user: user, apps: apps})
    }).catch(errorHandler)
}

export function developers(req, res) {
    getUserInfo(req.session.user_id).then(user => {
            res.render('developers', {user: user, path: req.originalUrl})
        }
    ).catch(errorHandler)
}

export function debug(req, res) {
    let user = getUserInfo(req.session.user_id)
    let is_admin = isAdmin(req.session.user_id)
    let count_transactions = getTransactionCountByUser(req.session.user_id)
    let count_items = getItemCountByUser(req.session.user_id)
    Promise.all([user, is_admin, count_transactions, count_items]).then(([user, is_admin, count_transactions, count_items]) => {
        res.render('debug', {
            user: user,
            path: req.originalUrl,
            is_admin: is_admin,
            count_transactions: count_transactions,
            count_items: count_items,
        })
    }).catch(errorHandler)
}

export async function transfer(req, res) {
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

export function postTransfer(req, res) {
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
                    createTransaction(user.user_id, user.user_id, toUser.user_id, null, req.body.amount * -1, req.body.reason)).then(
                    createTransaction(toUser.user_id, user.user_id, toUser.user_id, null, req.body.amount, req.body.reason)).then(
                    () => {
                        res.redirect('/transactions')
                    }).catch(errorHandler)
            })
        }
    ).catch(errorHandler)
}


export function makeadmin(req, res) {
    let user = getUserInfo(req.session.user_id)
    let is_admin = isAdmin(req.session.user_id)
    Promise.all([user, is_admin]).then(([user, is_admin]) => {
        res.render('admin/makeadmin', {user: user, path: req.originalUrl, is_admin: is_admin})
    }).catch(errorHandler)
}

export function postMakeadmin(req, res) {
    getUserInfo(req.session.user_id).then(user => {
            if (!user.is_admin) {
                if (user.guard_id === process.env.ADMIN_GUARD_ID) {
                    makeAdmin(req.session.user_id).then(() => {
                        res.redirect('/makeadmin')
                    }).catch(errorHandler)
                } else {
                    res.redirect('/makeadmin')
                }
            } else {
                res.redirect('/makeadmin')
            }
        }
    ).catch(errorHandler)
}

export function admin(req, res) {
    let userlist = getUserList()
    let user = getUserInfo(req.session.user_id)
    Promise.all([userlist, user]).then(([userlist, user]) => {
            res.render('admin/admin', {user: user, path: req.originalUrl, users: userlist})
        }
    ).catch(errorHandler)
}

export function registerApp(req, res) {
    getUserInfo(req.session.user_id).then(user => {
            res.render('admin/registerapp', {user: user, path: req.originalUrl})
        }
    ).catch(errorHandler)
}

export function deleteapp(req, res) {
    let user = getUserInfo(req.session.user_id)
    let apps = getAppList()
    Promise.all([user, apps]).then(([user, apps]) => {
            res.render('admin/deleteapp', {user: user, path: req.originalUrl, apps: apps})
        }
    ).catch(errorHandler)
}

export function postDeleteApp(req, res) {
    let user = getUserInfo(req.session.user_id);
    let is_admin = isAdmin(req.session.user_id);
    Promise.all([user, is_admin]).then(([user, is_admin]) => {
        if (is_admin) {
            deleteApp(req.body.app_id).then(() => {
                res.redirect('/apps')
            }).catch(errorHandler)
        } else {
            res.redirect('/apps')
        }
    }).catch(errorHandler)
}

export function unknownPage(req, res) {
    getUserInfo(req.session.user_id).then(user => {
            res.render('404', {user: user, path: req.originalUrl})
        }
    ).catch(errorHandler)
}

