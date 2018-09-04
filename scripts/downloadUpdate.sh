#!/bin/bash

FILE_NAME="BPL-node"
FILE_EXTENSION=".tar.gz"
IPFS_LINK="https://ipfs.io/ipfs/"

BLUE="Blue"
GREEN="Green"
BPL_NODE='BPLNode'
BPL_NODE_PATH="./../$BPL_NODE"
BLUE_DIR_PATH="./../../$BLUE"
GREEN_DIR_PATH="./../../$GREEN"
DATE=`date '+%Y-%m-%d %H:%M:%S'`

BLU=`tput setaf 4`
RESET=`tput sgr0`
RED=`tput setaf 1`

function init ()
{
  if [ "$1" ]
    then
      IPFS_HASH=$1
      log "INF" "IPFS HASH: "$IPFS_HASH
      installSoftware
    else
      log "ERR" "Invalid number of arguments passed to init()."
  fi
}

#  log(): writes logs to file softwareUpdates.log
function log ()
{
  echo -e "[$1] $DATE | $2"  >> $LOG_FILE
  echo -e "${BLU}[$1] $DATE | $2 ${RESET}"
}

#  downloadNodeSoftware(): downloads BPL-node.tar.gz from IPFS to Green/Blue directory to path specified in arg1
function downloadSoftware ()
{
  local downloadDir=$1
  cd $downloadDir
  echo "DOWNLOAD DIR $downloadDir"
  log "INF" "Downloading BPL-node software from IPFS to directory: $PWD "

  log "HASH $IPFS_LINK$IPFS_HASH : $FILE_NAME$FILE_EXTENSION "

  if curl --fail $IPFS_LINK$IPFS_HASH -o $FILE_NAME$FILE_EXTENSION
    then
        log "INF" "Successfully downloaded BPL-node software."
    else
        log "ERR" "Failed to download BPL Software from IPFS"
        getStatus=$?
        exitScript $getStatus "downloadSoftware"
  fi
}

#  extractSoftwareCode(): extracts software to path specified in arg1
function extractSoftwareCode ()
{
  if [ "$1" ]
  local inputDir=$1
  cd $inputDir
    then
        if [ -e $FILE_NAME$FILE_EXTENSION ]
          then
              log "INF" "Extracting $FILE_NAME to directory: $PWD"
              tar -xvzf $FILE_NAME$FILE_EXTENSION
              getStatus=$?
            if [ $getStatus == 0 ]
              then
                  log "INF" "Successfully extracted $FILE_NAME to directory: $PWD"
                  log "INF" "Removing $FILE_NAME from directory: $PWD"
                  rm -rf $FILE_NAME$FILE_EXTENSION
                  log "INF" "Successfully removed $FILE_NAME from directory: $PWD"
              else
                  log "ERR" "Failed to extract $FILE_NAME$FILE_EXTENSION"
                  exitScript $getStatus "extractSoftwareCode"

            fi
        fi
    fi
}

#  installDependencies(): installs dependencies to path specified in arg1
function installDependencies ()
{
  if [ "$1" ]
    then
        local inputDir=$1
        cd $inputDir

        if [ -d BPL-node ]
          then
              cd BPL-node
              log "INF" "Installing BPL-node software dependencies to directory: $PWD"
              npm install libpq secp256k1
              npm install
              getStatus=$?
              log "INF" "Successfully installed BPL-node software dependencies."
          else
              log "ERR" "Unable to install BPL-node software dependencies to directory: $PWD"
              exitScript $getStatus "installDependencies"
        fi
    else
        log "ERR" "Invalid number of arguments passed to installDependencies()."
  fi
}

#  backupBPLNode(): copies BPL-node from current directory(arg1) to backup directory(arg2)
function backupBPLNode ()
{
  if [ "$1" -a "$2" ]
    then
        local inputDir=$1
        local backupDir=$2
        cd $inputDir
        log "INF" "Taking backup of BPL-node software from $inputDir to $backupDir "
        cp -r $inputDir $backupDir
        getStatus=$?
        log "INF" "Successfully taken backup of BPL-node software."
    else
        log "ERR" "Unable to take backup of BPL-node software from $1 to $2 "
        exitScript $getStatus "backupBPLNode"
  fi
}

# cleanDirectory(): deletes BPL-node from path specified in arg1
 function cleanDirectory ()
 {
    if [ $1 ]
      then
          if [ -d "$1/$FILE_NAME" ]
            then
                rm -rf "$1/$FILE_NAME"
                log "INF" "Successfully deleted file $FILE_NAME from $1"
            else
                log "ERR" "Unable to delete file $FILE_NAME from $1"
          fi
      else
          log "ERR" "Invalid number of arguments to function cleanDirectory()."
    fi
 }

# installSoftware(): downloads the BPL-node software from IPFS
#                    extracts BPL-node.tar.gz file
#                    install dependencies
function installSoftware ()
{
  local pwd=""
  local nextDir=""

  if [  \( -d "./../$BPL_NODE" \)  -o \( -d "./../../../$BPL_NODE"  \) ]
    then
        local pwd=$PWD
        cd ./../../
        createLogFile
        cd $pwd
        log  "INF" "$BLUE & $GREEN directories are present."

        if [[ "$PWD" =~ "$GREEN" ]]
          then
              pwd=$PWD
              nextDir=$BLUE_DIR_PATH
              log "INF" "We are in $GREEN directory $PWD"
          elif [[ "$PWD" =~ "$BLUE" ]]
            then
                pwd=$PWD
                nextDir=$GREEN_DIR_PATH
                log "INF" "We are in $BLUE directory $PWD"
        fi
      else
          initPath=$PWD
          pwd=$PWD
          mkdir -p "$BPL_NODE_PATH"
          createLogFile
          cd $pwd
          log "INF" "Creating $BLUE and $GREEN directories."
          mkdir -p "$BPL_NODE_PATH/$BLUE"
          mkdir -p "$BPL_NODE_PATH/$GREEN"
          initValue="TRUE"
          log "INF" "Successfully created $BLUE and $GREEN directories."
          nextDir="$BPL_NODE_PATH/$BLUE"
          backupBPLNode $pwd "$BPL_NODE_PATH/$GREEN"
  fi

  if [ "$pwd" == "" -a "$nextDir" == "" ]
    then
        log "ERR" "Values not found for pwd and nextDir in installSoftware()."
    else
        cd $pwd
        cleanDirectory $nextDir
        cd $pwd
        downloadSoftware $nextDir
        cd $pwd
        extractSoftwareCode $nextDir
        cd $pwd
        installDependencies $nextDir
        cd $pwd
  fi
}

# createLogFile(): creates log file
function createLogFile ()
{
  cd $BPL_NODE_PATH
  if [ ! -e "softwareUpdates.log" ]
    then
        echo >> softwareUpdates.log
  fi
  LOG_FILE="$PWD/softwareUpdates.log"
}

function exitScript()
{
if [ "$1" -a "$2" ]
  then
        if [ $initValue == "TRUE" ]
          then
                cd $initPath
                if [ -e $BPL_NODE_PATH ]
                  then
                        rm -rf $BPL_NODE_PATH
                fi
        fi
     log "ERR" "Exiting from function $2  with exit code $1"
     exit $1
fi
}
init $1
