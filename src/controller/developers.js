export function renderDevelopers(req, res) {
    res.render('developers', {user: req.temp.user, path: req.originalUrl})
}
