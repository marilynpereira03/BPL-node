#! /bin/bash
#
mv config.wbx.json c.json
mv genesisBlock.wbx.json g.json
git pull origin wbx-avi
mv c.json config.wbx.json
mv g.json genesisBlock.wbx.json
forever stop `lsof -t -i:9032`
# kill `lsof -t -i:9032`
forever start app.js -c config.wbx.json -g genesisBlock.wbx.json
