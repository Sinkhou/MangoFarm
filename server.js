const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sendEmail } = require('./emailservice');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 测试路由
app.get('/test-email', (req, res) => {
    sendEmail('test@example.com', 'Test Subject', 'This is a test email.')
        .then(() => res.send('Test email sent successfully'))
        .catch(error => res.status(500).send('Failed to send test email: ' + error.message));
});

app.post('/send-reminder-email', (req, res) => {
    const { to, subject, text, date, time } = req.body;

    if (!to || !subject || !text || !date || !time) {
        return res.status(400).send('All fields are required.');
    }

    const scheduledDate = new Date(`${date}T${time}`);
    const delay = scheduledDate.getTime() - Date.now();

    if (delay > 0) {
        setTimeout(() => {
            sendEmail(to, subject, text)
                .then(() => {
                    console.log('Email sent successfully');
                })
                .catch(error => {
                    console.error('Failed to send email:', error);
                });
        }, delay);

        res.status(200).send(`Email scheduled to be sent at ${scheduledDate}`);
    } else {
        res.status(400).send('Scheduled time must be in the future.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
