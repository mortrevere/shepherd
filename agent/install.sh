#!/bin/bash

currentdir=$(dirname $(readlink -f "$0"))

if [ "$EUID" -ne 0 ]
  then echo "This needs to be run as root"
  exit
fi

(echo "@reboot ${currentdir}/heartbeat.sh &") | crontab -

${currentdir}/heartbeat.sh &
