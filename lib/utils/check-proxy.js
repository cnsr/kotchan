'use strict';

var get_user_ip = require('./get-user-ip');
var path = require('path');
var config = require('../../config');
var request = require('request');

var root = path.join(__dirname, '../..');

module.exports = function(req, res, callback) {
    /* get IP */
    var user_ip = get_user_ip(req);
    if(user_ip=='79.170.112.3' || user_ip=='31.148.96.156') return callback();

  request({
    uri: 'https://map.kotchan.org/check-proxy',
    method: 'GET',
    qs: {
      ip: user_ip
    },
    json: true},
    function(error, response, body) {
        if(error) return callback();
        if(!body['proxy_type'] || body['proxy_type'] == '-') return callback();
        else return callback(new Error('ban_violation'));
    }
  );

};

