'use strict';

var mongoose = require('mongoose');

var config = require('../../config');

var ban_schema = new mongoose.Schema({
    ip: String,
    ban_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ban_db', ban_schema);
