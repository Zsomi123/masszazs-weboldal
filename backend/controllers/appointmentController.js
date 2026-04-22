// backend/controllers/appointmentController.js
const db = require('../config/db');

// --- FOGLALÁSOK (VENDÉG ÉS ADMIN) ---

// Új foglalás (Okos ütközésvizsgálattal)
exports.createAppointment = (req, res) => { 
    const { service_id, customer_name, customer_phone, start_time, source = 'online' } = req.body;

    // Hétvége ellenőrzése
    const dateObj = new Date(start_time);
    const dayOfWeek = dateObj.getDay(); // 0 a Vasárnap, 6 a Szombat
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.status(400).json({ message: "Sajnos hétvégén zárva vagyunk! Kérjük, válassz hétköznapi időpontot." });
    }

    db.query('SELECT duration FROM services WHERE id = ?', [service_id], (err, serviceResults) => {
        if (err || serviceResults.length === 0) {
            return res.status(500).json({ message: "Hiba a szolgáltatás lekérésekor." });
        }

        const durationInMinutes = serviceResults[0].duration;

        // Ütközésvizsgálat: Kihúzott sávok (Blocks)
        const blockCheckSql = `
            SELECT * FROM blocks 
            WHERE start_time < DATE_ADD(?, INTERVAL ? MINUTE) 
            AND end_time > ?
        `;
        
        db.query(blockCheckSql, [start_time, durationInMinutes, start_time], (err, blockResults) => {
            if (err) return res.status(500).json({ message: "Adatbázis hiba a blokkolások ellenőrzésekor." });
            if (blockResults.length > 0) return res.status(400).json({ message: "Ezt az időpontot a szalon fenntartotta, kérjük válassz másikat!" });

            // Ütközésvizsgálat: Másik vendég
            const apptCheckSql = `
                SELECT appointments.*, services.duration 
                FROM appointments 
                JOIN services ON appointments.service_id = services.id
                WHERE appointments.start_time < DATE_ADD(?, INTERVAL ? MINUTE)
                AND DATE_ADD(appointments.start_time, INTERVAL services.duration MINUTE) > ?
            `;
            
            db.query(apptCheckSql, [start_time, durationInMinutes, start_time], (err, apptResults) => {
                if (err) return res.status(500).json({ message: "Adatbázis hiba az ütközések ellenőrzésekor." });
                if (apptResults.length > 0) return res.status(400).json({ message: "Ez az időpont sajnos már foglalt!" });

                // Mentés
                const insertSql = `
                    INSERT INTO appointments (service_id, customer_name, customer_phone, start_time, end_time, source) 
                    VALUES (?, ?, ?, ?, DATE_ADD(?, INTERVAL ? MINUTE), ?)
                `;

                db.query(insertSql, [service_id, customer_name, customer_phone, start_time, start_time, durationInMinutes, source], (err, result) => {
                    if (err) return res.status(500).json({ message: "Nem sikerült elmenteni a foglalást.", error: err.message });
                    res.json({ message: "Sikeres foglalás!" });
                });
            });
        });
    });
};

// Publikus: Napi foglalt és blokkolt időpontok a naptárhoz
exports.getDailyAppointments = (req, res) => {
    const searchDate = req.params.date;
    const query = `
        SELECT start_time, end_time FROM appointments WHERE DATE(start_time) = ?
        UNION
        SELECT start_time, end_time FROM blocks WHERE DATE(start_time) = ?
    `;

    db.query(query, [searchDate, searchDate], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// Admin: Minden foglalás listája
exports.getAllAppointments = (req, res) => {
    const query = `
        SELECT appointments.id, appointments.customer_name, appointments.customer_phone, appointments.start_time, services.name AS service_name, services.price
        FROM appointments
        JOIN services ON appointments.service_id = services.id
        ORDER BY appointments.start_time ASC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// Admin: Foglalások adott időszakra (Heti naptár)
exports.getAppointmentsRange = (req, res) => {
    const { start, end } = req.query; 
    const query = `
        SELECT appointments.*, services.name AS service_name, services.duration 
        FROM appointments 
        JOIN services ON appointments.service_id = services.id 
        WHERE start_time >= ? AND start_time <= ?
    `;
    db.query(query, [start, end], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// Admin: Foglalás törlése
exports.deleteAppointment = (req, res) => {
    db.query("DELETE FROM appointments WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Foglalás sikeresen törölve!" });
    });
};

// Admin: Foglalás szerkesztése
exports.updateAppointment = (req, res) => {
    const { customer_name, customer_phone } = req.body;
    db.query("UPDATE appointments SET customer_name = ?, customer_phone = ? WHERE id = ?", [customer_name, customer_phone, req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Sikeresen frissítve!" });
    });
};

// --- BLOKKOLÁSOK (KIHÚZÁSOK) ADMIN SZÁMÁRA ---

// Admin: Blokkolások letöltése heti nézethez
exports.getBlocksRange = (req, res) => {
    const { start, end } = req.query;
    const sql = "SELECT * FROM blocks WHERE start_time >= ? AND end_time <= ?";
    const startDate = start + 'T00:00:00';
    const endDate = end + 'T23:59:59';

    db.query(sql, [startDate, endDate], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Admin: Új blokk létrehozása
exports.createBlock = (req, res) => {
    const { start_time, end_time } = req.body;
    db.query("INSERT INTO blocks (start_time, end_time) VALUES (?, ?)", [start_time, end_time], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Adatbázis hiba történt." });
        res.json({ success: true, id: result.insertId, message: "Sikeres mentés" });
    });
};

// Admin: Blokk törlése
exports.deleteBlock = (req, res) => {
    db.query("DELETE FROM blocks WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Adatbázis hiba történt." });
        res.json({ success: true, message: "Kihúzás sikeresen törölve!" });
    });
};