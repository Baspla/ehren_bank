import sql from "./db.js";

export async function setupCoupons() {
    console.log("Erstelle Tabelle 'coupons'...")
    Promise.resolve(sql`
        CREATE TABLE IF NOT EXISTS coupons (
            coupon_id SERIAL PRIMARY KEY,
            code VARCHAR(255) NOT NULL UNIQUE,
            value INTEGER NOT NULL CHECK (value > 0),
            type VARCHAR(255) NOT NULL CHECK (type IN ('percent', 'fixed', 'free', 'bonus')),
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            usage_limit INTEGER,
            usage_count INTEGER NOT NULL,
            created TIMESTAMP NOT NULL DEFAULT NOW(),
            app_id INTEGER NOT NULL,
            FOREIGN KEY (app_id) REFERENCES apps(app_id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (coupon_id)
        );
    `).then(setupCouponShopLink);

}

async function setupCouponShopLink() {
    return sql`
        CREATE TABLE IF NOT EXISTS coupon_shop_links (
            coupon_id INTEGER NOT NULL,
            shop_id INTEGER NOT NULL,
            FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (coupon_id, shop_id)
        );
    `;
}
export function couponExists(couponID) {
    return sql`
        SELECT EXISTS(
            SELECT 1
            FROM coupons
            WHERE coupon_id = ${couponID}
        );
    `;
}

export function createCoupon(code, value, type, startDate , endDate, usageLimit, usageCount, created, appID) {
    console.log("createCoupon")
    console.log("code: %s, value: %s, type: %s, startDate: %s, endDate: %s, usageLimit: %s, usageCount: %s, created: %s, appID: %s", code, value, type, startDate, endDate, usageLimit, usageCount, created, appID)
    return sql`
        INSERT INTO coupons (code, value, type, start_date, end_date, usage_limit, usage_count, created, app_id)
        VALUES (${code}, ${value}, ${type}, ${startDate}, ${endDate}, ${usageLimit}, ${usageCount}, ${created}, ${appID})
        RETURNING coupon_id;
    `;
}

export function deleteCoupon(couponID) {
    return sql`
        DELETE FROM coupons
        WHERE coupon_id = ${couponID};
    `;
}

export function updateCoupon(couponID, code, value, type, startDate, endDate, usageLimit, usageCount, appID) {
    return sql`
        UPDATE coupons
        SET code = ${code}, value = ${value}, type = ${type}, start_date = ${startDate}, end_date = ${endDate}, usage_limit = ${usageLimit}, usage_count = ${usageCount}, app_id = ${appID}
        WHERE coupon_id = ${couponID};
    `;
}

export function updateCouponUsageCount(couponID, usageCount) {
    return sql`
        UPDATE coupons
        SET usage_count = ${usageCount}
        WHERE coupon_id = ${couponID};
    `;
}

export function getCouponInfo(couponID) {
    return sql`
        SELECT *
        FROM coupons
        WHERE coupon_id = ${couponID};
    `;
}

export function getCouponInfoByCode(couponCode) {
    return sql`
        SELECT *
        FROM coupons
        WHERE code = ${couponCode};
    `;
}

export function isCouponValid(couponID, shopID) {
    if (couponID === undefined || couponID === null||shopID === undefined || shopID === null) {
        return Promise.resolve(false);
    }
    // Checks if link exists, usage limit is not exceeded and coupon is not expired and coupon has started
    // start_date, end_date and usage_limit can be null, in that case the check is skipped

    return sql`
          SELECT EXISTS(
            SELECT 1
            FROM coupon_shop_links
            WHERE coupon_id = ${couponID} AND shop_id = ${shopID}
        ) AND (
            SELECT usage_limit
            FROM coupons
            WHERE coupon_id = ${couponID}
        ) IS NULL OR (
            SELECT usage_count
            FROM coupons
            WHERE coupon_id = ${couponID}
        ) < (
            SELECT usage_limit
            FROM coupons
            WHERE coupon_id = ${couponID}
        ) AND (
            SELECT end_date
            FROM coupons
            WHERE coupon_id = ${couponID}
        ) IS NULL OR (
            SELECT end_date
            FROM coupons
            WHERE coupon_id = ${couponID}
        ) > NOW() AND (
            SELECT start_date
            FROM coupons
            WHERE coupon_id = ${couponID}
        ) IS NULL OR (
            SELECT start_date
            FROM coupons
            WHERE coupon_id = ${couponID}
        ) < NOW();
    `;
}

export function getCouponCount() {
    return sql`
        SELECT COUNT(*)
        FROM coupons;
    `;
}

export function getCouponList() {
    return sql`
        SELECT *
        FROM coupons;
    `;
}

export function getCouponListByApp(appID) {
    return sql`
        SELECT *
        FROM coupons
        WHERE app_id = ${appID};
    `;
}

export function getCouponShopLinkListByCoupon(couponID) {
    return sql`
        SELECT *
        FROM coupon_shop_links
        WHERE coupon_id = ${couponID};
    `;
}

export function getShopListByCoupon(couponID) {
    return sql`
        SELECT shops.*
        FROM shops
        INNER JOIN coupon_shop_links ON shops.shop_id = coupon_shop_links.shop_id
        WHERE coupon_shop_links.coupon_id = ${couponID};
    `;
}

export function getCouponListByShop(shopID) {
    return sql`
        SELECT coupons.*
        FROM coupons
        INNER JOIN coupon_shop_links ON coupons.coupon_id = coupon_shop_links.coupon_id
        WHERE coupon_shop_links.shop_id = ${shopID};
    `;
}

export function addCouponShopLink(couponID, shopID) {
    return sql`
        INSERT INTO coupon_shop_links (coupon_id, shop_id)
        VALUES (${couponID}, ${shopID});
    `;
}

export function deleteCouponShopLink(couponID, shopID) {
    return sql`
        DELETE FROM coupon_shop_links
        WHERE coupon_id = ${couponID} AND shop_id = ${shopID};
    `;
}