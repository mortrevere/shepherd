#! /usr/local/bin/python3.7

import socket
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
import asyncio
import json
import os
import time

hosts = {};

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        latest_release = os.popen('git rev-parse HEAD').read().strip()
        for hostname in hosts:
            hosts[hostname]['latest_release'] = latest_release

        self.wfile.write(bytes(json.dumps(hosts), 'utf-8'))

    def log_message(self, format, *args):
        return

def http_server(server_class=HTTPServer, handler_class=S, port=8088):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('Starting httpd...')
    httpd.serve_forever()

async def handle_client(reader, writer):
    request = None
    buf = ''
    print('.', end='')
    sys.stdout.flush()
    while True:
        if reader.at_eof():
            print('closed')
            break
        try:
            request = (await reader.read(255)).decode('utf8')
            if not request:
                writer.close()
                break
            buf += request
        except Exception as e:
            print(e)
    writer.close()
    try:
        parseHostReport(buf)
    except:
        print(buf)
        pass

def parseHostReport(report):

    host = {'updatedAt': time.time()}

    lines = report.split('\n')
    linesChunks = [line.split(' ') for line in lines]
    linesChunks = [[chunk for chunk in chunks if chunk != ''] for chunks in linesChunks] #python

    hostname = lines[1]
    host['release_id'] = lines[0]
    host['ip'] = linesChunks[3][1]
    host['disk_usage'] = linesChunks[4][-2]
    host['time'] = linesChunks[5][0]
    load = linesChunks[6]
    host['load'] = [load[-3][0:-1], load[-2][0:-1], load[-1]]
    host['internet'] = (linesChunks[7][1] == 'up')
    host['dns'] = (linesChunks[8][1] == 'up')

    ram = linesChunks[9]
    host['ram'] = int(ram[2])*100/int(ram[1])

    temp = [int(a) for a in linesChunks[10][1:]]
    host['temp'] = sum(temp)/(1000*len(temp))

    host['cpu'] = float(linesChunks[11][1])


    LANpings = {}
    processes = []
    ws = []
    currentLANpeer = ''

    i = 11
    for line in lines[i:]:
        cline = line.strip()
        chunks = cline.split(' ')
        chunks = [chunk for chunk in chunks if chunk != '']
        if len(chunks) != 0:
            if chunks[0] == 'PING':
                currentLANpeer = chunks[1]
                LANpings[currentLANpeer] = False
            if chunks[0] == '64':
                LANpings[currentLANpeer] = chunks[-2].split('=')[1]

            if chunks[0] == 'PROCESSES':
                processLines = linesChunks[i+1:i+1+int(chunks[1])]
                processes = [{'load' : a[0], 'pid' : a[1], 'user' : a[2], 'process' : a[3]} for a in processLines]

            if chunks[0] == 'WEBSERVICES' and int(chunks[1]) != 0:
                wsLines = linesChunks[i+1:i+1+int(chunks[1])]
                ws = [{'port' : a[0][3:], 'process' : a[1]} for a in wsLines]

        i += 1
        if hostname:
            host['LAN'] = LANpings
            host['processes'] = processes
            host['webservices'] = ws
            hosts[hostname] = host

loop = asyncio.get_event_loop()
loop.create_task(asyncio.start_server(handle_client, '', 7777))
loop.run_in_executor(None, http_server)
loop.run_forever()
