'use strict';
/*
    LiveChan is a live imageboard web application.
    Copyright (C) 2014 LiveChan Team

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var fs = require('fs');
var http = require('http');
var https = require('https');
var format = require('util').format;
var path = require('path');

var express = require('express');
var logfmt = require('logfmt');
var mongoose = require('mongoose');
var socketio = require('socket.io');
var tripcode = require('tripcode');

var config = require('../config');
var Socket = require('./socket');
var socket_stream = require('socket.io-stream');
var chat_db = require('./models/chat');
var user_db = require('./models/user');

var root = path.join(__dirname, '..');
var salt_file = path.join(root, config.salt_file);
var ca_file = path.join(root, config.ssl.ca);
var key_file = path.join(root, config.ssl.key);
var cert_file = path.join(root, config.ssl.cert);

global.ROOT = root;

/* read secure tripcode salt */
fs.readFile(salt_file, 'utf8', function(err, data) {
    if (!err) {
        config.securetrip_salt = data;
    }
});

/* initialize app */
var app = express();
global.APP = app;
var port = process.env.PORT || 5080;
var secure_port = 443;
if (port != 80) secure_port = 5443;

/* listen now */
var insecure_server = http.createServer(app).listen(port, '127.0.0.1', function() {
   // console.log(insecure_server)
    console.log('Express server (insecure) listening on port %d in %s mode',
        insecure_server.address().port, app.settings.env);
});

var server = insecure_server;

Socket.io = require("socket.io")(server);
//Socket.io = socketio.listen(server);

/* set up db */
var db_addr = process.env.DB || 'livechan_db';
var db_host = process.env.DB_HOST || 'localhost';
mongoose.connect('mongodb://' + db_host + '/' + db_addr);

/* 8mb limit */
// app.use(express.limit('40mb'));

const bodyParser = require("body-parser");

/*
var multer = require('multer');
const forms = multer();
*/

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


/* for saving images */
// replaced with multer
/*
app.use(function(req, res, next) {
    express.bodyParser({
    uploadDir: 
    keepExtensions: true
}));*/

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(forms.array({path: path.join(root, 'public/tmp/uploads')}))

/* logging only during development */
if (port == 180) {
    app.use(logfmt.requestLogger());
}
//app.mi


const serveStatic = require("serve-static");
/* serve public data (/public/*) and get cookies */
//app.use(express.static('/'));
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

app.use(express.static(path.join(root + '/public')));
app.use(cookieParser(config.cookieSecret))
app.use(cookieSession({
    secret: 'keyboard-cat',
    maxAge: 2592000000
}));

//app.use(cookieParser);
//app.use(cookieSession({
//    secret: 'keyboard-cat',
//    maxAge: 2592000000
//}));

/* robots */
app.use(function (req, res, next) {
    if ('/robots.txt' == req.url) {
        res.type('text/plain')
        res.send("User-agent: *\nDisallow: /");
    } else {
        next();
    }
});


function session_exists(session) {
    if (user_db.count({
            session_key: session
        })) {
        return true;
    }
    return false;
}


app.all('*', function(req, res, next) {
    if (!req.connection.encrypted && server !== insecure_server)
        res.redirect('https://' + req.host + (secure_port == 443 ? '' : ':' + secure_port) + req.url);
    else
        next();
});


/* Routes */
require('./routes/api');
require('./routes/admin');
require('./routes/chat');
require('./routes/login');
require('./routes/youtube');
require('./routes/misc');


Socket.io.sockets.on('connection', function(socket) {

    socket.emit('request_location', "please return a chat room");
    socket.on('subscribe', function(data) {
        socket.join(data);
        const io_namespace = Socket.io.of(data);
        const clientCount = io_namespace.server.engine.clientsCount;
        //Socket.io.sockets.in(data).emit('user_count', Socket.io.sockets.clients(data).length);
        //Socket.io.sockets.in(data).emit('user_count', Socket.io.of(data).clients().length);
        Socket.io.sockets.in(data).emit('user_count', clientCount);
    });
    socket.on('unsubscribe', function(data) {
        socket.leave(data);
        const io_namespace = Socket.io.of(data);
        if (!io_namespace) return;
        const clientCount = io_namespace.server.engine.clientsCount;
        Socket.io.sockets.in(data).emit('user_count', clientCount);
    });
    socket_stream(socket).on('upload', function(stream, data) {
        console.log("upload socket");
        var filename = 'public/tmp/uploads2/' + path.basename(data.name);
        stream.pipe(fs.createWriteStream(filename));
    });
});

//var ircServer = require('./utils/irc.js');
//ircServer.start();
