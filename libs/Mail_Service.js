const nodemailer = require('nodemailer');

let cc;
try {
  cc = require('../.config.js');
} catch (e) {
  cc = require('../.config.js.example');
}
let mailConfig = cc.mailConfig;
let trans = nodemailer.createTransport(cc.mailConfig);
module.exports = function (receiver, senderName, mailSubject, mailContent) {
  let options = {
    from: '"' + senderName + '" <'+ cc.mailConfig.auth.user +'>',
    to: receiver,
    subject: mailSubject,
    html: mailContent
  };
  return new Promise((resolve, reject) => {
    trans.sendMail(options, (err, info) => {
      if (err) reject(err);
      else resolve(info);
    })
  })
};