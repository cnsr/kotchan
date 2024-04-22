'use strict';

var crypto = require('crypto');

var express = require('express');

var config = require('../../config');
var user_db = require('../models/user');
var get_user_ip = require('../utils/get-user-ip');


var loginGet = function(req, res) {
    res.send('<html><head><meta name="viewport" content="width=device-width,user-scalable=no"><link type="text/css" rel="stylesheet" href="style.css"></head><body><div class="center container"><div>Please prove you aren\'t a robot</div><br/><img src="/captcha.jpg"/><form id="loginform" action="/login" method="post"><br/><input type="text" name="digits"/><input type="hidden" name="page" value="' + req.query.page + '"/></form></div></body></html>');
}

var loginPost = function (req, res) {
    // res.type('text/plain');
    var user_ip = get_user_ip(req)

    var secure_text = crypto.createHash('sha1')
                      .update(req.body.digits + config.securetrip_salt)
                      .digest('base64')
                      .toString();

    var comparison = crypto.createHash('sha1')
                    .update(req.session.captcha + config.securetrip_salt)
                    .digest('base64')
                    .toString();

    if (!req.body.digits.length) {
        return res.json({})
    }

    console.log('cptch:', req.session.captcha)

    user_db.find({captcha: req.session.captcha}).exec(function(e,d) {
        if (d.length > 0 && 0) {
            return res.json({
                failure: 'Captcha, nigger.'
            })
        } else {
            if (secure_text === comparison) {
                var key = (Math.random() * 1e17).toString(36);
                // console.log('headers:', req.headers)
                var info = req.header('user-agent') + user_ip + key
                var password = crypto.createHash('sha1')
                               .update(info)
                               .digest('base64')
                               .toString()

                try {
                    res.cookie('password_livechan', password, {
                        maxAge: 2592000000,
                        httpOnly: false
                    })

                    var now = new Date()

                    var data = {
                        session_key: password,
                        captcha: req.session.captcha,
                        ip: user_ip,
                        last_post: now.setTime(now.getTime() - 6000)
                    }

                    new user_db(data).save(function (e) {
                        console.log('post-save')
                        if (e) console.log(e);
                        /*user_db.find().exec(function (e, d) {
                            console.log("session found", e, d);
                        });*/
                    });

                    return res.json({
                        success: 'captcha'
                    })
                } catch (e) {
                    console.log('EEE', e)
                    try {
                        res.json({
                            failure: 'kys maybe?'
                        }) 
                    } catch (err) {
                        console.log('fk off', err)
                    }
                }
            }

            if (req.body.page) {
                return res.send('Learn to type, nigger!');
            } else {
                return res.json({
                    failure: 'Learn to type, nigger!'
                })
            }
        }
    });
}

module.exports = {
    loginPost,
    loginGet,
};
