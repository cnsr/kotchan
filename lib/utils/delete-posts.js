'use strict';

var fs = require('fs');

module.exports = function(e, ds) {
//console.log("DELETE CALLED",ds);
    if (e) {
        return console.log("chat find error", e);
    }
    ds.forEach(function(d) {
        if (d.image) fs.unlink(d.image, function(e2) {
            if (e2) { console.log('fs.unlink(d.image) error', e2); };
        });
        if (d.thumb) fs.unlink(d.thumb, function(e2) {
            if (e2) { console.log('fs.unlink(d.thumb) error', e2); };
        });
        d.deleted=true;
        d.save();
	d.remove();
        //if (e2) { console.log('chat removal error', e2); };
	//console.log("delete messages");
//         });
    });
};
