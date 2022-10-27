'use strict';

var fs = require('fs');
var async = require('async');

var express = require('express');
var router = new express.Router();

var config = require('../../config');
var check_ip_validity = require('../utils/check-ip-validity');
var check_banned = require('../utils/check-banned');
var check_ip2proxy = require('../utils/check-ip2proxy');
var populate_post = require('../utils/populate-post');
var rotate_image = require('../utils/rotate-image');
var format_image = require('../utils/format-image');
var generate_thumbnail = require('../utils/generate-thumbnail');
var format_post = require('../utils/format-post');
var format_special = require('../utils/format-special');
//var irc = require('../utils/irc.js');
var add_to_chat = require('../utils/add-to-chat');
var login = require('../utils/login');

var user_db = require('../models/user');
var get_user_ip = require('../utils/get-user-ip');
var crypto = require('crypto');


//&console.log(app);
//const router = app.Router();
console.log("\nhmm??\n");
const app = global.APP;


app.get('/', function (req, res) {
    res.redirect('/chat/home');
});

//router = global.APP;
app.get('/chat/:id([a-z0-9]+)', function (req, res) {

    // Autologin
    /*if(!req.cookies.password_livechan) {
        login(req, res);
    }*/
    // End autologin

    if (config.boards.indexOf(req.params.id) < 0 && req.params.id !== 'home') {
        res.send('Board doesn\'t exist :(');
        return;
    }
    res.sendfile('pages/index.html');
});

/*
router.get('/chat_beta/:id([a-z0-9]+)', function(req, res) {
    if (config.boards.indexOf(req.params.id) < 0 && req.params.id !== 'home') {
        res.send('Board doesn\'t exist :(');
        return;
    }
    res.sendfile('pages/index_beta.html');
});
*/

//const multer = require("multer");

const multer  = require('multer');




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(global.ROOT);
        cb(null, global.ROOT + '/public/tmp/uploads')
    },
    filename: function(req, file, cb) {

        const nameOrig = file.originalname
        const ext = nameOrig.substr(nameOrig.lastIndexOf("."))
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;

        console.log("aaa");

        cb(null, uniqueSuffix);
    }
});

//const upload = multer({ dest: 'public/tmp/uploads' });
const upload = multer({ storage: storage });

app.post('/chat/:id([a-z0-9]+)', upload.array("image", "recording"), function (req, res, next) {
    res.type('text/plain');


    /* to be stored in db and passed to clients */
    var data = {};

    async.series([
        function (callback) {
            if (req.params.id !== "all" && config.boards.indexOf(req.params.id) < 0) {
                return callback(new Error('This board does not exist.'));
            } else {
                switch (req.params.id) {
                    case "int":
                    case "lor":
                    case "pl":
                        data.special = "country";
                        return callback();
                    default:
                        data.special = "country";
                        return callback();
                }
            }

        },
        //check_ip2proxy.bind(null, req, res),
        check_banned.bind(null, req, res),
        //check_ip_validity.bind(null, req, res),
        populate_post.bind(null, req, data),
        rotate_image.bind(null, data),
        format_image.bind(null, data),
        generate_thumbnail.bind(null, data),
        format_post.bind(null, data),
        format_special.bind(null, req, data),
        (function (data, callback) {
            if (data.chat != 'General' && data.chat != '') {
                return callback();
            }
            var chat = {};
            chat.name = data.trip ? data.name + data.trip : data.name;
            chat.name = chat.name ? chat.name : 'Kot';
            chat.name = chat.name.replace(/!/g, '#');
            chat.name = chat.name.replace(/\ /g, '_');
            chat.body = data.body.replace(/\n/g, ' ');
            chat.body = chat.body.replace(/\r/g, ' ');
            chat.body = chat.body.replace(/\t/g, ' ');
            if (data.image) {
                var base_name = data.image.match(/[\w\-\.]*$/)[0];
                var extension = base_name.match(/\w*$/)[0];
                var url_file = 'https://livechan.net/tmp/uploads/' + base_name;
                chat.body = url_file + ' ' + chat.body;
            }
            console.log(chat.name, chat.body);
            /*if (chat.name && chat.body) {
              irc.send(data.chat, chat.name, chat.body);
              return callback();
            }*/
            return callback();
        }).bind(null, data),
        add_to_chat.bind(null, data),
    ], function (err) {
        console.log("noniin?");
        if (err) {
            res.json({
                failure: err.message
            });
            /* delete file */
            if (req.files && req.files.image && req.files.image.path) {
                fs.unlink(req.files.image.path, function (e) {
                    if (e) console.log('error deleting image', e);
                });
            }
            /* delete thumbnail */
            if (data.thumb) fs.unlink(data.thumb, function (e) {
                if (e) console.log('error deleting thumbnail', e);
            });
            return;
        }

        /* give the client information about the post */
        res.json({
            success: 'success_posting',
            id: data.count
        });

        next();
    });
});

app.get('/draw', function (req, res, next) {
    res.sendfile('pages/draw.html');
});

app.get('/draw/:id([a-z0-9]+)', function (req, res, next) {
    res.sendfile('pages/draw.html');
});

app.get('/:id([a-z0-9]+)', function (req, res) {
    res.redirect('/chat/' + req.params.id);
});
