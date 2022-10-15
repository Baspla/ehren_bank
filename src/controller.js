import request from "request";
import {createOrUpdateUser, getUserCount, getUserInfo, getUserTransactions} from "./db/db.js";

function errorHandler() {
    return function (err, req, res, next) {
        res.status(500)
        res.render('error', {error: err})
    }
}

function isLoggedIn(req) {
    return req.session.uuid !== undefined
}

export function login(req, res) {
    if (isLoggedIn(req)) {
        res.redirect('/dash')
    } else {
        res.redirect(process.env.GUARD_URL + '/login?returnURL=' + encodeURIComponent(process.env.BASE_URL + '/callback'))
    }
}

export function dashboard(req, res) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.uuid).then(user => {
                res.render('dashboard', {user: user})
            }
        ).catch(errorHandler)
    } else {
        res.redirect('/login')
    }
}


export function index(req, res) {
    getUserCount().then(count => {
        if (isLoggedIn(req)) {
            getUserInfo(req.session.uuid).then(user => {
                res.render('index', {usercount: count, user: user})
            }).catch(errorHandler)
        } else {
            res.render('index', {usercount: count})
        }
    }).catch(errorHandler)
}

export function callback(req, res) {
    let {GUARDTOKEN} = req.query
    if (GUARDTOKEN !== undefined) {
        request(process.env.GUARD_URL + '/sso?GUARDTOKEN=' + GUARDTOKEN, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                let ssoResponse = JSON.parse(body)
                if (ssoResponse.uuid && ssoResponse.displayname) {
                    req.session.uuid = ssoResponse.uuid
                    req.session.displayname = ssoResponse.displayname
                    createOrUpdateUser(ssoResponse.uuid, ssoResponse.displayname)
                    return res.redirect('/dash')
                }
            }
            res.status(response.statusCode).send(body)
        })
    } else {
        res.redirect('/login')
    }
}


export function shop(req, res) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.uuid).then(user => {
                res.render('shop', {user: user})
            }
        ).catch(errorHandler)
    } else {
        res.redirect('/login')
    }
}

export function items(req, res) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.uuid).then(user => {
                res.render('items', {user: user})
            }
        ).catch(errorHandler)
    } else {
        res.redirect('/login')
    }
}

export function transactions(req, res) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.uuid).then(user => {
                getUserTransactions(req.session.uuid).then(transactionlist => {
                    res.render('transactions', {user: user, transactions:transactionlist})
                })
            }
        ).catch(errorHandler)
    } else {
        res.redirect('/login')
    }
}

export function transfer(req, res) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.uuid).then(user => {
                res.render('transfer', {user: user})
            }
        ).catch(errorHandler)
    } else {
        res.redirect('/login')
    }
}