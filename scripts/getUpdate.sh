#!/bin/bash

# CONSTANTS DECLARATION

#Generates colours using tput
RED=`tput setaf 1`
GREEN=`tput setaf 2`
YELLOW=`tput setaf 3`
BLUE=`tput setaf 4`
RESET=`tput sgr0`

#fileName will be name of the downloaded file
FILE_NAME="BPL-node.zip"
#IPFS link
IPFS_LINK="https://ipfs.io/ipfs/"

##########################################################################################################################################


##########
# init() #
##########

function init()
{
#get current directory path from which the current script is running.
if [ $1 ]
 then
    HASH=$1
    CURRENT_DIR=$PWD
    cd $CURRENT_DIR
    #go to the root directories behind from (directory BPL-node/scripts/)
    #and check if Blue and Green directories are present or not
    #if not present means this is the first time we are doing this operation
    #so create those directories and call the function firstCondition

    # if directoreis are present then call function secondCondition

    if [ -d ./../Blue -a -d ./../Green -o -d ./../../Blue -a -d ./../../Green ]
    then
        echo -e "${BLUE}[INFO]:Blue and Green directories are Present ${RESET}"
        secondCondition
    else
        echo -e "${BLUE}[INFO]:Creating Directory Blue and Green....${RESET}"
        mkdir -p ./../Green
        mkdir -p ./../Blue
        echo -e "${GREEN}[INFO]:Blue and Green Directory created ${RESET}"
     echo $PWD
        firstCondition
    fi

else
    echo -e "${RED}[ERR]:Invalid Number of Arguments ${RESET}"
    echo -e "${BLUE}[INFO]:Hash value not provided to 'downloadBPLNode' function ${RESET}"
fi
}

####################
# firstCondition() #
####################

function firstCondition()
{
#This will go to the Blue directory and will download the latest code there
local currentDir=$PWD
cd ./../Blue
downloadBPLNode
installBPLNode
cd $currentDir

if [ -d ./../Green ]
 then
    cd ./../Green
    #now we are in Green directory
    # if BPL-node directory already present in GREEN directory then remove it
    if [ -d BPL-node ]
    then
        rm -rf BPL-node
    fi

    #Now copy BPL-node directory here from Initial Condition
    echo "${BLUE} [INFO]:Copying BPL-node to " $PWD "Directory. ${RESET}"
    echo $PWD
    cp -r ./../BPL-node .
    echo "${GREEN} [INFO]:BPL-node copied to " $PWD "Directory. ${RESET}"

    #after copying the BPL-node directory to GREEN dir, remove the old BPL-node dir.
    #echo "${BLUE} [INFO]:Removing Old BPL-node Directory. ${RESET}"
    #rm -rf ./../BPL-node
    #echo "${GREEN} [INFO]:Removed Old BPL-node directory. ${RESET}"

    cd $currentDir
fi

}

#####################
# downloadBPLNode() #
#####################

function downloadBPLNode()
{
echo -e "${BLUE}[INFO]:Downloading BPL-node from IPFS....${RESET}"

#this will download the BPL-node folder from IPFS
if curl $IPFS_LINK$HASH > $FILE_NAME
  then
  echo -e "${GREEN}[INFO]:BPL-node downloaded from IPFS. ${RESET}"

	if [ -e $FILE_NAME ]
 	  then
       echo -e "${BLUE}[INFO]:Extracting " $FILE_NAME "to Directory"$PWD"${RESET}"
       unzip $FILE_NAME -d .
       echo -e "${GREEN}[INFO]:Extracted " $FILE_NAME "to Directory"$PWD "${RESET}"

       echo -e " ${BLUE}[INFO]:Removing " $FILE_NAME "${RESET}"
        rm -rf $FILE_NAME
       echo -e " ${BLUE}[INFO]:"$FILE_NAME" Removed Successfuly ${RESET}"

     fi
fi

}

#####################
# installBPLNode() #
#####################


function installBPLNode()
{

#installation process of BPL-node
if [ -d BPL-node ]
 then
    cd BPL-node
    echo "${BLUE}[INFO]:BPL-node installation is in progress..${RESET}"
    npm install libpq secp256k1
    npm install
    echo "${GREEN}[INFO]:BPL-node installation is completed.${RESET}"
    echo $PWD
else
    echo  "${RED}[ERR]:Unable to install BPL-node ${RESET}"
fi
}


#####################
# secondCondition() #
#####################

# This function will only get called when we have Green and Blue directories present in the system,
# So first this function will check the current working directory,
#if it is Blue then we will remove the content
function secondCondition()
{

#local currentDir=$PWD
#cd ./../
echo $PWD
if [[ $PWD =~ 'Green' ]]
 then
   echo "We are in Green Folder"
   local greenNodePath=$PWD
    echo $PWD
    if [ -d ./../../Blue ]
     then
         echo "PRESENT"
         if [ -d ./../../Blue/BPL-node ]
          then
          echo "${BLUE}[INFO]:Removing BPL-node from Blue Directory ${RESET}"
          rm -rf ./../../Blue/BPL-node
          echo "${GREEN}[INFO]:Removed BPL-node from Blue Directory ${RESET}"
         else
          echo "BPL-node not present in Blue Dir"
        fi

         cd ./../../Blue/
        echo "${BLUE}[INFO]:Downloading BPL-node from IPFS to Blue Directory ${RESET}"
             downloadBPLNode
          echo "${GREEN}[INFO]:Downloaded BPL-node from IPFS to Blue Directory ${RESET}"
          installBPLNode
         echo $PWD

    fi
    cd $greenNodePath
    echo $PWD " GREEN NODE"

fi


if [[ $PWD =~ 'Blue' ]]
 then
   echo "We are in Blue Folder"
   local blueNodePath=$PWD
    echo $PWD
    if [ -d ./../../Green ]
     then
         echo "PRESENT"
         if [ -d ./../../Green/BPL-node ]
          then
          echo "${BLUE}[INFO]:Removing BPL-node from Green Directory ${RESET}"
            rm -rf ./../../Green/BPL-node
          echo "${GREEN}[INFO]:Removed BPL-node from Green Directory ${RESET}"
         else
          echo "BPL-node not present in Green Dir"
        fi

         cd ./../../Green/
          echo "${BLUE}[INFO]:Downloading BPL-node from IPFS to Green Directory ${RESET}"
             downloadBPLNode
          echo "${GREEN}[INFO]:Downloaded BPL-node from IPFS to Green Directory ${RESET}"
           installBPLNode

           echo $PWD
    fi
    cd $blueNodePath
    echo $PWD " BLUE NODE"

fi

}
init $1
