import sql from "./db.js";

export async function setupPromotions() {
    console.log("Erstelle Tabelle 'promotions'...")
    return sql`
        CREATE TABLE IF NOT EXISTS promotions (
            promotion_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            image_url VARCHAR(255),
            url VARCHAR(255),
            color_left VARCHAR(255) NOT NULL,
            color_right VARCHAR(255) NOT NULL,
            UNIQUE (promotion_id)
        );
    `;
}

export function createPromotion(name, description, image_url, url, colorLeft, colorRight) {
    return sql`INSERT INTO promotions (name, description, image_url, url, color_left, color_right) VALUES (${name}, ${description}, ${image_url}, ${url}, ${colorLeft}, ${colorRight})`;
}

export function deletePromotion(promotionID) {
    return sql`DELETE FROM promotions WHERE promotion_id = ${promotionID}`;
}

export function updatePromotion(promotionID, name, description, image_url, url, colorLeft, colorRight) {
    return sql`UPDATE promotions SET name = ${name}, description = ${description}, image_url = ${image_url}, url = ${url}, color_left = ${colorLeft}, color_right = ${colorRight} WHERE promotion_id = ${promotionID}`;
}

export function getPromotionInfo(promotionID) {
    return sql`SELECT * FROM promotions WHERE promotion_id = ${promotionID}`;
}

export function getPromotionList() {
    return sql`SELECT * FROM promotions`;
}

export function getPromotionCount() {
    return sql`SELECT COUNT(*) FROM promotions`;
}

export function getRandomPromotion() {
    return sql`SELECT * FROM promotions ORDER BY random() LIMIT 1`.then(result => {
        if(result.count > 0) {
            return result[0]
        } else {
            return null
        }
    })
}