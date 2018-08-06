#!/bin/bash

function copyData()
{
configFileName=$1
genesisFileName=$2
echo "Config File : " $1 >> abc.txt
echo "Genesis File: " $2 >> abc.txt
echo "PORT : " $3 >> abc.txt
echo "$PWD" >> abc.txt

if [[ $PWD =~ 'Blue' ]]
 then
local currentDir=$PWD

    echo "In Blue Dir" >> abc.txt
    echo $PWD >> abc.txt
    echo "Copying the " $1 " and " $2 "files to Green Directory" >> abc.txt

    cp $configFileName ./../../Green/BPL-node
    cp $genesisFileName ./../../Green/BPL-node

    echo "Stopping the Current running node process...."  >> abc.txt
    kill -9 $(lsof -t -i:$3)
    sleep 2
    echo "Process killed". >> abc.txt

    cd ./../../Green/BPL-node
    echo "Starting the Node process in Green Directory". >> abc.txt
    node app.js -c $1 -g $2
    cd $currentDir




elif [[ $PWD =~ 'Green' ]]
 then
    local currentDir=$PWD
    echo "In Green Dir" >> abc.txt
    echo "Copying the " $1 " and " $2 "files to Blue Directory" >> abc.txt
    cp $configFileName ./../../Blue/BPL-node
    cp $genesisFileName ./../../Blue/BPL-node

    echo "Stopping the Current running node process...."  >> abc.txt
    kill -9 $(lsof -t -i:$3)
    sleep 2
    echo "Process killed".  >> abc.txt

    cd ./../../Blue/BPL-node
    echo "Starting the Node process in Blue Directory". >> abc.txt
    node app.js -c $1 -g $2
    cd $currentDir


elif [[ $PWD =~ 'BPL-node' ]]
 then
     echo "In BPL-node" >> abc.txt
     echo "Copying the " $1 " and " $2 "files to Blue Directory" >> abc.txt

    cp $configFileName ./../Blue/BPL-node
    cp $genesisFileName ./../Blue/BPL-node

    echo "Stopping the Current running node process...." >> abc.txt
    kill -9 $(lsof -t -i:$3)
    sleep 2
    echo "Process killed". >> abc.txt

    cd ./../Blue/BPL-node
    echo "Starting the Node process Blue Directory".  >> abc.txt
    echo $PWD >> abc.txt
    node app.js -c $1 -g $2
    cd $currentDir


fi



}

copyData $1 $2 $3
