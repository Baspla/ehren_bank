export function errorHandler() {
    return function (err, req, res, next) {
        res.status(500)
        res.render('error', {error: err.message})
    }
}

export function isLoggedIn(req) {
    return req.session.user_id !== undefined
}

export function checkPermission(app_permissions, permission_to_check) {
    return (app_permissions >> permission_to_check & 1) === 1;
}

