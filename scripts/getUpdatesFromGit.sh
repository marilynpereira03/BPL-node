#! /bin/bash
configName=$2
genesisName=$3
mv $configName config.backup.json
mv $genesisName genesisBlock.backup.json
#get git branch
branch=$(git branch)
git pull origin $branch
mv config.backup.json $configName
mv genesisBlock.backup.json $genesisName
kill -9 `lsof -t -i:$4`
forever stop `lsof -t -i:$4`
if [[ $1 -eq 1 ]]
  then
     npm install libpq secp256k1
     npm install
fi
forever start app.js -c config.$name.json -g genesisBlock.$name.json >> aa.txt
