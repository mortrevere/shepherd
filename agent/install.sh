#!/bin/bash

currentdir=$(dirname $(readlink -f "$0"))

if [ "$EUID" -ne 0 ]
  then echo "This needs to be run as root"
  exit
fi

apt update
apt install -y netcat iputils-ping bc net-tools cron

(echo "@reboot ${currentdir}/heartbeat.sh &") | crontab -

${currentdir}/heartbeat.sh </dev/null &>/dev/null &

headip=$(ping -c 1 -w 1 shepherd-head | grep PING | cut -d' ' -f 2,3)
printf "\nShepherd Agent is installed and running ! \n\treporting @ $headip \n\n"
