const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('SG.tUkMRtMmReWiFgY7cYEOJA.I4-cmx4JrzSyFV31Rw7K629twkhsUNnV2LlqQZrAvZUz');

function sendEmail(to, subject, text) {
    const msg = {
        to: to,
        from: 'sinkhou89@gmail.com', // 使用您在SendGrid中设置的发件人电子邮件
        subject: subject,
        text: text,
    };

    sgMail.send(msg).then(() => {
        console.log('Email sent successfully');
    }).catch(error => {
        console.error('Error sending email:', error);
    });
}

module.exports = { sendEmail };
