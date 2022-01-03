const Joi = require('joi');
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');

var utility = {};
utility.randomString = (length) => {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}


utility.generateToken = (length) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(length, function (err, buf) {
            if (err) {
                reject(err);
            } else {
                resolve(buf.toString('hex'))
            }


        });
    })

}

utility.fileupload = (files) => {
    return new Promise(async (resolve, reject) => {
        let name = await utility.randomString(5);
        var currentPath = process.cwd();
        var file_path = path.join(currentPath, '/public/images');

        var filedata = files.image.mv(file_path + '/' + name + files.image.name, (error, data) => {
            if (error) {
                reject(null);
            } else {
                resolve(name + files.image.name);
            }
        })

    })

}

utility.uploadBase64Image = (imgBase64) => {

    return new Promise(async (resolve, reject) => {
        let name = await utility.randomString(12);
        let mimeType = imgBase64.match(/[^:/]\w+(?=;|,)/)[0];
        let filename = 'img_' + name + '.' + mimeType;
        var currentPath = process.cwd();
        var file_path = path.join(currentPath, '/public/images');


        // Remove header
        let base64Image = imgBase64.split(';base64,').pop();

        fs.writeFile(file_path + "/" + filename, base64Image, 'base64', function (err) {
            if (err) {
                reject(filename);
            }
        });
        resolve(filename);

    })

}


module.exports = utility;
