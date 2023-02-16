import {getUserInfo} from "../../db/user.js";
import {createPromotion, deletePromotion, getPromotionList} from "../../db/promotion.js";
import {isAdmin} from "../../db/admin.js";
import {errorHandler} from "../controller.js";

export function getPromotions(req, res) {
    let user = getUserInfo(req.session.user_id)
    let promotions = getPromotionList()
    Promise.all([user, promotions]).then(([user, promotions]) => {
        res.render('admin/promotions', {user: user, path: req.originalUrl, promotions: promotions})
    }).catch(errorHandler)
}
export function getPromotionsCreate(req, res) {
    let user = getUserInfo(req.session.user_id)
    let is_admin = isAdmin(req.session.user_id)
    Promise.all([user, is_admin]).then(([user, is_admin]) => {
        if (is_admin) {
            res.render('admin/createpromotion', {user: user, path: req.originalUrl})
        } else {
            res.redirect('/admin/promotions')
        }
    }).catch(errorHandler)
}


export function getPromotionsDelete(req, res) {
    let user = getUserInfo(req.session.user_id);
    let is_admin = isAdmin(req.session.user_id);
    Promise.all([user, is_admin]).then(([user, is_admin]) => {
        if (is_admin) {
            deletePromotion(req.body.promotion_id).then(() => {
                res.redirect('/admin/promotions')
            }).catch(errorHandler)
        } else {
            res.redirect('/admin/promotions')
        }
    }).catch(errorHandler)
}

export function postPromotionsCreate(req, res) {
    let user = getUserInfo(req.session.user_id);
    let is_admin = isAdmin(req.session.user_id);
    Promise.all([user, is_admin]).then(([user, is_admin]) => {
        if (is_admin) {
            createPromotion(req.body.name, req.body.description, req.body.image_url, req.body.url, req.body.color_left, req.body.color_right).then(() => {
                res.redirect('/admin/promotions')
            }).catch(errorHandler)
        } else {
            res.redirect('/admin/promotions')
        }
    }).catch(errorHandler)
}

export function getPromotionsEdit(req, res) {

}

export function postPromotionsEdit(req, res) {
}

