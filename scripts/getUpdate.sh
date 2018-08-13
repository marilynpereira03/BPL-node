#!/bin/bash

FILE_NAME="BPL-node"
FILE_EXTENSION=".tar.gz"
IPFS_LINK="https://ipfs.io/ipfs/"
IPFS_HASH=""

BLUE="Blue"
GREEN="Green"
BPL_NODE='BPLNode'
BPL_NODE_PATH="./../$BPL_NODE"
BLUE_DIR_PATH="./../../$BLUE"
GREEN_DIR_PATH="./../../$GREEN"
DATE=`date '+%Y-%m-%d %H:%M:%S'`
LOG_FILE=""

# ##################################################################################################
#   function inti() -: this function will perform the follwing tasks                               #
#                                                                                                  #
#  1.will take two arguments : 1.IPFS_LINK & 2. IPFS_HASH                                          #
#  2.initialize above values to appropriate variables                                              #
#  3.If function arguments value are null then will thorw the error and stop the execution.        #
#  4.It will check whether the BPLNode Directory is present on the level of current directory path #
#    if   : BPLNode directory is present then it will call performCleanup function                 #
#                                                                                                  #
#    else : it will create the required directories, and will call the "installSoftware" Function  #
#                                                                                                  #
# ##################################################################################################

function init ()
{
    if [ "$1" -a "$2" ]
    then
        IPFS_LINK=$1
        IPFS_HASH=$2
        installSoftware
    else
        log "ERR" "Invalid number of arguments passed to init()."
        echo "ERR | Invalid number of arguments passed to init()."
    fi
}

# #################################################################################################
#   function log() -: this function will perform the follwing tasks                               #
#                                                                                                 #
#    This function will print the log in a specified file                                         #
#    with the format [INF] TIMESTAMP MESSAGE                                                      #                                            #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
###################################################################################################

function log(){

  #echo -e "[$1] $DATE | $2 "  >> $LOG_FILE
  echo -e "[$1] $DATE | $2 "
 }



###################################################################################################
#  function downloadNodeSoftware()                                                                #
#                                                                                                 #
#  This function will download the latest BPL-node software from IPFS to specified directory      #
#  This function takes one argument which is the path of the directory to download the software.  #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
###################################################################################################
  function downloadSoftware()
{

echo "**************************************************** $1"
local downloadDir=$1
cd $downloadDir
echo "DOWNLOAD DIR $downloadDir"
log "INF" "Downloading BPL-node software from IPFS to directory: $PWD "

echo "HASH $IPFS_LINK$IPFS_HASH : $FILE_NAME$FILE_EXTENSION "
if curl $IPFS_LINK$IPFS_HASH -o $FILE_NAME$FILE_EXTENSION
then
    log "INF" "Successfully downloaded BPL-node software."

fi

}


###################################################################################################
#  function extractSoftwareCode()                                                                 #
#                                                                                                 #
#  This function takes one argument which is the path of the directory to download the software.  #
#  This function will Extract the downloaded BPL-node.tar.gz file                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
###################################################################################################



function extractSoftwareCode ()
{
  echo "********************************************************** $1"
    if [ "$1" ]
    local inputDir=$1
    cd $inputDir
    then
        if [ -e $FILE_NAME$FILE_EXTENSION ]
        then
            log "INF" "Extracting $FILE_NAME to directory: $PWD"
            tar -xvzf $FILE_NAME$FILE_EXTENSION
            log "INF" "Successfully extracted $FILE_NAME to directory: $PWD"
            log "INF" "Removing $FILE_NAME from directory: $PWD"
            rm -rf $FILE_NAME$FILE_EXTENSION
            log "INF" "Successfully removed $FILE_NAME from directory: $PWD"

        fi
    fi

}

###################################################################################################
#  function installDependencies()                                                                  #
#                                                                                                 #
#  This function takes one argument which is the path of the directory to the BPL software.       #
#  This function will install all the required node modules and dependencies                      #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
###################################################################################################



function installDependencies()
{

  echo "********************************************************************** $1"
if [ "$1" ]
then
local inputDir=$1
cd $inputDir
# log "INF" "Installaion of BPLNodeSoftware Path : $PWD"
    #installation process of BPL-node
    if [ -d BPL-node ]
    then
        cd BPL-node
        log "INF" "Installing BPL-node software dependencies to directory: $PWD"
        npm install libpq secp256k1
        npm install
        log "INF" "Successfully installed BPL-node software dependencies."
    else
        log "ERR" "Unable to install BPL-node software dependencies to directory: $PWD"
    fi
else
    log "ERR" "Invalid number of arguments passed to installDependencies()."
fi
}


###################################################################################################
#  function backupBPLNode()                                                                       #
#                                                                                                 #
#  This function takes two argument                                                               #
#    1.path of current directory                                                                  #
#    2. path to backup directory                                                                  #
#  This function will copy all the files of BPL-node from current directory to backup directory   #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
###################################################################################################


function backupBPLNode()
{
if [ "$1" -a "$2" ]
then
    local inputDir=$1
    local backupDir=$2
    cd $inputDir
    log "INF" "Taking backup of BPL-node software from $inputDir to $backupDir "
    cp -r $inputDir $backupDir
    log "INF" "Successfully taken backup of BPL-node software."
else
    log "ERR" "Unable to take backup of BPL-node software from $1 to $2 "
fi


}

###################################################################################################
# function cleanDirectory()                                                                       #
#                                                                                                 #
#    this function take one argument which is the path of the directory                           #
#    and it removes the downloaded BPL-node software file from IPFS                               #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
#                                                                                                 #
###################################################################################################


 function cleanDirectory()
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


###################################################################################################
# function installSoftware()                                                                      #
#    This function takes two arguments                                                            #
#    1. path of current directory                                                                 #
#    2. path of the directory to install the BPL-node software                                    #
#                                                                                                 #
#   * This will download the BPL-node software from IPFS to given directory                       #
#   * Extract the BPL-node.tar.gz file                                                            #
#   * Install all the dependencies and npm modeules                                               #
#                                                                                                 #
#   * and only in the inital condition it will take a backup of BPL-node software code to         #
#        $GREEN directory                                                                         #
###################################################################################################



function installSoftware()
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
        local pwd=$PWD
        mkdir -p "$BPL_NODE_PATH"
        createLogFile
        cd $pwd
        log "INF" "Creating $BLUE and $GREEN directories."
        mkdir -p "$BPL_NODE_PATH/$BLUE"
        mkdir -p "$BPL_NODE_PATH/$GREEN"
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
echo "DONE"
}

function createLogFile()
{
     cd $BPL_NODE_PATH
     LOG_FILE="$PWD/softwareUpdates.log"
}

init $IPFS_LINK $1
