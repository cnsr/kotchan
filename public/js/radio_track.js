(function worker() {
  $.get('https://radio.kotchan.org/api/current.json', function(data) {
    // Now that we've completed the request schedule the next one.
    $('#radio_track').html(data['current']);
    setTimeout(worker, 5000);
  });
})();
