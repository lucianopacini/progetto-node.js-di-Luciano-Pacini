const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // niente password
});

connection.connect(err => {
    if (err) throw err;
    console.log("✅ Connesso a MySQL!");

    // 1️⃣ Crea database
    connection.query("CREATE DATABASE IF NOT EXISTS meditactive", (err) => {
        if (err) throw err;
        console.log("Database 'meditactive' creato o già esistente");

        // 2️⃣ Usa database
        connection.query("USE meditactive", (err) => {
            if (err) throw err;

            // 3️⃣ Crea tabella users
            connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(50) NOT NULL,
                    cognome VARCHAR(50) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE
                )
            `, (err) => {
                if (err) throw err;
                console.log("Tabella users creata");

                // 4️⃣ Crea tabella meditations
                connection.query(`
                    CREATE TABLE IF NOT EXISTS meditations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(100) NOT NULL,
                        duration INT NOT NULL
                    )
                `, (err) => {
                    if (err) throw err;
                    console.log("Tabella meditations creata");

                    // 5️⃣ Crea tabella intervals
                    connection.query(`
                        CREATE TABLE IF NOT EXISTS intervals (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            startDate DATE NOT NULL,
                            endDate DATE NOT NULL,
                            userId INT NOT NULL,
                            goals JSON,
                            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
                        )
                    `, (err) => {
                        if (err) throw err;
                        console.log("Tabella intervals creata");
                        connection.end();
                    });
                });
            });
        });
    });
});