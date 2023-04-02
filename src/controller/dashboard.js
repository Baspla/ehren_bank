import {getUserInfo} from "../db/user.js";
import {getTransactionListByUser} from "../db/transaction.js";
import {getPromotionList} from "../db/promotion.js";
import {errorHandler} from "./../util/controller_utils.js";

export function renderDashboard(req, res) {
    let user = getUserInfo(req.session.user_id)
    let transactionlist = getTransactionListByUser(req.session.user_id)
    let promotions = getPromotionList()
    Promise.all([user, transactionlist, promotions]).then(([user, transactionlist, promotions]) => {
        res.render('dashboard', {
            user: user,
            path: req.originalUrl,
            transactions: transactionlist,
            promotions: promotions
        })
    }).catch(errorHandler)
}