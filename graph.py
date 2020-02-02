import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import random
from datetime import datetime, timedelta
import sqlite3

conn = sqlite3.connect('/app/lb.sqlite')
cur = conn.cursor()

#x_data = int(input())

days = np.arange(1,32,1)
days_as_date = []
#for x in days:
#	days_as_date.append(str(x) + '.06.2017')

#N = 500
#data = [random.randint(0,500) for i in range(x_data)]
data = []

date = datetime.now()-timedelta(days=31)
for i in range(31):
    date_text = date.strftime('%Y-%m-%d')
    days_as_date.append(date_text)
    data.append(cur.execute('SELECT count(*) from posts where date like "%s%%"' % date_text).fetchone()[0])
    date += timedelta(days=1)




ax = plt.subplot(211)
plt.xticks(days,days_as_date, rotation='vertical')
plt.plot(days, data)
plt.title('Daily posts')
plt.xlabel('Day')
plt.ylabel('Posts')
plt.xticks(np.arange(min(days), max(days)+1, 1.0))
plt.grid(True)
plt.savefig(os.path.join(os.path.dirname(__file__), 'public/images/graph.png'), bbox_inches='tight')
#plt.show()
