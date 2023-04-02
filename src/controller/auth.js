import request from "request";
import {createOrUpdateUser, getUserIDFromGuardID} from "../db/user.js";
import {errorHandler, isLoggedIn} from "./../util/controller_utils.js";

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