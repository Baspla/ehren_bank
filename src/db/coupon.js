import sql from "./db.js";

export async function setupCoupons() {
    Promise.resolve(sql`
        CREATE TABLE IF NOT EXISTS coupons (
            coupon_id SERIAL PRIMARY KEY,
            coupon_name VARCHAR(255) NOT NULL,
            coupon_description VARCHAR(255) NOT NULL,
            coupon_code VARCHAR(255) NOT NULL,
            coupon_value INTEGER NOT NULL,
            coupon_type VARCHAR(255) NOT NULL,
            coupon_expiration TIMESTAMP NOT NULL,
            UNIQUE (coupon_id)
        );
    `).then(setupCouponShops);

}

async function setupCouponShops() {
    return sql`
        CREATE TABLE IF NOT EXISTS coupon_shops (
            coupon_id INTEGER NOT NULL,
            shop_id INTEGER NOT NULL,
            FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (coupon_id, shop_id)
        );
    `;
}

export function couponExists(couponID) {
    return sql`SELECT EXISTS(SELECT 1 FROM coupons WHERE coupon_id = ${couponID})`;
}

export function createCoupon(couponID, couponName, couponDescription, couponCode, couponValue, couponType, shopIDs, couponExpiration) {
    return sql`INSERT INTO coupons (coupon_id, coupon_name, coupon_description, coupon_code, coupon_value, coupon_type, coupon_expiration) VALUES (${couponID}, ${couponName}, ${couponDescription}, ${couponCode}, ${couponValue}, ${couponType}, ${couponExpiration})`.then(
        sql`INSERT INTO coupon_shops (coupon_id, shop_id) VALUES ${sql.join(shopIDs.map(shopID => [couponID, shopID]), ',')}`
    )
}

export function deleteCoupon(couponID) {
    return sql`DELETE FROM coupons WHERE coupon_id = ${couponID}`;
}

export function updateCoupon(couponID, couponName, couponDescription, couponCode, couponValue, couponType, shopIDs, couponExpiration) {
    return sql`UPDATE coupons SET coupon_name = ${couponName}, coupon_description = ${couponDescription}, coupon_code = ${couponCode}, coupon_value = ${couponValue}, coupon_type = ${couponType}, coupon_expiration = ${couponExpiration} WHERE coupon_id = ${couponID}`.then(
        sql`DELETE FROM coupon_shops WHERE coupon_id = ${couponID}`
    ).then(
        sql`INSERT INTO coupon_shops (coupon_id, shop_id) VALUES ${sql.join(shopIDs.map(shopID => [couponID, shopID]), ',')}`
    )
}

export function getCouponInfo(couponID) {
    return sql`SELECT * FROM coupons WHERE coupon_id = ${couponID}`;
}

export function getCouponCount() {
    return sql`SELECT COUNT(*) FROM coupons`;
}

export function getCouponList() {
    return sql`SELECT * FROM coupons`;
}

export function getCouponListByApp(appID) {
    return sql`SELECT * FROM coupons WHERE coupon_id IN (SELECT coupon_id FROM coupon_shops WHERE shop_id IN (SELECT shop_id FROM shops WHERE app_id = ${appID}))`;
}

export function getCouponListByShop(shopID) {
    return sql`SELECT * FROM coupons WHERE coupon_id IN (SELECT coupon_id FROM coupon_shops WHERE shop_id = ${shopID})`;
}