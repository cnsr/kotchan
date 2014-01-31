'use_strict';

var path = require('path');
var exec = require('child_process').exec;
var fs = require('fs');
var config = require('../../config.js');
var is_video = require('./is-video');

/* generate_thumbnail
    - generates thumbnail for image/video if present
    calls callback(err) on completion
*/
module.exports = function(req, data, callback) {
    /* TODO: remove this try catch */
    try {
        if (!data.image) {
            // no file uploaded; we are finished
            return callback();
        }

        var scale = Math.min(250 / data.image_width, 100 / data.image_height, 1);
        var thumb_width = Math.round(scale * data.image_width);
        var thumb_height = Math.round(scale * data.image_height);

        var thumbs_location = path.join(__dirname, '..', '..', 'public/tmp/thumb/');
        data.thumb = thumbs_location + data.image.match(/([\w\-]+)\.\w+$/)[1] + '.jpg';

        if (is_video(data.image)) {
            var command = "ffmpeg -i "+req.files.image.path+" -s "+thumb_width+"x"+thumb_height+" -vframes 1 "+data.thumb;
            return exec(command, function(err, stdout, stderr) {
                if (err) {
                    console.log('thumbnail creation error', err);
                    return callback(new Error('thumbnail_error'));
                }
                return callback();
            });
        } else {
            var gm = require('gm').subClass({
                imageMagick: config.use_imagemagick
            });

            return gm(data.image)
                .out("-delete", "1--1") // use first frame only; only needed for ImageMagick
                .thumb(thumb_width, thumb_height, data.thumb, function(err) {
                    if (err) {
                        console.log('thumbnail creation error', err);
                        return callback(new Error('thumbnail_error'));
                    }
                    return callback();
                });
        }
    } catch(e) {
        console.log('thumbnail creation error', e);
        return callback(new Error('thumbnail_error'));
    }
};