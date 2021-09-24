const nodemailer = require('nodemailer');


const sendEmail = async options => {
    // (1) Create a transporter
    const transport = nodemailer.createTransport({
        service: process.env.EMAIL_HOST,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // If i used gmail as a service:
        // now in my real gmail account, I need to active "less secure app" option
        // But, we aren't going to use gmail, as after sending many mail, we got
        // marked as spammers and voila, we lost our forgot funcitonality,
        // So, we need a service offer us some features during our development
        // so we can open the mails and so the content and so on, So, go for mailtrap.io
    });
    // (2) Define the email options
    const mailOptions = {
        from: 'Ahmed Elgaidi <ahmedelgaidi@ahmedelgaidi.com',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // (3) Send the email with nodemailer
   await transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        return console.log(`Email sent: ${info.response}`);
    });
};


module.exports = sendEmail;