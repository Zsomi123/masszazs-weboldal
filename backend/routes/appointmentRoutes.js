// backend/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// --- VENDÉG ÚTVONALAK ---
router.post('/', appointmentController.createAppointment);
router.get('/:date', appointmentController.getDailyAppointments);

// --- ADMIN ÚTVONALAK (FOGLALÁSOK) ---
router.get('/admin/all', appointmentController.getAllAppointments);
router.get('/admin/range', appointmentController.getAppointmentsRange);
router.put('/admin/:id', appointmentController.updateAppointment);
router.delete('/admin/:id', appointmentController.deleteAppointment);

// --- ADMIN ÚTVONALAK (BLOKKOLÁSOK) ---
router.get('/admin/blocks/range', appointmentController.getBlocksRange);
router.post('/admin/blocks', appointmentController.createBlock);
router.delete('/admin/blocks/:id', appointmentController.deleteBlock);
// Publikus lemondási útvonal (figyelj, hogy a router.delete vagy app.delete-et használod)
router.delete('/cancel/:id', appointmentController.cancelAppointmentPublic);

module.exports = router;