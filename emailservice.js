const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

function sendEmail(to, subject, text) {
    const msg = {
        to: to,
        from: 'sinkhou89@gmail.com',
        subject: subject,
        text: text,
    };

    return sgMail.send(msg).then(() => {
        console.log('Email sent successfully');
    }).catch(error => {
        console.error('Error sending email:', error);
        throw error;
    });
}

module.exports = { sendEmail };
