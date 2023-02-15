import sql from "./db.js";

export async function setupItems() {
    console.log("Erstelle Tabelle 'items'...")
    return sql`
        CREATE TABLE IF NOT EXISTS items (
            item_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(255),
            image VARCHAR(255),
            rarity VARCHAR(255) NOT NULL,
            tags VARCHAR(255) NOT NULL,
            created TIMESTAMP NOT NULL,
            app_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (app_id) REFERENCES apps(app_id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (item_id)
        );
        
    `;
}

export function itemExists(itemID) {
    return sql`SELECT EXISTS(SELECT 1 FROM items WHERE item_id = ${itemID})`;
}

export function createItem(itemID, userId, name, description, image, rarity, tags, created, appID) {
    return sql`INSERT INTO items (item_id, user_id, name, description, image, rarity, tags, created, app_id) VALUES (${itemID}, ${userId}, ${name}, ${description}, ${image}, ${rarity}, ${tags}, ${created}, ${appID})`;
}

export function deleteItem(itemID) {
    return sql`DELETE FROM items WHERE item_id = ${itemID}`;
}

export function updateItem(itemID, name, description, image, rarity, tags, appID) {
    return sql`UPDATE items SET name = ${name}, description = ${description}, image = ${image}, rarity = ${rarity}, tags = ${tags}, app_id = ${appID} WHERE item_id = ${itemID}`;
}

export function getItemInfo(itemID) {
    return sql`SELECT * FROM items WHERE item_id = ${itemID}`;
}

export function getItemCount() {
    return sql`SELECT COUNT(*) FROM items`;
}

export function getItemList() {
    return sql`SELECT * FROM items`;
}

export function getItemListByUser(userID) {
    return sql`SELECT * FROM items WHERE user_id = ${userID}`;
}

export function getItemListByApp(appID) {
    return sql`SELECT * FROM items WHERE app_id = ${appID}`;
}

export function getItemListByUserAndApp(userID, appID) {
    return sql`SELECT * FROM items WHERE user_id = ${userID} AND app_id = ${appID}`;
}

export function getItemListByUserAndRarity(userID, rarity) {
    return sql`SELECT * FROM items WHERE user_id = ${userID} AND rarity = ${rarity}`;
}