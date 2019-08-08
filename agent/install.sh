#!/bin/bash

currentdir=$(dirname $(readlink -f "$0"))

if [ "$EUID" -ne 0 ]
  then echo "This needs to be run as root"
  exit
fi

apt update
apt install -y netcat iputils-ping bc net-tools cron

(echo "@reboot ${currentdir}/heartbeat.sh &") | crontab -

${currentdir}/heartbeat.sh & 2>&1 > /dev/null
