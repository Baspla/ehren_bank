import request from "request";
import {createOrUpdateUser, getUserInfo} from "./db/db.js";

export function login(req, res) {
    if (isLoggedIn(req)) {
        res.redirect('/')
    } else {
        res.redirect(process.env.GUARD_URL + '/login?returnURL=' + encodeURIComponent(process.env.BASE_URL + '/callback'))
    }
}

export function index(req, res) {
    if (isLoggedIn(req)) {
        getUserInfo(req.session.username).then(user => {
                console.log(user)
                res.render('index', {user: user, hour: new Date().getHours()})
            }
        ).catch(err => {
            res.render('error', {error: err})
        })
    } else {
        res.render('guest')
    }
}

export function callback(req, res) {
    let {GUARDTOKEN} = req.query
    if (GUARDTOKEN !== undefined) {
        request(process.env.GUARD_URL + '/sso?GUARDTOKEN=' + GUARDTOKEN, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                let ssoResponse = JSON.parse(body)
                if (ssoResponse.username !== null && ssoResponse.displayname !== null) {
                    req.session.username = ssoResponse.username
                    req.session.displayname = ssoResponse.displayname
                    createOrUpdateUser(ssoResponse.username, ssoResponse.displayname)
                    return res.redirect('/')
                }
            }
            res.status(response.statusCode).send(body)
        })
    } else {
        res.redirect('/login')
    }
}

function isLoggedIn(req) {
    return req.session.username !== undefined
}