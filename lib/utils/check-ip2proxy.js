'use strict';

var get_user_ip = require('./get-user-ip');
var path = require('path');
var config = require('../../config');
var ip2proxy = require("ip2proxy-nodejs");


var root = path.join(__dirname, '../..');
ip2proxy.Open(path.join(root, 'IP2PROXY-LITE-PX4.BIN'));

module.exports = function(req, res, callback) {

    delete require.cache[require.resolve('../../config')];
    delete require.cache[require.resolve(path.join(root, 'tor_nodes_ips_list.json'))];
    var config = require('../../config');
    var tor_ips_list = require(path.join(root, 'tor_nodes_ips_list.json'));

    if (req.cookies.password_livechan == config.no_limit_cookie) {
        return callback();
    }
    /* get IP */
    var user_ip = get_user_ip(req);
    if(config.block_exceptions.indexOf(user_ip) > -1) return callback();

    if(config.block_proxies.indexOf('TOR') > -1 && tor_ips_list.indexOf(user_ip) > -1) {
        console.log('Blocked tor proxy ', user_ip);
        return callback(new Error('proxy'));
    }

    if(config.block_proxies.indexOf(ip2proxy.getProxyType(user_ip)) > -1) {
        console.log('Blocked proxy ', user_ip);
        return callback(new Error('proxy'));
    }


    return callback();

};

