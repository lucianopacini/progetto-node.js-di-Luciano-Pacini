# MeditActive

**MeditActive** è una dashboard web per gestire utenti, intervalli di tempo e meditazioni (goal).  
Permette di aggiungere, modificare e cancellare utenti e intervalli, associare obiettivi agli intervalli, e filtrare gli intervalli per date o per obiettivi.  
Il progetto è pensato per essere semplice, intuitivo e pronto per il portfolio di uno sviluppatore full-stack.

---

## 🛠 Tecnologie utilizzate
- Frontend: **React**  
- Backend: **Node.js**, **Express**  
- Database: **MySQL**  
- Librerie: **Axios**, **cors**, **body-parser**  

---

## ⚡ Funzionalità principali

### Utenti
- Creazione, modifica e cancellazione di utenti  
- Ogni utente ha: nome, cognome, email  

### Intervalli
- Creazione, modifica e cancellazione di intervalli associati a un utente  
- Ogni intervallo ha: data inizio, data fine, utente di riferimento  
- Filtri disponibili: intervalli per **date** e per **goal**  

### Goal / Meditazioni
- Visualizzazione dei goal disponibili  
- Associazione di goal agli intervalli  
- Visualizzazione pulita delle date nel frontend (formato leggibile)

---

## 🚀 Installazione e avvio

# 1. Clona il repository
git clone https://github.com/tuo-username/meditactive.git
cd meditactive-api

# 2. Backend
npm install
node app.js

# 3. Frontend (in un altro terminale)
cd frontend
npm install
npm start

Il progetto si aprirà automaticamente su http://localhost:3000

---

## 🔗 API principali

### Utenti
- `GET /api/users` → Lista utenti  
- `POST /api/users` → Aggiungi utente  
- `PUT /api/users/:id` → Modifica utente  
- `DELETE /api/users/:id` → Cancella utente  

### Intervalli
- `GET /api/intervals` → Lista intervalli (con filtri opzionali: `start`, `end`, `goalId`)  
- `POST /api/intervals` → Aggiungi intervallo  
- `PUT /api/intervals/:id` → Modifica intervallo  
- `DELETE /api/intervals/:id` → Cancella intervallo  

### Associare goal
- `POST /api/intervals/:id/goals` → Associa un goal a un intervallo  

### Meditazioni / Goal
- `GET /api/meditations` → Lista goal disponibili  

---

## 📝 Note importanti
- Tutte le query al database usano **prepared statements** → protezione da SQL injection  
- Il frontend aggiorna utenti e intervalli senza ricaricare la pagina  
- Le date sono visualizzate in formato leggibile per una migliore UX  

---

## 💡 Suggerimenti
- Possibile estendere il progetto con autenticazione, notifiche o grafici sulle meditazioni  
- Ottimo come portfolio full-stack pronto da mostrare  

---

## 👨‍💻 Autore
**Luciano Pacini** – sviluppatore full-stack in crescita 🌞🦁
