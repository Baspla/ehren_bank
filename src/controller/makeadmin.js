import {makeAdmin} from "../db/admin.js";
import {errorHandler} from "./../util/controller_utils.js";

export function renderMakeadmin(req, res) {
    res.render('admin/makeadmin', {user: req.temp.user, path: req.originalUrl})
}

export function processMakeadmin(req, res) {
    if (!req.temp.user.is_admin) {
        if (req.temp.user.guard_id === process.env.ADMIN_GUARD_ID) {
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