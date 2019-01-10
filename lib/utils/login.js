
var get_user_ip = require('./get-user-ip');
var user_db = require('../models/user');
var crypto = require('crypto');

module.exports = function(req, res) {
        var user_ip = get_user_ip(req);
        var key = (Math.random() * 1e17).toString(36);
        var info = req.headers['user-agent'] + user_ip + key;
        var password = crypto.createHash('sha1')
                       .update(info)
                       .digest('base64')
                       .toString();
        res.cookie('password_livechan', password, {
            maxAge: 2592000000,
            httpOnly: false
        });

        var now = new Date();
        var data = {
            session_key: password,
            captcha: req.session.captcha,
            ip: user_ip,
            last_post: now.setTime(now.getTime() - 6000)
        };
        new user_db(data).save(function () {
            /*user_db.find().exec(function (e, d) {
                console.log("session found", e, d);
            });*/
        });
}

