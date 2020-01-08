var geoip = require('geoip');
var City = geoip.City;
var city = new City('GeoLiteCity.dat');
var get_user_ip = require('./get-user-ip');
//var config = require('../../config');

var countries_data = require('./countries-data.js');

var default_country = countries_data.default_country;
var full_countries  = countries_data.full_countries;
var country_names   = countries_data.country_names;
var regional_flags  = countries_data.regional_flags;


module.exports = function(user_ip, data, callback) {
    delete require.cache[require.resolve('../../config')];
    var config = require('../../config');

    //var data = {};
    //console.log('trying to get country by ip: ' + user_ip);

    // Exceptions in config
    for(i in config.ip_exceptions) {
        if(user_ip.indexOf(i) == 0){
            console.log('ip in exceptions ' + user_ip);
            data.country = config.ip_exceptions[i];
            data.country_name = country_names[config.ip_exceptions[i].split('-')[0]];
            return callback();
        }
    }

    // geoip
    city.lookup(user_ip, function(err, c_data) {
        if (err) {
            console.log('city.lookup error: ' + err);
            data.country = default_country;
            return callback();
        }

        if (c_data) {
            data.country = c_data.country_code;
            data.country_name = c_data.country_name;
            data.latitude = c_data.latitude;
            data.longitude = c_data.longitude;
            if (!data.no_region) {
                if ((full_countries.indexOf(c_data.country_code) > -1) && c_data.region) {
                    data.country += "-" + c_data.region;
                } else if (c_data.region && (regional_flags.indexOf(data.country + "-" + c_data.region) > -1)) {
                    data.country += "-" + c_data.region;
                }
                if(data.country == 'UA-20') {
                    data.country = 'RU-94';
                    data.country_name = country_names['RU'];
                }
                if(data.country == 'UA-11') {
                    data.country = 'RU-82';
                    data.country_name = country_names['RU'];
                }
            }

            return callback();
        }
    });
}

