import sql from "./db.js";

export function isAdmin(userid) {
    return sql`SELECT is_admin FROM users WHERE user_id = ${userid}`;
}

export function makeAdmin(userid) {
    return sql`UPDATE users SET is_admin = true WHERE user_id = ${userid}`;
}

export function removeAdmin(userid) {
    return sql`UPDATE users SET is_admin = false WHERE user_id = ${userid}`;
}