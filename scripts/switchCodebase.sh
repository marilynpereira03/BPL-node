#!/bin/bash

GREEN_DIR=./../../Green/BPL-node
BLUE_DIR=./../../Blue/BPL-node
BLUE=./../BPLNode/Blue/BPL-node
DATE=`date '+%Y-%m-%d %H:%M:%S'`
#STATUS="$PWD/status.txt"
######################################
# Function to write logs in log file #
######################################
function log()
{
    MESSAGE=$2
    LOG_FILE=./../../softwareUpdates.log
    echo "[$1] $DATE | $MESSAGE "  >> $LOG_FILE
}

##########################################
# Function to migrate from Blue to Green #
##########################################
function copyData()
{
    config=$1
    genesis=$2
    port=$3
    log "inf" "Copying the $config and $genesis files to directory $PWD" $4
    cp $config $5
    cp $genesis $5
    log "inf" "Stopping the current running node process from directory $PWD" $4
    kill -9 $(lsof -t -i:$port)
    sleep 2
    forever stop app.js
    sleep 2
    log "inf" "Process killed from directory $PWD" $4

    cd $5
    log "inf" "Starting the node process in directory $PWD" $4
    temp=$(forever start app.js -c $config -g $genesis)
    cd $currentDir
}


function main()
{
    CONFIG=$1
    GENESIS=$2
    PORT=$3
    log "inf" "Config File : $CONFIG" $PWD
    log "inf" "Genesis File: $2" $PWD
    log "inf" "PORT: $PORT " $PWD
    if [[ $PWD =~ 'Blue' ]]
      then
        if [[ -d "$GREEN_DIR" ]]
          then
              copyData $CONFIG $GENESIS $PORT $PWD $GREEN_DIR
          else
              log "ERR" "Failed to switch code base to $GREEN_DIR. directory Green not found"
        fi

      elif [[ $PWD =~ 'Green' ]]
        then
          if [[ -d "$BLUE_DIR" ]]
            then
                copyData $CONFIG $GENESIS $PORT $PWD $BLUE_DIR
            else
                log "ERR" "Failed to switch code base to $BLUE_DIR. directory Blue not found"
          fi

      elif [[ $PWD =~ 'BPL-node' ]]
        then
          if [[ -d "$BLUE" ]]
            then
                copyData $CONFIG $GENESIS $PORT $PWD $BLUE
            else
                log "ERR" "Failed to switch code base to $BLUE. directory Blue not found from directory $PWD"
          fi
    fi
}


# status=`cat $STATUS`
# if [ $status == "TRUE" ]
#   then
#       log "INF" "calling main function of switchCodeBase. status code is $status"
main $1 $2 $3
#   else
#       log "ERR" "Failed to switch code base. Status code is $status "
# fi
