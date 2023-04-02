import sql from "./db.js";

export async function setupApps() {
    console.log("Erstelle Tabelle 'apps'...")
    return sql`
        CREATE TABLE IF NOT EXISTS apps (
            app_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            url VARCHAR(255) NOT NULL,
            permissions INTEGER NOT NULL,
            apikey VARCHAR(255) NOT NULL,
            UNIQUE (app_id)
        );
    `;
}

export function createApp(name, description, url, permissions, apikey) {
    console.log("Erstelle App. Name: " + name + ", Beschreibung: " + description + ", URL: " + url + ", Permissions: " + permissions + ", API-Key: " + apikey);
    name = name.substring(0, 255);
    description = description.substring(0, 255);
    url = url.substring(0, 255);
    return sql`INSERT INTO apps (name, description, url, permissions, apikey) VALUES (${name}, ${description}, ${url}, ${permissions}, ${apikey}) RETURNING app_id`.then(result => {
        if (result.length === 0)
            return null;
        return result[0].app_id;
    })
}

export function deleteApp(appID) {
    if (isNaN(appID)) {
        return null;
    }
    return sql`DELETE FROM apps WHERE app_id = ${appID}`;
}

export function updateApp(appID, name, description, url, permissions, apikey) {
    if (isNaN(appID)) {
        return null;
    }
    name = name.substring(0, 255);
    description = description.substring(0, 255);
    url = url.substring(0, 255);
    return sql`UPDATE apps SET name = ${name}, description = ${description}, url = ${url}, permissions = ${permissions}, apikey = ${apikey} WHERE app_id = ${appID}`;
}

export function getAppInfo(appID) {
    if (isNaN(appID)) {
        return null;
    }
    return sql`SELECT * FROM apps WHERE app_id = ${appID}`.then(result => {
        if (result.length === 0)
            return null;
        return result[0];
    })
}

export function getAppCount() {
    return sql`SELECT COUNT(*) FROM apps`;
}

export function getAppList() {
    return sql`SELECT * FROM apps`;
}

// Returns a list of apps that have the specified permission XOR'd with the specified permission
export function getAppListByPermission(permission) {
    return sql`SELECT * FROM apps WHERE permissions & ${permission} = ${permission}`;
}

export function getAppIDFromAPIKey(apikey) {
    return sql`SELECT app_id FROM apps WHERE apikey = ${apikey}`.then(result => {
        if (result.length === 0)
            return null;
        return result[0].app_id;
    })
}