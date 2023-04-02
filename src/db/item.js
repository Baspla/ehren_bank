import sql from "./db.js";

export async function setupItems() {
    console.log("Erstelle Tabelle 'items'...")
    return sql`
        CREATE TABLE IF NOT EXISTS items (
            item_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(512),
            image VARCHAR(512),
            rarity VARCHAR(255) NOT NULL,
            tags VARCHAR(512) NOT NULL,
            created TIMESTAMP NOT NULL DEFAULT NOW(),
            app_id INTEGER NOT NULL,
            button_text VARCHAR(255),
            button_url VARCHAR(512),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (app_id) REFERENCES apps(app_id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (item_id)
        );
        
    `;
}

export function itemExists(itemID) {
    return sql`SELECT EXISTS(SELECT 1 FROM items WHERE item_id = ${itemID})`;
}

export function createItem(userId, name, description, image, rarity, tags, created, appID, buttonText, buttonURL) {
    name = name.substring(0, 255);
    description = description.substring(0, 512);
    if(image!=null) image = image.substring(0, 512);
    rarity = rarity.substring(0, 255);
    tags = tags.substring(0, 512);
    if (buttonText != null) buttonText = buttonText.substring(0, 255);
    if (buttonURL != null) buttonURL = buttonURL.substring(0, 512);
    console.log("createItem: " + userId + ", " + name + ", " + description + ", " + image + ", " + rarity + ", " + tags + ", " + created + ", " + appID + ", " + buttonText + ", " + buttonURL);
    return sql`INSERT INTO items (user_id, name, description, image, rarity, tags, created, app_id, button_text, button_url) VALUES (${userId}, ${name}, ${description}, ${image}, ${rarity}, ${tags}, ${created}, ${appID}, ${buttonText}, ${buttonURL}) RETURNING item_id`;
}

export function deleteItem(itemID) {
    return sql`DELETE FROM items WHERE item_id = ${itemID}`;
}

export function updateItem(itemID, name, description, image, rarity, tags, buttonText, buttonURL) {
    name = name.substring(0, 255);
    description = description.substring(0, 512);
    if(image!=null) image = image.substring(0, 512);
    rarity = rarity.substring(0, 255);
    tags = tags.substring(0, 512);
    if (buttonText != null) buttonText = buttonText.substring(0, 255);
    if (buttonURL != null) buttonURL = buttonURL.substring(0, 512);
    return sql`UPDATE items SET name = ${name}, description = ${description}, image = ${image}, rarity = ${rarity}, tags = ${tags}WHERE item_id = ${itemID}, button_text = ${buttonText}, button_url = ${buttonURL}`;
}

export function getItemInfo(itemID) {
    return sql`SELECT items.*, apps.name AS app_name, users.displayname AS user_displayname FROM items JOIN apps ON items.app_id = apps.app_id JOIN users ON items.user_id = users.user_id WHERE item_id = ${itemID}`.then(result => {
        if (result.length > 0) {
            return result[0];
        } else {
            return null;
        }
    }).catch(err => {
        console.log(err);
    })
}

export function getItemCount() {
    return sql`SELECT COUNT(*) FROM items`;
}

export function getItemCountByUser(user_id) {
    return sql`SELECT COUNT(*) FROM items WHERE user_id = ${user_id}`.then(result => {
        if (result.length > 0) {
            return result[0].count;
        } else {
            return null;
        }
    }).catch(err => {
        console.log(err);
    })
}

export function getItemList() {
    return sql`SELECT items.*, apps.name AS app_name FROM items JOIN apps ON items.app_id = apps.app_id`;
}

export function getItemListByUser(userID) {
    return sql`SELECT items.*, apps.name AS app_name FROM items JOIN apps ON items.app_id = apps.app_id WHERE user_id = ${userID} ORDER BY created DESC`;
}

export function getItemListByApp(appID) {
    return sql`SELECT * FROM items WHERE app_id = ${appID}`;
}

export function getItemListByUserAndApp(userID, appID) {
    return sql`SELECT items.*, apps.name AS app_name FROM items JOIN apps ON items.app_id = apps.app_id WHERE user_id = ${userID} AND items.app_id = ${appID}  ORDER BY created DESC`;
}

export function getItemListByUserAndRarity(userID, rarity) {
    return sql`SELECT items.*, apps.name FROM items JOIN apps ON items.app_id = apps.app_id WHERE user_id = ${userID} AND items.rarity = ${rarity}  ORDER BY created DESC`;
}