import sql from "./db.js";

export function setupUsers() {
    console.log("Erstelle Tabelle 'users'...")
    return sql`
        CREATE TABLE IF NOT EXISTS users (
            user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL UNIQUE,
            guard_id VARCHAR(255) NOT NULL UNIQUE,
            displayname VARCHAR(255) NOT NULL,
            balance INT NOT NULL DEFAULT 0,
            is_admin BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            last_login TIMESTAMP NOT NULL DEFAULT NOW()
        )
    `;
}

export function createOrUpdateUser(guardid, displayname) {
    return sql`INSERT INTO users (guard_id, displayname) VALUES (${guardid}, ${displayname}) ON CONFLICT (guard_id) DO UPDATE SET displayname = ${displayname}, last_login = NOW()`;
}

export function deleteUser(userid) {
    return sql`DELETE FROM users WHERE user_id = ${userid}`;
}

export function getUserIDFromGuardID(guardid) {
    return sql`SELECT user_id FROM users WHERE guard_id = ${guardid}`.then(result => {
        if(result.length === 0)
            return null;
        return result[0].user_id;
    })
}

export function getUserInfo(userid) {
    return sql`SELECT * FROM users WHERE user_id = ${userid}`.then(result => {
        if(result.length === 0)
            return null;
        return result[0];
    })
}

export function getLimitedUserInfo(userid) {
    return sql`SELECT user_id, guard_id, displayname,created_at, last_login, balance FROM users WHERE user_id = ${userid}`.then(result => {
        if(result.length === 0)
            return null;
        return result[0];
    })
}

export function getUserCount() {
    return sql`SELECT COUNT(*) FROM users`.then(result => {
        if(result.length === 0)
            return null;
        return result[0].count;
    })
}

export function getUserList() {
    return sql`SELECT user_id, guard_id, displayname,created_at, last_login, balance FROM users`;
}

export function getUserListByIsAdmin(isadmin) {
    return sql`SELECT * FROM users WHERE is_admin = ${isadmin}`;
}

export function modifyUserBalance(userid, amount) {
    return sql`UPDATE users SET balance = balance + ${amount} WHERE user_id = ${userid} RETURNING balance`.then(result => {
        if(result.length === 0)
            return null;
        return result[0].balance;
    })
}