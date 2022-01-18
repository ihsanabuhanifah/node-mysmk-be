const nodemailer = require("nodemailer")
require('dotenv').config()


const sendEmail = async (email, subject, text) => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        
        auth: {
          user: process.env.MAIL_USERMAME,
          pass: process.env.MAIL_PASSWORD
        }
      });
 
      await transporter.sendMail({
        from: 'no-reply@smkmadinatulquran.sch.id',
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

