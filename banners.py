#!/usr/bin/python3
import os

os.chdir(os.path.dirname(__file__) or '.')

names = [f for f in os.listdir('public/images/banners/') if f.endswith('png') or f.endswith('jpg') or f.endswith('gif') or f.endswith('jpeg')]

newdata = "var banners = " + repr(names) + ';'
print(newdata)
open('public/js/banners.js', 'w').write(newdata)

