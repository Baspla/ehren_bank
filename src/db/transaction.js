import sql from "./db.js";

export function setupTransactions() {
    console.log("Erstelle Tabelle 'transactions'...")
    return sql`
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            sender_id INTEGER,
            recipient_id INTEGER,
            app_id INTEGER,
            amount INTEGER NOT NULL,
            description VARCHAR(255) NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY (app_id) REFERENCES apps(app_id) ON DELETE SET NULL ON UPDATE CASCADE,
            UNIQUE (transaction_id)
        );
    `;
}

export function transactionExists(transactionID) {
    return sql`SELECT COUNT(*) FROM transactions WHERE transaction_id = ${transactionID}`;
}

export function createTransaction(userID, senderID, recipientID, appID, amount, description) {
    console.log("Erstelle Transaktion...")
    console.log(userID, senderID, recipientID, appID, amount, description)
    description = description.substring(0, 255);
    return Promise.resolve(sql`INSERT INTO transactions (user_id, sender_id, recipient_id, app_id, amount, description, timestamp) VALUES (${userID}, ${senderID}, ${recipientID}, ${appID}, ${amount}, ${description}, NOW())`);
}

export function deleteTransaction(transactionID) {
    return sql`DELETE FROM transactions WHERE transaction_id = ${transactionID}`;
}

export function updateTransaction(transactionID, userID, senderID, recipientID, appID, amount, description, timestamp) {
    description = description.substring(0, 255);
    return sql`UPDATE transactions SET user_id = ${userID}, sender_id = ${senderID}, recipient_id = ${recipientID}, app_id = ${appID}, amount = ${amount}, description = ${description}, timestamp = ${timestamp} WHERE transaction_id = ${transactionID}`;
}

export function getTransactionInfo(transactionID) {
    return sql`SELECT * FROM transactions WHERE transaction_id = ${transactionID}`;
}

export function getTransactionCount() {
    return sql`SELECT COUNT(*) FROM transactions`;
}

export function getTransactionCountByUser(user_id) {
    return sql`SELECT COUNT(*) FROM transactions WHERE user_id = ${user_id}`.then(result => {
        if (result.length > 0) {
            return result[0].count;
        } else {
            return null;
        }
    }).catch(err => {
        console.log(err);
    })
}


export function getTransactionList() {
    return sql`SELECT * FROM transactions ORDER BY timestamp DESC`;
}

export function getTransactionListByUser(userID) {
    return sql`SELECT * FROM transactions WHERE user_id = ${userID} ORDER BY timestamp DESC`;
}

export function getTransactionListBySender(senderID) {
    return sql`SELECT * FROM transactions WHERE sender_id = ${senderID} ORDER BY timestamp DESC`;
}

export function getTransactionListByRecipient(recipientID) {
    return sql`SELECT * FROM transactions WHERE recipient_id = ${recipientID} ORDER BY timestamp DESC`;
}

export function getTransactionListByApp(appID) {
    return sql`SELECT * FROM transactions WHERE app_id = ${appID} ORDER BY timestamp DESC`;
}

export function getTransactionListBySenderAndRecipient(senderID, recipientID) {
    return sql`SELECT * FROM transactions WHERE sender_id = ${senderID} AND recipient_id = ${recipientID} ORDER BY timestamp DESC`;
}

export function getTransactionListBySenderAndApp(senderID, appID) {
    return sql`SELECT * FROM transactions WHERE sender_id = ${senderID} AND app_id = ${appID} ORDER BY timestamp DESC`;
}

export function getTransactionListByRecipientAndApp(recipientID, appID) {
    return sql`SELECT * FROM transactions WHERE recipient_id = ${recipientID} AND app_id = ${appID} ORDER BY timestamp DESC`;
}


