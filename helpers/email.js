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

// Note: we could use OOP to make less code 
// (here we are using sendgrid (SMTP relay) with nodemailer instead of gmail)
// module.exports = class Email {
//     constructor(user, url) {
//       this.to = user.email;
//       this.firstName = user.name.split(' ')[0];
//       this.url = url;
//       this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
//     }
  
//     newTransport() {
//       if (process.env.NODE_ENV === 'production') {
//         // Sendgrid
//         return nodemailer.createTransport({
//           service: 'SendGrid',
//           auth: {
//             user: process.env.SENDGRID_USERNAME,
//             pass: process.env.SENDGRID_PASSWORD
//           }
//         });
//       }
  
//       return nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//           user: process.env.EMAIL_USERNAME,
//           pass: process.env.EMAIL_PASSWORD
//         }
//       });
//     }
  
//     // Send the actual email
//     async send(template, subject) {
//       // 1) Render HTML based on a pug template
//       const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
//         firstName: this.firstName,
//         url: this.url,
//         subject
//       });
  
//       // 2) Define email options
//       const mailOptions = {
//         from: this.from,
//         to: this.to,
//         subject,
//         html,
//         text: htmlToText.fromString(html)
//       };
  
//       // 3) Create a transport and send email
//       await this.newTransport().sendMail(mailOptions);
//     }
  
//     async sendWelcome() {
//       await this.send('welcome', 'Welcome to the Natours Family!');
//     }
  
//     async sendPasswordReset() {
//       await this.send(
//         'passwordReset',
//         'Your password reset token (valid for only 10 minutes)'
//       );
//     }
//   };