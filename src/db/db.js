//connect to a postgres database
import postgres from 'postgres';
import prexit from 'prexit';

import {
    setupUsers
} from "./user.js";
import {
    setupTransactions
} from "./transaction.js";
import {
    setupApps
} from "./app.js";
import {
    setupItems
} from "./item.js";
import {
    setupCoupons
} from "./coupon.js";
import {
    setupShops
} from "./shop.js";
import {setupPromotions} from "./promotion.js";

const sql = postgres({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USER,
    onnotice: (notice) => {}
});

prexit(async () => {
    await sql.end({ timeout: 5 })
    await console.log("Datenbankverbindung geschlossen!")
})

export default sql;

// Setup database tables
export async function setupDatabase() {
    console.log("Datenbank wird eingerichtet...")
    await setupUsers();
    await setupApps();
    await setupTransactions();
    await setupItems();
    await setupShops();
    await setupCoupons();
    await setupPromotions();
    console.log("Datenbank eingerichtet!")

}