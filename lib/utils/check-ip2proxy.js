'use strict';

var get_user_ip = require('./get-user-ip');
var path = require('path');
var config = require('../../config');
var ip2proxy = require("ip2proxy-nodejs");


var root = path.join(__dirname, '../..');
ip2proxy.Open(path.join(root, 'IP2PROXY-LITE-PX4.BIN'));

module.exports = function(req, res, callback) {
    /* get IP */
    var user_ip = get_user_ip(req);
    if(user_ip=='79.170.112.3' || user_ip=='31.148.96.156') return callback();

    switch(ip2proxy.getProxyType(user_ip)){
        case 'VPN':
        case 'TOR':
        //case 'PUB':
        //case 'DCH':
            console.log('Blocked proxy ', user_ip);
            return callback(new Error('ban_violation'));
        default:
            return callback();

    }

};

