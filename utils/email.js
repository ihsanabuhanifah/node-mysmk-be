const nodemailer = require("nodemailer")
require('dotenv').config()


const sendEmail = async (email, subject, text) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "116b44e4fce785",
          pass: "0a66404e26ca61"
        }
      });
 
      await transporter.sendMail({
        from: process.env.MAIL_FROM_NAME,
        to: email,
        subject: subject,
        text: text,
      });
      return "email sent sucessfully"
    } catch (error) {
     
     
      console.log(error);
      return "email not sent"
    }
  };
  
  module.exports = sendEmail;

