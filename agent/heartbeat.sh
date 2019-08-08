#!/bin/bash

currentdir=$(dirname $(readlink -f "$0"))

cat ${currentdir}/hosts >> /etc/hosts
while true; do
sleep 1
${currentdir}/report.sh | nc -q 2 shepherd-head 7777
sleep 8
done
