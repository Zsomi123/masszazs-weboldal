// backend/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'emi_massage' 
});

db.connect((err) => {
    if (err) {
        console.error('Hiba az adatbázis csatlakozásakor:', err);
        return;
    }
    console.log('Sikeresen csatlakozva a MySQL adatbázishoz!');
});

// Ezzel tesszük elérhetővé a 'db' változót más fájlok számára:
module.exports = db;