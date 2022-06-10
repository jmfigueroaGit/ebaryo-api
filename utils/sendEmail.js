const nodemailer = require('nodemailer');

const sendEmail = (options) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        }
    });

    // const message = {
    //     from: `${process.env.SMTP_FROM_NAME} < ${process.env.SMTP_FROM_EMAIL}>`,
    //     to: options.email,
    //     subject: options.subject,
    //     text: options.message,
    // };

    const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} < ${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email, // the user email
        subject: options.subject,
        html: `<h4>Verify your email account</h4> 
        <p>https://ebaryo.vercel.app/auth/change-password/${options.message}</p>`
                         
     };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });

    // await transporter.sendMail(message, function(error, info){
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log('Email sent: ' + info.response);
    //     }
    // });
};

module.exports = sendEmail
