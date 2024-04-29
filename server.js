const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sendEmail } = require('./emailservice');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/send-reminder-email', (req, res) => {
    const { to, subject, text, date, time } = req.body; // 前端需要提供完整的日期和时间

    // 将日期和时间组合成JavaScript Date对象
    const scheduledDate = new Date(`${date}T${time}`);

    // 计算延迟时间
    const delay = scheduledDate.getTime() - Date.now();

    if (delay > 0) {
        setTimeout(() => {
            sendEmail(to, subject, text)
                .then(() => console.log('Email sent successfully'))
                .catch(error => console.error('Failed to send email:', error));
        }, delay);

        res.status(200).send(`Email scheduled to be sent at ${scheduledDate}`);
    } else {
        res.status(400).send('Scheduled time must be in the future.');
    }
});

const PORT = process.env.PORT || 15000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
