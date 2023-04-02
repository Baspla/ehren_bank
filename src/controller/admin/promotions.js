import {createPromotion, deletePromotion, getPromotionInfo, getPromotionList} from "../../db/promotion.js";
import {errorHandler} from "../../util/controller_utils.js";

export async function renderPromotions(req, res) {
    res.render('admin/promotions/promotions', {user: req.temp.user, path: req.originalUrl, promotions: await getPromotionList()})
}

export function renderPromotionsCreate(req, res) {
    res.render('admin/promotions/create', {user: req.temp.user, path: req.originalUrl})
}


export function renderPromotionsDelete(req, res) {
    deletePromotion(req.params.promotion_id).then(() => {
        res.redirect('/admin/promotions')
    }).catch(errorHandler)
}

export function processPromotionsCreate(req, res) {
    createPromotion(req.body.name, req.body.description, req.body.image_url, req.body.url, req.body.color_left, req.body.color_right).then(() => {
        res.redirect('/admin/promotions')
    }).catch(errorHandler)
}

export async function renderPromotionsEdit(req, res) {
    res.render('admin/promotions/edit', {
        user: req.temp.user,
        path: req.originalUrl,
        promotion: await getPromotionInfo(req.params.promotion_id)
    })
}

export function processPromotionsEdit(req, res) {
    updatePromotion(req.params.promotion_id, req.body.name, req.body.description, req.body.image_url, req.body.url, req.body.color_left, req.body.color_right).then(() => {
        res.redirect('/admin/promotions')
    }).catch(errorHandler)
}

