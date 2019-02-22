var disableanimation_stylesheet = (function() {
    // Create the <style> tag
    var style = document.createElement("style");

    // WebKit hack
    style.appendChild(document.createTextNode(""));

    // Add the <style> element to the page
    document.head.appendChild(style);


    style.sheet.insertRule(`.roll, .spin, .nonono, .lspin, :before, :after {
     /*CSS transitions*/
     transition-property: none !important;
     /*CSS transforms*/
     transform: none !important;
     /*CSS animations*/
     animation: none !important;
     }
    `, 0);

    return style.sheet;
})();


$('#disableanimation').change(function() {
    if (html5) {
        if($(this).prop("checked")) {
            localStorage.disableAnimation = "true";
            disable_animation();
        }
        else {
            localStorage.disableAnimation = "false";
            enable_animation();
        }
    }
});


function disable_animation() {
    disableanimation_stylesheet.disabled = false;
};

function enable_animation() {
    disableanimation_stylesheet.disabled = true;
};

function toggle_animation() {
    disableanimation_stylesheet.disabled = !disableanimation_stylesheet.disabled;
}



if (localStorage.disableAnimation !== undefined) {
    $("#disableAnimation").prop("checked", localStorage.disableAnimation === "false");
    if(localStorage.disableAnimation === "true") disable_animation();
    else enable_animation();
}
else {
    $("#disableAnimation").prop("checked", false);
    enable_animation();
}