git rev-parse HEAD
hostname
hostname -I
df -h | grep sd.2
date +%R:%S
uptime
ping -w 3 -c 1 8.8.8.8 > /dev/null && echo 'internet up' || echo 'internet down'
ping -w 3 -c 1 google.fr > /dev/null && echo 'DNS up' || echo 'DNS down'
free | grep Mem
echo -n 'TEMP ' && cat /sys/class/thermal/thermal_zone*/temp | tr '\n' ' ' && echo ''
echo -n 'CPU ' && ps -A -o pcpu | tail -n+2 | paste -sd+ | bc
echo 'LANPING'
cat /etc/hosts | cut -f1 | grep -Ev '#|127.0.' | xargs -L 1 ping -c1 -w3 2> /dev/null | grep -A 1 PING

processes=$(ps --no-headers -ww -eo pcpu,pid,user,comm | sort -nrk 1 | head -5)
processesc=$(echo "$processes" | wc -l)
echo "PROCESSES ${processesc}"
echo "$processes"

ws=$(netstat -lantp | grep -E '(LISTEN.*apache2|:80)' | grep -v TIME_WAIT | awk '{print $4 " " $7}')
wsc=$(echo "$ws" | sed '/^\s*$/d' | wc -l)
echo "WEBSERVICES ${wsc}"
echo "$ws"

