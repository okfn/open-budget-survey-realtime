var fs = require('fs');
var Indaba = require('open-budget-indaba-client').default.Indaba;
var moment = require('moment');
var _ = require('underscore');

function api_call(endpoint, callback) {
  var cache_file = './cache/'+endpoint+'.json';
  var should_get_from_cache = false;
  var should_update_cache = true;
  var cache_exists = fs.existsSync(cache_file);
  if (cache_exists) {
    should_update_cache = false;
    should_get_from_cache = true;
    var stat = fs.statSync(cache_file);
    var months = moment().diff(new Date(stat.mtime), 'months');
    if (months >= 6) {
      should_update_cache = true;
      should_get_from_cache = false;
    }
  }
  if (should_get_from_cache) {
    var data = fs.readFileSync(cache_file);
    var date = new Date(stat.mtime);
    callback(JSON.parse(data), date);
  } else {
    Indaba.getTrackerJSON().then( function (res) {
      if (should_update_cache) {
        fs.writeFileSync(cache_file, JSON.stringify(res));
      }
      callback(res, new Date());
    });
  }
}

function getGDriveFolders(file, callback) {
  var cache_file = './cache/'+file+'.json';
  if (updateCache(file)) {
    Indaba.getGDriveFolders().then(function (res) {
      //TODO implement this in open-budget-indaba-client when populating the spreadsheet
      _.forEach(res.values, function(folder) {
        folder[0] = _.map(folder[0].split('/'), function(part) {
            return part.trim()
          }).join('/');
        var splitted = folder[0].split('/');
        if (splitted[1]) {
          if (splitted[1].toUpperCase() === 'IN-YEAR REPORTS') {
            splitted[1] = 'In-Year Report';
            folder[0] = splitted.join('/');
          }
        }
      });
      fs.writeFileSync(cache_file, JSON.stringify(res));
      callback(res)
    })
  } else {
    var data = fs.readFileSync(cache_file);
    callback(JSON.parse(data))
  }
}

function updateCache(file, duration) {
  var cache_file = './cache/'+file+'.json';
  var should_update_cache = true;
  var cache_exists = fs.existsSync(cache_file);
  if (cache_exists) {
    should_update_cache = false;
    var stat = fs.statSync(cache_file);
    var months = moment().diff(new Date(stat.mtime), 'months');
    if (months >= 6) {
      should_update_cache = true;
    }
  }
  return should_update_cache;
}

module.exports = {
  call: api_call,
  driveFolders: getGDriveFolders
};
