import sql from "./db.js";

export function setupShops() {
    return sql`
        CREATE TABLE IF NOT EXISTS shops (
            shop_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            image VARCHAR(255),
            created TIMESTAMP NOT NULL,
            app_id INTEGER NOT NULL,
            FOREIGN KEY (app_id) REFERENCES apps(app_id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (shop_id)
        );
    `;
}
export function shopExists(shopID) {
    return sql`SELECT EXISTS(SELECT 1 FROM shops WHERE shop_id = ${shopID})`;
}

export function createShop(shopID, name, description, image, created, appID) {
    return sql`INSERT INTO shops (shop_id, name, description, image, created, app_id) VALUES (${shopID}, ${name}, ${description}, ${image}, ${created}, ${appID})`;
}

export function deleteShop(shopID) {
    return sql`DELETE FROM shops WHERE shop_id = ${shopID}`;
}

export function updateShop(shopID, name, description, image, appID) {
    return sql`UPDATE shops SET name = ${name}, description = ${description}, image = ${image}, app_id = ${appID} WHERE shop_id = ${shopID}`;
}

export function getShopInfo(shopID) {
    return sql`SELECT * FROM shops WHERE shop_id = ${shopID}`;
}

export function getShopCount() {
    return sql`SELECT COUNT(*) FROM shops`;
}

export function getShopList() {
    return sql`SELECT * FROM shops`;
}

export function getShopListByApp(appID) {
    return sql`SELECT * FROM shops WHERE app_id = ${appID}`;
}

export function getShopListByCoupon(couponID) {
    return sql`SELECT * FROM shops WHERE shop_id IN (SELECT shop_id FROM coupon_shops WHERE coupon_id = ${couponID})`;
}