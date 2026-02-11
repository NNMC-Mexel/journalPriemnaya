const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS journal_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS journal_letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    letter_number TEXT NOT NULL,
    incoming_number TEXT,
    outgoing_number TEXT,
    fio TEXT NOT NULL,
    region TEXT,
    direction TEXT CHECK(direction IN ('incoming', 'outgoing')) NOT NULL DEFAULT 'incoming',
    arrival_date DATE,
    send_date DATE,
    transfer_from DATE,
    transfer_to DATE,
    transfer_org TEXT,
    transfer_email TEXT,
    mkb TEXT,
    mkb_other TEXT,
    operation_code TEXT,
    operation_other TEXT,
    incoming_content TEXT,
    outgoing_content TEXT,
    subject TEXT,
    content TEXT,
    created_by_user_id INTEGER,
    updated_by_user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES journal_users(id),
    FOREIGN KEY (updated_by_user_id) REFERENCES journal_users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS journal_letter_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    letter_id INTEGER NOT NULL,
    changed_by_user_id INTEGER,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (letter_id) REFERENCES journal_letters(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES journal_users(id)
  )`);

  const journalPassword = bcrypt.hashSync('journal123', 10);
  db.run(`INSERT OR IGNORE INTO journal_users (id, login, password_hash, display_name, is_active) VALUES
    (1, 'journal1', ?, 'Журнал 1', 1),
    (2, 'journal2', ?, 'Журнал 2', 1),
    (3, 'journal3', ?, 'Журнал 3', 1)
  `, [journalPassword, journalPassword, journalPassword]);

  console.log('Database schema created successfully!');
  console.log('Default users: journal1, journal2, journal3');
  console.log('Default password: journal123');
});

db.close();
