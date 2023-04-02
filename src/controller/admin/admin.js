import {getUserList} from "../../db/user.js";

export async function renderAdmin(req, res) {
    res.render('admin/admin', {user: req.temp.user, path: req.originalUrl, users: await getUserList()})
}