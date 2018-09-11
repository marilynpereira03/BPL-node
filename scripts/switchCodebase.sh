#!/bin/bash

GREEN_DIR=./../../Green/BPL-node
BLUE_DIR=./../../Blue/BPL-node
BLUE=./../BPLNode/Blue/BPL-node
DATE=`date '+%Y-%m-%d %H:%M:%S'`

######################################
# Function to write logs in log file #
######################################
function log()
{
    echo "[$1] $DATE | $2 "  >> $LOG_FILE
}

##########################################
# Function to migrate from Blue to Green #
##########################################
function copyData()
{
    config=$1
    genesis=$2
    port=$3
    log "INF" "Copying the $config and $genesis files from directory $4 to $5"
    cp $config $5
    cp $genesis $5
    log "INF" "Killing current node process from directory $4"
    forever stop app.js
    kill -9 $(lsof -t -i:$port)
    sleep 2
    log "INF" "Process killed succesfully from $4"

    cd $5
    log "INF" "Starting the node process in directory $4"
    temp=$(forever start app.js -c $config -g $genesis)
}


function main()
{
    createLogFile
    CONFIG=$1
    GENESIS=$2
    PORT=$3
    log "INF" "Config File : $CONFIG" $PWD
    log "INF" "Genesis File: $2" $PWD
    log "INF" "PORT: $PORT " $PWD
    if [[ $PWD =~ 'Blue' ]]
      then
        if [[ -d "$GREEN_DIR" ]]
          then
              copyData $CONFIG $GENESIS $PORT $PWD $GREEN_DIR
          else
              log "ERR" "Failed to switch code base to $GREEN_DIR, directory Green not found"
        fi

      elif [[ $PWD =~ 'Green' ]]
        then
          if [[ -d "$BLUE_DIR" ]]
            then
                copyData $CONFIG $GENESIS $PORT $PWD $BLUE_DIR
            else
                log "ERR" "Failed to switch code base to $BLUE_DIR, directory Blue not found"
          fi

      elif [[ $PWD =~ 'BPL-node' ]]
        then
          if [[ -d "$BLUE" ]]
            then
                copyData $CONFIG $GENESIS $PORT $PWD $BLUE
            else
                log "ERR" "Failed to switch code base to $BLUE, directory Blue not found"
          fi
    fi
}

function createLogFile()
{

if [ -e ./../../../BPLNode ]
  then
      LOG_FILE=./../../softwareUpdates.log
else
      LOG_FILE=./../BPLNode/softwareUpdates.log
fi

}

main $1 $2 $3
