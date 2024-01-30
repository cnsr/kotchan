'use strict';

var mongoose = require('mongoose');

var config = require('../../config');

var silence_schema = new mongoose.Schema({
    id: String,
    ip: String,
    silence_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('silence_db', silence_schema);
