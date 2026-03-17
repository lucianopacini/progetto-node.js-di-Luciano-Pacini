const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "" // prova vuoto prima, poi cambia se serve
});

connection.connect(err => {
    if (err) {
        console.error("❌ Errore connessione:", err.message);
    } else {
        console.log("✅ Connessione root funzionante!");
        connection.end();
    }
});