const nodemailer = require("nodemailer")
require('dotenv').config()


const sendEmail = async (email, subject, text) => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure : true,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
        }
      });
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
     
 
      const kirim = await transporter.sendMail({
        from: 'no-reply@smkmadinatulquran.sch.id',
        to: email,
        subject: subject,
        text: text,
      });

      console.log('ee', kirim)
      
    } catch (error) {
     
     
      console.log(error);
      return "email tidak terkirim"
    }
  };
  
  module.exports = sendEmail;

