#!/usr/bin/python3
import os
import pymongo
col = col = pymongo.MongoClient().livechan_db.chat_dbs

files = set()

for r in col.find({'image': {'$exists': True}}):
    if 'image' in r:
        files.add(r['image'])
    if 'thumb' in r:
        files.add(r['thumb'])

ondisk = set()

for d in ('/home/ph/livechan-js/public/tmp/thumb/', '/home/ph/livechan-js/public/tmp/uploads/'):
    for f in os.listdir(d):
        ondisk.add(os.path.join(d, f))

for f in (ondisk - files):
    print(f)
    os.unlink(f)

