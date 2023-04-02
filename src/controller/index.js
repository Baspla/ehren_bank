import {getUserCount, getUserInfo} from "../db/user.js";
import {errorHandler, isLoggedIn} from "./../util/controller_utils.js";

export function renderIndex(req, res) {
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