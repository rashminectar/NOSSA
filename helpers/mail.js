const Joi = require('joi');
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');
const db = require("../models");
const settings = db.settings;
const mailer = require('../lib/mailer');

var mail = {};

mail.sendWelcomeMail = async (objMail) => {
    try {
        return new Promise(async (resolve, reject) => {
            let mailOptions = {
                from: process.env.MAIL_FROM,
                to: objMail.email,
                subject: 'WELCOME MAIL FROM NOSSA',
                text: 'Nossa welcomes you',
                html: '<h1>Welcome to NOSSA<h1><br/> Here is your credentials for login: <br/><b>Username: ' + objMail.userName + '<b/><br/><b>Password: ' + objMail.password + '<b/>'
            }
            let response = await mailer.sendEmail(mailOptions);
            resolve(response);
        })
    } catch (error) {
        reject(error);
    }
}

module.exports = mail;
