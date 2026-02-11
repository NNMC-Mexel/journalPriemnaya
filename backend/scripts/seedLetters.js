const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

async function main() {
  try {
    const users = await dbAll(
      `SELECT id, COALESCE(display_name, login) as name
       FROM journal_users
       WHERE is_active = 1
       ORDER BY id ASC
       LIMIT 3`
    );

    if (users.length < 3) {
      throw new Error('Нужно минимум 3 активных пользователя journal_users');
    }

    const last = await dbAll(
      `SELECT letter_number FROM journal_letters ORDER BY id DESC LIMIT 1`
    );
    let nextNumber = 1;
    if (last.length > 0) {
      const parsed = parseInt(String(last[0].letter_number).replace(/\D/g, ''), 10);
      if (!Number.isNaN(parsed)) nextNumber = parsed + 1;
    }

    const today = new Date().toISOString().slice(0, 10);
    let created = 0;

    for (const user of users) {
      for (let i = 0; i < 30; i += 1) {
        const num = String(nextNumber).padStart(4, '0');
        await dbRun(
          `INSERT INTO journal_letters
           (letter_number, fio, direction, arrival_date, send_date, subject, content, created_by_user_id, updated_by_user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            num,
            `Пациент ${num}`,
            i % 2 === 0 ? 'incoming' : 'outgoing',
            today,
            i % 2 === 0 ? null : today,
            `Тема письма ${num}`,
            `Тестовое содержание письма № ${num}`,
            user.id,
            user.id
          ]
        );
        nextNumber += 1;
        created += 1;
      }
    }

    console.log(`Создано писем: ${created}`);
  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    db.close();
  }
}

main();
