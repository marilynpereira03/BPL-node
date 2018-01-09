'use strict';
var path = require('path');
var request = require('request');
var fs = require('fs');
let childProcess = require('child_process');
var packageJson = require('../package.json');
var configFileNames = require('../scripts/configFileNames.json');
var config = require('../'+configFileNames.config);
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
  // APPROACH 2
  var options = {
    url: 'https://api.github.com/repos/marilynpereira03/BPL-node/releases/latest?access_token=f42ba95ec5bd5d910a7ad5ed843aafd5803a9bfd',
    method: 'GET',
    headers: {'user-agent': 'node.js'}
    };
      request(options, function (err, res) {
        let response = JSON.parse(res.body);
        if(!err)
          {
            let spawn = childProcess.spawn;
            let gitReleaseVersion = response.tag_name.split(".");
            let packageJsonVersion =  packageJson.version.split(".");
             if(gitReleaseVersion[0] > packageJsonVersion[0] || gitReleaseVersion[1] > packageJsonVersion[1])
               {
                 spawn('sh',['scripts/getUpdatesFromGit.sh', '1', configFileNames.config, configFileNames.genesis, config.port]); //pending
               }
             else
              {
                if(gitReleaseVersion[2] > packageJsonVersion[2])
                {
                 spawn('sh',['scripts/getUpdatesFromGit.sh', '0', configFileNames.config, configFileNames.genesis, config.port]);
                }
              }
           }
        else {
          //oput logger logs
           console.log("There was an error while getting latest updates from GiT.");
        }
      });
};
// Export
module.exports = Script;
