// var IMAGE_PASTE_FORMAT = "jpeg";
// var IMAGE_PASTE_QUALITY = 1.0;

$(document).ready(function() {
    $('#body').on('paste', onpaste_handler);
});


function blobToFile(blob, filename){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
console.log('pre-file blob: ', blob);
    return new File([blob], filename, {type: blob.type, lastModified: Date.now()});
}

function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/'+localStorage.image_paste_format});
}


function prepare_blob(blob, callback) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d"); 
    var image = new Image();

    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function(evt){
        if( evt.target.readyState == FileReader.DONE) {
            image.src = evt.target.result;
            image.addEventListener("load", function(evt){
                canvas.width = image.width;
                canvas.height = image.height;

                context.drawImage(image, 0, 0);

                var pre_blob = dataURItoBlob(canvas.toDataURL("image/"+localStorage.image_paste_format, parseFloat(localStorage.image_paste_quality)));
                var file = blobToFile(pre_blob, 'image.'+localStorage.image_paste_format);
                console.log('file blob: ', file);
                callback(file);
            });
        }
    }
}

function onpaste_handler(event){

    var blob = null;
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;

    for (index in items) {
        var item = items[index];
        console.log(item);
        if (item.kind === 'file') {
            blob = item.getAsFile();
            console.log('item.kind is file, blob=', blob);
        }
    }
console.log('in blob: ', blob);
    if(!blob) return;
    prepare_blob(blob, send_blob);
/*  if(!blob || parseInt(localStorage.cool_down_timer)) return;
    cool_down_timer += 3
    localStorage.cool_down_timer = cool_down_timer;
    $("#submit_button").prop("disabled", true);
    localStorage.cool_down_timer = cool_down_timer;*/
}

function send_blob(blob) {
    var fd = new FormData();
console.log('out blob: ', blob);
    fd.append('image', blob);
    fd.append('name', $('#name')[0].value);
    fd.append('convo', $('#convo')[0].value);
    fd.append('body', $('#body')[0].value);
    $('#body')[0].value='';
    $.ajax({
        url: $('#comment-form')[0].action,
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST'//,
    //    success: function(data){
    //         console.log(data);
    //    }
    }).done(add_pasted);//.done(handle_post_response);
}

function add_pasted(resp){
    // resp = JSON.parse(resp);
    // my_ids.push(resp.id);
    handle_post_response(resp)
}