#!/usr/bin/python
import os
import sqlite3

os.chdir('/home/ph/livechan-js')
lb_db = sqlite3.connect('/home/ph/anna/lb.sqlite')
count = dict(lb_db.execute('select name,count(*) from stickers group by name'))

names = [os.path.splitext(f)[0] for f in os.listdir('public/images/stickers/') if f.endswith('png')]

names.sort(key=lambda f: count.get(f), reverse=True)

data = open('public/js/stickers.js').read()
newdata = "var stickers = " + repr(names) + ';'
newdata += "\n// end of stickers\n"
newdata += data.split('// end of stickers')[1]
open('public/js/stickers.js', 'w').write(newdata)

