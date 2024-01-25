#!/bin/bash

#curl https://check.torproject.org/cgi-bin/TorBulkExitList.py?ip=31.148.96.156 | /usr/bin/env grep -v -e "^#" -e "^$" | jq --slurp --raw-input --indent 4 'split("\n") | map(select(length>0))' > tor_nodes_ips_list.json
curl https://check.torproject.org/torbulkexitlist?ip=31.148.96.156 | /usr/bin/env grep -v -e "^#" -e "^$" | jq --slurp --raw-input --indent 4 'split("\n") | map(select(length>0))' > tor_nodes_ips_list.json
