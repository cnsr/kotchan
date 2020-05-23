#!/usr/bin/env python3

import json

from urllib import request

URL = 'https://check.torproject.org/cgi-bin/TorBulkExitList.py?ip=31.148.96.156'
OUT_FILE = 'tor_nodes_ips_list.json'

if __name__=='__main__':
    with request.urlopen(URL) as f:
        data = filter(lambda x: x and (not x.startswith('#')), f.read().decode('utf-8').split('\n'))

    with open(OUT_FILE, 'w') as f:
        json.dump(tuple(data), f)
