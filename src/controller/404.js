import {getUserInfo} from "../db/user.js";
import {errorHandler} from "./../util/controller_utils.js";

export function renderUnknownPage(req, res) {
    getUserInfo(req.session.user_id).then(user => {
            res.render('404', {user: req.temp.user, path: req.originalUrl})
        }
    ).catch(errorHandler)
}