import sql from "./db.js";

export function setupShops() {
    console.log("Erstelle Tabelle 'shops'...")
    return sql`
        CREATE TABLE IF NOT EXISTS shops (
            shop_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            image VARCHAR(255),
            price INTEGER NOT NULL,
            hidden BOOLEAN NOT NULL,
            created TIMESTAMP NOT NULL,
            app_id INTEGER NOT NULL,
            item_name VARCHAR(255) NOT NULL,
            item_description VARCHAR(255),
            item_image VARCHAR(255),
            item_rarity VARCHAR(255) NOT NULL,
            item_tags VARCHAR(255) NOT NULL,
            FOREIGN KEY (app_id) REFERENCES apps(app_id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (shop_id)
        );
    `;
}
export function shopExists(shopID) {
    return sql`
        SELECT * FROM shops WHERE shop_id = ${shopID};
    `;
}

export function createShop(name, description, image, price, hidden, created, appID, itemName, itemDescription, itemImage, itemRarity, itemTags) {
    return sql`
        INSERT INTO shops (name, description, image, price, hidden, created, app_id, item_name, item_description, item_image, item_rarity, item_tags)
        VALUES (${name}, ${description}, ${image}, ${price}, ${hidden}, ${created}, ${appID}, ${itemName}, ${itemDescription}, ${itemImage}, ${itemRarity}, ${itemTags})
        RETURNING shop_id;
    `;
}

export function deleteShop(shopID) {
    return sql`
        DELETE FROM shops
        WHERE shop_id = ${shopID};
    `;
}

export function updateShop(shopID, name, description, image, price, hidden, appID, itemName, itemDescription, itemImage, itemRarity, itemTags) {
    return sql`
        UPDATE shops
        SET name = ${name}, description = ${description}, image = ${image}, price = ${price}, hidden = ${hidden}, app_id = ${appID}, item_name = ${itemName}, item_description = ${itemDescription}, item_image = ${itemImage}, item_rarity = ${itemRarity}, item_tags = ${itemTags}
        WHERE shop_id = ${shopID};
    `;
}

export function getShopInfo(shopID) {
    return sql`
        SELECT shops.*, apps.name AS app_name FROM shops JOIN apps ON shops.app_id = apps.app_id WHERE shop_id = ${shopID};
    `.then((result) => {
        if(result.length > 0) {
            return result[0];
        }else {
            return null;
        }
    })
}

export function getShopList() {
    return sql`
        SELECT shops.*, apps.name AS app_name FROM shops JOIN apps ON shops.app_id = apps.app_id WHERE shops.hidden = false ORDER BY shops.app_id, shop_id DESC;
    `;
}

export function getShopListByAppID(appID) {
    return sql`
        SELECT * FROM shops WHERE app_id = ${appID} ORDER BY shop_id DESC;
    `;
}

export function getShopListByAppIDAndHidden(appID, hidden) {
    return sql`
        SELECT * FROM shops WHERE app_id = ${appID} AND hidden = ${hidden} ORDER BY shop_id DESC;
    `;
}
