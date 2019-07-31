var DEFAULT_MIDDLEWARE_ADDR = 'localhost:8088';
var vueh = null;

var colors = {
    green: '#3CCC4E',
    yellow: '#FFDC3A',
    red: '#FA0033',
    white: '#FFF'
};

var ajax = {
    base: 'http://' + DEFAULT_MIDDLEWARE_ADDR,
    call: function (method, URI, data, callback, onerror) {
        var o = {
            method: method,
            url: this.base + URI
        };

        if (typeof data === 'function') {
            onerror = callback;
            callback = data;
        } else if (typeof data === 'object') {
            o.data = data;
        }

        function cbwrap(data) {
            if (callback)
                callback(data);
        }

        function failwrap(data) {
            if (onerror)
                onerror(data);
        }
        var client = new XMLHttpRequest();
        client.onreadystatechange = function () {
            if (client.readyState === XMLHttpRequest.DONE && client.status === 200 && client.responseText) {
                cbwrap(JSON.parse(client.responseText));
            }
        };
        client.open(o.method, o.url);
        client.send();

    }
};

//$('#mn-dump-list').bind('input propertychange', updateTopo);

vueh = new Vue({
    el: '#app-shepherd',
    data: {
        hosts: {},
        poller: null,
        lastUpdate: null,
        lagHandler: null,
        lag: 0,
        ipsToHostname: {},
        hostRoles: {
            'nfvi-1': 'VIM Controller',
            'nfvi-3': 'Orchestrator',
            'nfvi-4': 'VIM Dashboard/DNS/ssh hop',
            'oss-virt': 'VIM Compute',
        }
    },
    computed: {
        shosts: function () {
            var self = this;
            return Object.keys(self.hosts).sort(function (a, b) {
                return a > b;
            }).map(function (hostname) {
                host = self.hosts[hostname];
                host.name = hostname;
                return host;
            });
        }
    },
    methods: {
        poll: function () {
            var self = this;
            self.lastUpdate = new Date().getTime();
            clearInterval(self.lagHandler);

            self.lagHandler = setInterval(function () {
                var now = new Date().getTime();
                self.lag = now - self.lastUpdate;
                Object.keys(self.hosts).forEach(function (hostname) {
                    //console.log(hostname, now, self.hosts[hostname].updatedAt);
                    self.hosts[hostname].lag = Math.floor(now / 1000 - self.hosts[hostname].updatedAt);
                    if (self.hosts[hostname].lag > 42) {
                        self.hosts[hostname].ramcss = 'linear-gradient(90deg,' + ramcolor + ' ' + host.ram + '%, #C5C5C5 ' + host.ram + '%)';
                    }
                });
                //}, 150 + Math.floor(Math.random() * 40));
            }, 99);

            ajax.call('GET', '/hosts', function (data) {
                tmp = {};
                Object.keys(data).forEach(function (hostname) {
                    host = data[hostname];
                    host.internetRS = (host.internet ? 'Connecté' : 'Hors-ligne');
                    host.dnsRS = (host.dns ? 'OK' : 'Injoignable');
                    host.upToDate = (host.latest_release === host.release_id);
                    host.short_release_id = host.release_id.substr(0, 6);
                    host.ram = Math.floor(host.ram * 100) / 100;
                    host.load = host.load.reduce(function (prev, next) {
                        return prev + next + ' ';
                    }, '');
                    host.ip = host.ip.split('/')[0];

                    ramcolor = colors.white;
                    if (host.ram > 50) ramcolor = colors.yellow;
                    if (host.ram > 65) ramcolor = colors.red;

                    host.ramcss = 'linear-gradient(90deg,' + ramcolor + ' ' + host.ram + '%, #3CCC4E ' + host.ram + '%)';
                    host.webservices = host.webservices.map(function (ws) {
                        ws.url = 'http://' + host.ip + ':' + ws.port;
                        return ws;
                    });

                    self.ipsToHostname[host.ip] = hostname;
                    host.LAN = Object.keys(host.LAN).filter(function (ip) { return ip !== host.ip; }).map(function (ip) {
                        return { name: self.ipsToHostname[ip], latency: host.LAN[ip] };
                    });
                    host.lag = 0;

                    tmp[hostname] = host;
                });
                self.hosts = tmp;
            });
        }
    },
    mounted: function () {
        var self = this;
        self.poller = setInterval(self.poll, 5000);
        self.poll();
    }
});



