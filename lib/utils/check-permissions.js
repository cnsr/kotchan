'use strict';

//var config = require('../../config');

module.exports = function(req, res, callback) {
    delete require.cache[require.resolve('../../config')];
    var config = require('../../config');

/*
        console.log("req.files = <", req.files, ">");
    if (req.files) {
        console.log("req.files.image = <", req.files.image, ">");
        console.log("req.files.image.size = <", req.files.image.size, ">");
    }
        console.log("req.cookies.password_livechan = <", req.cookies.password_livechan, ">");
*/
    if (config.restrict_image_posting==true) {
        if (req.files &&
            req.files[0] &&
            req.files[0].size > 0 &&
            req.cookies.password_livechan != config.no_limit_cookie) {
            return callback(new Error('oi oi'));
        };
    };

    return callback();

};

