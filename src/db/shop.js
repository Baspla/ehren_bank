import sql from "./db.js";

export function setupShops() {
    console.log("Erstelle Tabelle 'shops'...")
    return sql`
        CREATE TABLE IF NOT EXISTS shops (
            shop_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(512) NOT NULL,
            image VARCHAR(512),
            price INTEGER NOT NULL,
            hidden BOOLEAN NOT NULL,
            created TIMESTAMP NOT NULL,
            app_id INTEGER NOT NULL,
            item_name VARCHAR(255) NOT NULL,
            item_description VARCHAR(512),
            item_image VARCHAR(512),
            item_rarity VARCHAR(255) NOT NULL,
            item_tags VARCHAR(512) NOT NULL,
            item_button_text VARCHAR(255),
            item_button_url VARCHAR(512),
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

export function createShop(name, description, image, price, hidden, created, appID, itemName, itemDescription, itemImage, itemRarity, itemTags, itemButtonText, itemButtonUrl) {
    name = name.substring(0, 255);
    description = description.substring(0, 512);
    image = image.substring(0, 512);
    itemName = itemName.substring(0, 255);
    if (itemDescription !== null) itemDescription = itemDescription.substring(0, 512);
    if (itemImage !== null) itemImage = itemImage.substring(0, 512);
    itemRarity = itemRarity.substring(0, 255);
    itemTags = itemTags.substring(0, 255);
    if (itemButtonText !== null) itemButtonText = itemButtonText.substring(0, 255);
    if (itemButtonUrl !== null) itemButtonUrl = itemButtonUrl.substring(0, 512);

    return sql`
        INSERT INTO shops (name, description, image, price, hidden, created, app_id, item_name, item_description, item_image, item_rarity, item_tags, item_button_text, item_button_url)
        VALUES (${name}, ${description}, ${image}, ${price}, ${hidden}, ${created}, ${appID}, ${itemName}, ${itemDescription}, ${itemImage}, ${itemRarity}, ${itemTags}, ${itemButtonText}, ${itemButtonUrl})
        RETURNING shop_id;
    `;
}

export function deleteShop(shopID) {
    return sql`
        DELETE FROM shops
        WHERE shop_id = ${shopID};
    `;
}

export function updateShop(shopID, name, description, image, price, hidden, appID, itemName, itemDescription, itemImage, itemRarity, itemTags, itemButtonText, itemButtonUrl) {
    name = name.substring(0, 255);
    description = description.substring(0, 512);
    image = image.substring(0, 512);
    itemName = itemName.substring(0, 255);
    if (itemDescription !== null) itemDescription = itemDescription.substring(0, 512);
    if (itemImage !== null) itemImage = itemImage.substring(0, 512);
    itemRarity = itemRarity.substring(0, 255);
    itemTags = itemTags.substring(0, 255);
    if (itemButtonText !== null) itemButtonText = itemButtonText.substring(0, 255);
    if (itemButtonUrl !== null) itemButtonUrl = itemButtonUrl.substring(0, 512);
    return sql`
        UPDATE shops
        SET name = ${name}, description = ${description}, image = ${image}, price = ${price}, hidden = ${hidden}, app_id = ${appID}, item_name = ${itemName}, item_description = ${itemDescription}, item_image = ${itemImage}, item_rarity = ${itemRarity}, item_tags = ${itemTags}, item_button_text = ${itemButtonText}, item_button_url = ${itemButtonUrl}
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
