// --- app.js --- Node backend ---
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());

// --- CONNESSIONE DATABASE ---
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // metti la tua password
    database: "meditactive"
});

connection.connect(err => {
    if (err) {
        console.error("Errore connessione MySQL:", err);
        return;
    }
    console.log("✅ Connesso a MySQL!");
});

// --- ROUTE UTENTI ---
app.get("/api/users", (req, res) => {
    connection.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post("/api/users", (req, res) => {
    const { nome, cognome, email } = req.body;
    connection.query(
        "INSERT INTO users (nome, cognome, email) VALUES (?, ?, ?)",
        [nome, cognome, email],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            connection.query("SELECT * FROM users WHERE id = ?", [result.insertId], (err2, rows) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json(rows[0]);
            });
        }
    );
});

app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { nome, cognome, email } = req.body;
    connection.query(
        "UPDATE users SET nome = ?, cognome = ?, email = ? WHERE id = ?",
        [nome, cognome, email, id],
        err => {
            if (err) return res.status(500).json({ error: err.message });
            connection.query("SELECT * FROM users WHERE id = ?", [id], (err2, rows) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json(rows[0]);
            });
        }
    );
});

app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    connection.query("DELETE FROM users WHERE id = ?", [id], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Utente eliminato" });
    });
});

// --- ROUTE INTERVALLI CON FILTRI ---
app.get("/api/intervals", (req, res) => {
    const { goalId, start, end } = req.query;

    connection.query("SELECT * FROM intervals", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        let intervals = results.map(i => ({
            ...i,
            goals: i.goals ? JSON.parse(i.goals) : []
        }));

        // --- FILTRO PER GOAL ---
        if (goalId) {
            const gId = Number(goalId);
            intervals = intervals.filter(i => i.goals.includes(gId));
        }

        // --- FILTRO PER DATE (corretto) ---
        if (start) {
            const startFilter = new Date(start + "T00:00:00"); // inizio giorno
            intervals = intervals.filter(i => new Date(i.startDate) >= startFilter);
        }
        if (end) {
            const endFilter = new Date(end + "T23:59:59"); // fine giorno
            intervals = intervals.filter(i => new Date(i.endDate) <= endFilter);
        }

        res.json(intervals);
    });
});

app.post("/api/intervals", (req, res) => {
    const { startDate, endDate, userId } = req.body;
    connection.query(
        "INSERT INTO intervals (startDate, endDate, userId, goals) VALUES (?, ?, ?, ?)",
        [startDate, endDate, userId, JSON.stringify([])],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            connection.query("SELECT * FROM intervals WHERE id = ?", [result.insertId], (err2, rows) => {
                if (err2) return res.status(500).json({ error: err2.message });
                const interval = { ...rows[0], goals: [] };
                res.json(interval);
            });
        }
    );
});

app.put("/api/intervals/:id", (req, res) => {
    const { id } = req.params;
    const { startDate, endDate, userId } = req.body;
    connection.query(
        "UPDATE intervals SET startDate = ?, endDate = ?, userId = ? WHERE id = ?",
        [startDate, endDate, userId, id],
        err => {
            if (err) return res.status(500).json({ error: err.message });
            connection.query("SELECT * FROM intervals WHERE id = ?", [id], (err2, rows) => {
                if (err2) return res.status(500).json({ error: err2.message });
                const interval = { ...rows[0], goals: rows[0].goals ? JSON.parse(rows[0].goals) : [] };
                res.json(interval);
            });
        }
    );
});

app.delete("/api/intervals/:id", (req, res) => {
    const { id } = req.params;
    connection.query("DELETE FROM intervals WHERE id = ?", [id], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Intervallo eliminato" });
    });
});

// --- ASSOCIA GOAL ---
app.post("/api/intervals/:id/goals", (req, res) => {
    const { id } = req.params;
    const { goalId } = req.body;
    connection.query("SELECT * FROM intervals WHERE id = ?", [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: "Intervallo non trovato" });

        let goals = rows[0].goals ? JSON.parse(rows[0].goals) : [];
        if (!goals.includes(goalId)) goals.push(goalId);

        connection.query(
            "UPDATE intervals SET goals = ? WHERE id = ?",
            [JSON.stringify(goals), id],
            err2 => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ interval: { ...rows[0], goals } });
            }
        );
    });
});

// --- ROUTE MEDITAZIONI / GOAL ---
app.get("/api/meditations", (req, res) => {
    connection.query("SELECT * FROM meditations", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});