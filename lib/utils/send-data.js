'use strict';

var Socket = require('../socket');
var send_sse = require('./send-sse');

module.exports = function(room, event, data, fields) {
    var fields_array = fields.split(' ');
    var data2 = {};
    for (var key in data) {
        if (fields_array.indexOf(key) > -1) {
            data2[key] = data[key];
        }
    }
    Socket.io.sockets.in(room).emit(event, data2);
    send_sse.send(event, data2);
};