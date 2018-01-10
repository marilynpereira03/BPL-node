#! /bin/bash
configName=$2
genesisName=$3

mv $configName config.backup.json
mv $genesisName genesisBlock.backup.json
#get git branch
branch=$(git symbolic-ref --short HEAD)
git pull origin $branch
mv config.backup.json $configName
mv genesisBlock.backup.json $genesisName
forever stop `lsof -t -i:$4`
if [[ $1 -eq 1 ]]
  then
     npm install libpq secp256k1 >> npmlog.txt
     npm install >> npmlog.txt
fi
forever start app.js -c $configName -g $genesisName >> aa.txt
