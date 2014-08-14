var request = require('request');
var fs = require('fs');

var uri = 'http://aquarium-staging.herokuapp.com/';
// Sets the cache age to an hour
var cache_age = 3600000;

function api_call (endpoint, callback) {
  var cache_file = './cache/'+endpoint+'.json';
  var should_get_from_cache = false;
  var should_update_cache = true;
  var cache_exists = fs.existsSync(cache_file);
  if (cache_exists) {
    should_update_cache = false;
    should_get_from_cache = true;
    var stat = fs.statSync(cache_file);
    var difference = new Date().getTime() - stat.mtime.getTime();
    if (difference > cache_age) {
      should_update_cache = true;
      should_get_from_cache = false;
    }
  }
  if (should_get_from_cache) {
    var data = fs.readFileSync(cache_file);
    callback(JSON.parse(data));
  } else {
    var url = uri+endpoint+'.json';
    // temporary hack...
    if (endpoint.substr(0, 8) == 'country:') {
      url = 'https://gist.githubusercontent.com/johnmartin/b5b3a1666a60d47f3135/raw/8a6286ebbebb4cd0ff2faf81a66c6e51328d0d6f/country-bo.json';
    }
    request(url, function (error, response, data) {
      if (!error && response.statusCode == 200) {
        if (should_update_cache) {
          fs.writeFileSync(cache_file, data);
        }
        callback(JSON.parse(data));
      } else {
        console.log(error);
      }
    });
  }
}

module.exports = {
  call: api_call
};
