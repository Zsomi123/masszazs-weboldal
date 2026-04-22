// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

/**
 * Profi email küldő függvény
 * @param {string} toEmail - A vendég email címe
 * @param {string} customerName - A vendég neve
 * @param {string} date - Formázott dátum (pl. 2024. május 12. 14:30)
 * @param {string} serviceName - A masszázs típusa
 * @param {number|string} appointmentId - A foglalás egyedi azonosítója a lemondáshoz
 */
const sendEmail = async (toEmail, customerName, date, serviceName, appointmentId) => {
    try {
        // Transporter beállítása - környezeti változókból dolgozunk
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, 
            auth: {
                user: 'info.emimassage@gmail.com', // Fixen beírva
                pass: 'tkiu kmft czof xpsn'        // Fixen beírva
            },
            tls: {
                rejectUnauthorized: false 
            }
        });

        // Lemondási link generálása
        // Élesítéskor a BASE_URL majd pl. https://emimassage.hu lesz
        const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
        const cancellationLink = `${baseUrl}/cancel-appointment/${appointmentId}`;

        const mailOptions = {
            from: `"Emi Massage" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Visszaigazolás: Időpontfoglalásod sikeres! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #2c3e50; line-height: 1.6; }
                        .header { background-color: #E67E22; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .header h1 { color: white; margin: 0; font-size: 24px; }
                        .content { padding: 30px; border: 1px solid #f0f0f0; border-top: none; background-color: #ffffff; }
                        .details-box { background-color: #f9f9f9; border-left: 4px solid #E67E22; padding: 20px; margin: 20px 0; }
                        .details-item { margin-bottom: 10px; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #7f8c8d; }
                        .btn-cancel { color: #e74c3c; text-decoration: underline; font-weight: bold; }
                        .social-text { margin-top: 15px; font-style: italic; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Sikeres Időpontfoglalás</h1>
                        </div>
                        <div class="content">
                            <p>Kedves <strong>${customerName}</strong>!</p>
                            <p>Örömmel értesítünk, hogy a foglalásod rögzítésre került. Várunk szeretettel a megadott időpontban!</p>
                            
                            <div class="details-box">
                                <div class="details-item"><strong>💆‍♀️ Szolgáltatás:</strong> ${serviceName}</div>
                                <div class="details-item"><strong>📅 Időpont:</strong> ${date}</div>
                                <div class="details-item"><strong>📍 Helyszín:</strong> 1111 Budapest, Masszázs utca 5.</div>
                            </div>
                            
                            <p>Kérjük, érkezz 5 perccel hamarabb, hogy legyen időd hangolódni a kezelésre.</p>
                            
                            <p class="social-text">Ha bármi kérdésed van, keress minket bizalommal!</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 Emi Massage. Minden jog fenntartva.</p>
                            <p>Szeretnél változtatni? <a href="${cancellationLink}" class="btn-cancel">Kattints ide az időpont lemondásához</a>.</p>
                            <p><i>Figyelem: A lemondás az időpont előtt legkésőbb 24 órával lehetséges díjmentesen.</i></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Visszaigazoló email elküldve: ${toEmail}`);
        
    } catch (error) {
        console.error("❌ Hiba az email küldésekor:", error);
    }
};

module.exports = sendEmail;