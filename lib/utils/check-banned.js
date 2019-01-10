'use strict';

var fs = require('fs');

var user_db = require('../models/user');
var ban_db = require('../models/ban');
var get_user_ip = require('./get-user-ip');
var path = require('path');
var config = require('../../config');
var crypto = require('crypto');

var last_posts = {};

/* check_ip_validity:
    - checks if ip is banned
    - checks session validity
    - checks cool down
    calls callback(err) on completion
*/
module.exports = function(req, res, callback) {
    delete require.cache[require.resolve('../../config')];
    var config = require('../../config');

    /* get IP */
    var user_ip = get_user_ip(req);

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    // meant for any bots you'd like to validate with custom cookies
    // 
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    if (req.cookies.password_livechan ==  config.no_limit_cookie) {
        return callback();
    }


    var now = new Date();
    var yesterday = now.getTime() - 1000 * 60 * 60 * 24 * 2;

    ban_db.remove({ban_date:{$lt:yesterday}}, function(e3){
        console.log(e3);
    });

    for(var j=0; j<config.banned_ranges.length; j++){
        if(user_ip.indexOf(config.banned_ranges[j])==0){
            return callback(new Error('ban_violation'));
        }
    }

    ban_db.find({ip: user_ip}, function(e, d) {
        if(d[0] && d[0].ip == user_ip) {
           console.log(d[0], user_ip);
           return callback(new Error('ban_violation'));
        }

        var now = new Date();
        if(!last_posts[user_ip] || last_posts[user_ip]+3000 < now.getTime()) {
            last_posts[user_ip] = now.getTime();
            return callback();
        } else {
            return callback(new Error('countdown_violation'));
        }

    });

    /*ban_db
        .find({
        })
        .exec(function(e, d) {
            for(var i=0; i<d.length; i++){
                banned_ranges.push(d[i].ip);
                //if(user_ip.indexOf(d[i].ip)==0){
                //    return callback(new Error('ban_violation'));
                //}
            }
        })

    for(var i=0; i<banned_ranges.length; i++){
        if(user_ip.indexOf(banned_ranges[i])==0){
            return callback(new Error('ban_violation'));
        }

    }*/



};

