'use strict';

const app = global.APP;
    
app.get('/', function (req, res) {
    res.redirect('/chat/home');
});

/* 404 */
app.get('*', function(req, res){
    res.status(404).sendfile('pages/404.html');
});

/* 404 */
app.post('*', function(req, res){
    res.status(404).sendfile('pages/404.html');
});
