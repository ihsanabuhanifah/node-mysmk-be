const nodemailer = require("nodemailer");
require("dotenv").config();
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

const sendEmail = async (email, subject, template, context) => {

   
  try {
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./mail/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./mail/"),
    };

    // Pakai EMAIL_* (mis. Gmail untuk testing) bila diisi, selain itu MAIL_* (server sekolah)
    const useEmailEnv = Boolean(
      process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD
    );
    const smtp = useEmailEnv
      ? {
          service: process.env.EMAIL_SERVICE || undefined,
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT || 465),
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
          from: `"MySMK" <${process.env.EMAIL_USERNAME}>`,
        }
      : {
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT || 465),
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          from: '"MySMK" <mysmk-no-reply@smkmadinatulquran.sch.id>',
        };

    const transporter = nodemailer.createTransport({
      service: smtp.service,
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
    transporter.use("compile", hbs(handlebarOptions));
    await transporter.sendMail({
      from: smtp.from,
      to: email,
      subject: subject,
      template: template,
      context: context,
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

module.exports = sendEmail;



// const nodemailer = require("nodemailer")
// require('dotenv').config()


// const sendEmail = async (email, subject, text) => {
//     try {
//       const transporter = nodemailer.createTransport({
//         host: process.env.MAIL_HOST,
//         port: process.env.MAIL_PORT,
//         secure : true,
//         auth: {
//           user: process.env.MAIL_USERNAME,
//           pass: process.env.MAIL_PASSWORD
//         }
//       });
//       transporter.verify(function (error, success) {
//         if (error) {
//           console.log(error);
//         } else {
//           console.log("Server is ready to take our messages");
//         }
//       });
     
 
//       const kirim = await transporter.sendMail({
//         from: 'no-reply@smkmadinatulquran.sch.id',
//         to: email,
//         subject: subject,
//         text: text,
//       });

//       console.log('ee', kirim)
      
//     } catch (error) {
     
     
//       console.log(error);
//       return "email tidak terkirim"
//     }
//   };
  
//   module.exports = sendEmail;
