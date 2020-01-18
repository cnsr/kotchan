#!/usr/bin/python
import os
import sqlite3

os.chdir(os.path.dirname(__file__) or '.')
lb_db = sqlite3.connect('anna/lb.sqlite')
count = dict(lb_db.execute('select name,count(*) from stickers group by name'))

names = [os.path.splitext(f)[0] for f in os.listdir('public/images/stickers/') if f.endswith('png')]

names.sort(key=lambda f: count.get(f), reverse=True)

newdata = "var stickers = " + repr(names) + ';'
open('public/js/sticker_list.js', 'w').write(newdata)
