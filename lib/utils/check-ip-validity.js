'use strict';

var fs = require('fs');

var user_db = require('../models/user');
var ban_db = require('../models/ban');
var get_user_ip = require('./get-user-ip');
var path = require('path');
var config = require('../../config');
var crypto = require('crypto');
var login = require('../utils/login');

var banned_ranges = [];

/* check_ip_validity:
    - checks if ip is banned
    - checks session validity
    - checks cool down
    calls callback(err) on completion
*/
module.exports = function(req, res, callback) {
    /* get IP */
    var user_ip = get_user_ip(req);

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    // meant for any bots you'd like to validate with custom cookies
    // 
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    if (req.cookies.password_livechan == config.no_limit_cookie) {
        return callback();
    }

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
    /* lookup IP */

    user_db
        .find({
            ip: user_ip
        })
        .sort({
            last_post: -1
        })
        .exec(function(e, d) {
            /*if(!d[0]) {
                login(res, req);
                return ;
            }*/
            for(var i=0; i<d.length; i++){
                for(var j=0; j<config.banned_ranges.length; j++){
                    if(d[i].ip.indexOf(config.banned_ranges[j])==0){
                        return callback(new Error('ban_violation'));
                    }
                }
                if (d[i].banned_rooms.indexOf(req.params.id) > -1) {
			        return callback(new Error('ban_violation'));
                }
            }

            if (e || !d[0] || (req.cookies.password_livechan !== d[0].session_key)) {
                return callback(new Error('session_expiry'));
            } else if ((d[0].last_post.getTime() + 3000) > (new Date()).getTime()) {
                var now = new Date();
                user_db.update,({
                        _id: d[0]._id
                    }, {
                        $set: {
                            last_post: now.setTime(now.getTime() + 10000)
                        }
                    },
                    function(err) {
                        if (err) return callback(new Error('database_error'));
                        return callback(new Error('countdown_violation'));
                    }
                );
                return callback();
            } else if ((d[0].banned_rooms.indexOf(req.params.id) > -1) ||
                (d[1] && d[1].banned_rooms && d[1].banned_rooms.indexOf(req.params.id) > -1)) {
                return callback(new Error('ban_violation'));
            } else {
                var now = new Date();
                user_db.update,({
                        _id: d[0]._id
                    }, {
                        $set: {
                            last_post: now
                        }
                    },
                    function(err) {
                        if (err) return callback(new Error('database_error'));
                        return callback();
                    }
                );
                return callback();
            }
        });
};

