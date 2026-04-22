// backend/controllers/appointmentController.js
const db = require('../config/db');
const sendEmail = require('../utils/sendEmail'); // ÚJ: Email segédfüggvény

// --- FOGLALÁSOK (VENDÉG ÉS ADMIN) ---

// Új foglalás (Okos ütközésvizsgálattal)
// Új foglalás (Okos ütközésvizsgálattal + EMAIL)
exports.createAppointment = (req, res) => { 
    console.log("Beérkező adatok a szerverre:", req.body);
    
    // Át vesszük az adatokat, és ha valami hiányzik, adunk neki egy alapértéket
    const { 
        service_id, 
        customer_name, 
        customer_phone, 
        start_time, 
        source = 'online', 
        send_email 
    } = req.body;

    // BIZTONSÁGI JAVÍTÁS: Ha az email üres vagy nincs megadva, legyen NULL az adatbázis számára
    const customer_email = req.body.customer_email && req.body.customer_email.trim() !== "" 
        ? req.body.customer_email 
        : null;

    // ... innentől a kód többi része ugyanaz (ütközésvizsgálat, stb.) ...

    // Amikor elérsz az INSERT-hez:
    const insertSql = `
        INSERT INTO appointments (service_id, customer_name, customer_email, customer_phone, start_time, end_time, source) 
        VALUES (?, ?, ?, ?, ?, DATE_ADD(?, INTERVAL ? MINUTE), ?)
    `;

    // A mentés így már le fog futni akkor is, ha a customer_email értéke null
    db.query(insertSql, [service_id, customer_name, customer_email, customer_phone, start_time, start_time, durationInMinutes, source], async (err, result) => {
        if (err) return res.status(500).json({ message: "Szerver hiba a mentéskor.", error: err.message });

        // CSAK AKKOR KÜLDÜNK EMAILT, ha:
        // 1. Van kitöltve email cím
        // 2. ÉS (Vagy online foglalásról van szó, VAGY az admin bepipálta a küldést)
        if (customer_email && (source === 'online' || send_email)) {
            try {
                const formattedDate = new Date(start_time).toLocaleString('hu-HU', { 
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                });
                const serviceName = serviceResults[0]?.name || "Masszázs";
                
                await sendEmail(customer_email, customer_name, formattedDate, serviceName, result.insertId);
            } catch (emailErr) {
                console.error("Email küldési hiba, de a foglalás mentve:", emailErr);
            }
        }

        res.json({ message: "Sikeres foglalás!" });
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