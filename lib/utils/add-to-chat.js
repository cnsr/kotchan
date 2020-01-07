'use strict';

var config = require('../../config');
var chat_db = require('../models/chat');
var delete_posts = require('./delete-posts');
var send_data = require('./send-data');

/* last post number */
var count;
chat_db.findOne().sort({
    count: -1
}).exec(function(e, d) {
    if (d) {
        count = d.count;
    } else {
        count = 0;
    }
});

module.exports = function(data, callback) {
    /* set post number */
    if (data.count === undefined) {
        count++;
        data.count = count;
        if (data.is_convo_op) data.convo_id = count;
    }

    var data_to_send = {};
    for (var i in data)
        data_to_send[i] = data[i];
    // Object.assign(data_to_send, data);

    if (data.image === undefined) {
        data_to_send.image = "";
        data_to_send.image_filename = "";
        data_to_send.thumb = "";
    }

    if (data.deleted === undefined) { /// temporary workaround
        data.deleted = false;
        data_to_send.deleted = false;
    } else if (data.deleted === true) {
        data_to_send.body = "[color=red][b]user was gulaged for this post[/b][/color]";
        data_to_send.image = "";
        data_to_send.image_filename = "";
        data_to_send.thumb = "";
    }

    /* send to clients */
<<<<<<< HEAD
    send_data(data.chat, 'chat', data_to_send, config.board_fields);
    send_data('all', 'chat', data_to_send, config.all_fields);
    // data.deleted=false;
=======
    send_data(data.chat, 'chat', data, config.board_fields);
    send_data('all', 'chat', data, config.all_fields);
    data.deleted=false;
>>>>>>> 4c0e730119c0970fb88047e3983daf7d5c461cef

    /* store in the db */
    chat_db.update({
        count: data.count
    }, data, {
        upsert: true
    }, function(err) {
        if (err) {
            console.log("chat save error", err, data);
            return callback(new Error('database_update_error'));
        }
        callback();

        chat_db.find({
                chat: data.chat,
                convo: data.convo,
                is_convo_op: false
            })
            .sort({
                count: -1
            })
            .skip(config.max_posts)
            .exec(delete_posts);

<<<<<<< HEAD

=======
>>>>>>> 4c0e730119c0970fb88047e3983daf7d5c461cef
        /* chat_db.find({
                chat: data.chat,
                convo: "General"
            })
            .sort({
                count: -1
            })
            .skip(config.max_posts)
            .exec(delete_posts);

        // Delete old convos
        chat_db.aggregate([{
                $match: {
                    chat: data.chat
                }
            }, {
                $group: {
                    _id: "$convo",
                    latest: {
                        $max: "$count"
                    },
                    pinned: {
                        $sum: "$pinned"
                    }
                }
            }, {
                $sort: {
                    latest: -1
                }
            }, {
                $skip: config.max_convos
            }])
            .exec(function(err, candidates) {
                if (candidates) {
                    chat_db.find({
                        chat: data.chat,
                        convo: {
                            '$in': candidates.filter(function(e) {
                                if (e._id != "General" && !e.pinned) return e._id;
                            })
                        }
                    }).exec(delete_posts);
                }
            }); */

        /*chat_db.find({chat: data.chat, is_convo_op: true})
            .sort({count: -1})
            .skip(50)
            .exec(delete_posts);
		});*/
    });
}
