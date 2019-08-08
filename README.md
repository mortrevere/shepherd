# shepherd
Monitoring tool for Linux (ubuntu) clusters

![dashboard screen example](screen.png)

## Agent

The agent can be installed on the node by cloning this repo and running the **native** reporting daemon.

```
git clone https://github.com/mortrevere/shepherd.git
cd shepherd
```

Then edit `./agent/hosts` to include your middleware IP as `shepherd-head`, and :

```
./agent/install.sh
```

> ***Note :*** you can also include other IP/hostname combinations in that file, as they will be used to perform a ping check.

By default it reports :

- Management IP address
- disk usage
- CPU load
- Temperature
- RAM usage
- Internet connectivity
- DNS resolving
- Arbitrary ping checks
- Exposed webservices
- Top 5 processes

Bonus one-liner for docker containers that don't ship with git :

```
apt update && apt install -y git && git clone https://github.com/mortrevere/shepherd.git && cd shepherd && sed -i 's/10.0.0.10/<MIDDLEWARE IP ADDRESS>/' ./agent/hosts && ./agent/install.sh
```

## Middleware

Data from nodes is collected and aggregated by the python middleware

```
./shepherd.py
```

## Dashboard

The dashboard is accessible by opening the `index.html` file directly in your browser (Ctrl-O) or by hosting it somewhere.

