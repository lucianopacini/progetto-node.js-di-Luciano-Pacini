CREATE DATABASE IF NOT EXISTS meditactive;
USE meditactive;

-- --- TABELLA USERS ---
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL
);

-- --- TABELLA INTERVALS ---
CREATE TABLE IF NOT EXISTS intervals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  userId INT NOT NULL,
  goals TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- --- TABELLA MEDITATIONS (GOALS) ---
CREATE TABLE IF NOT EXISTS meditations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  type VARCHAR(50)
);

-- --- DATI DI TEST (OPZIONALE MA CONSIGLIATO) ---
INSERT INTO meditations (title, type) VALUES
('Meditazione base', 'mindfulness'),
('Respirazione', 'breathing'),
('Concentrazione', 'focus');