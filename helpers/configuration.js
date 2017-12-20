'use strict';

let http = require('http');
let fs = require('fs');
var jsonFormat = require('json-format');
let constants = require('../constants.json');

//let Logger = require('../logger.js');
//let logger = new Logger({ echo: appConfig.consoleLogLevel, errorLevel: appConfig.fileLogLevel, filename: appConfig.logFileName });

function getConfiguration (name, cb) {
  http.get('http://54.238.250.48:3000/sidechain/get?name='+name, (response) => {
    var data = '';
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', function () {
      data = JSON.parse(data);
      if(data.status === 'success') {
        updateConfiguration(data.data, cb);
      }
      else {
        cb('Failed to get configurations for '+name);
      }
    });
  }).on("error", (err) => {
    cb('Failed to get sidechain configurations from server '+err);
  });
}

function updateConfiguration (data, cb){
	constants.activeDelegates = data.activedelegates;
	constants.blocktime = data.blocktime;
	constants.maxTxsPerBlock = data.blocksize;
	constants.rewards.distance = data.distance;
	constants.rewards.offset = data.rewardoffset;
	constants.rewards.type = data.rewardtype;
	constants.rewards.milestones = data.milestones;
	constants.rewards.fixedLastReward = data.fixedlastreward;
	constants.totalAmount = data.totalamount;

	writeToFile("./constants.json", constants, function (err) {
		if (err) {
      cb(err);
    }
		else {
      cb();
    }
	});
}

function writeToFile (fileName, data, cb) {
	fs.writeFile(fileName, jsonFormat(data), function (err) {
		if (err) {
			console.log('Failed to write configurations to constants.js: ',err);
			cb(err);
		}
		else {
			console.log('Configurations successfully written to constants.js');
			cb();
		}
	});
};

module.exports = getConfiguration;
