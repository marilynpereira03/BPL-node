#! /bin/bash
#
mv config.wbx.json c.json
mv genesisBlock.wbx.json g.json
git checkout config.wbx.json
git checkout genesisBlock.wbx.json
git pull origin wbx >> aa.txt
mv  c.json config.wbx.json
mv  g.json genesisBlock.wbx.json
kill `lsof -t -i:9032`
node app.js -c config.wbx.json -g genesisBlock.wbx.json >> a.txt &
