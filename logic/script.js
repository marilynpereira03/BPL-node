'use strict';
var Version = require('../package.json');
var path = require('path');
var request = require('request');
var fs = require('fs');
// Private fields
var __private = {};


function Script () {
}

Script.prototype.triggerPortChangeScript = function (height) {
  if(height == '260000') {
    var sys  = require('util'),
        exec = require('child_process').exec,
        child;
      child = exec('sh scripts/portChange.sh', function (error, stdout, stderr)
      {
          if (error)
             console.log('There was an error executing the script');
          console.log('Sucessfully executed the script!!!');
      });
  }
};

Script.prototype.getLatestClientVersion = function (height) {
  // // APPROACH 1
  //                 var check=0;
  //                 if(height%4===0)
  //                   check=1;
  //                 if(check===1)
  //                 {
  //                   var spawn = require('child_process').spawn;
  //                   var child = spawn('sh',[ 'scripts/update1.sh' ]);
  //                   child.unref();
  //                 }

  // APPROACH 2
  var options = {
    url: 'https://api.github.com/repos/marilynpereira03/BPL-node/releases/latest',
    method: 'GET',
    headers: {'user-agent': 'node.js'}
    };
      request(options, function (err, response) {
        var res = JSON.parse(response.body);
        if(!err) {
            var spawn = require('child_process').spawn;
             if(res.tag_name!=Version.version && res.target_commitish=="wbx-avi")
             {
              var child = spawn('sh',[ 'scripts/update1.sh' ]);
              console.log("Version ",res.tag_name,Version.version);
             }
           }
        else {
           return err;
        }
      });
};
// Export
module.exports = Script;
