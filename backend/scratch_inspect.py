import sqlite3
conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
cur.execute('select id, title, status, priority, project_id from tickets_ticket')
for row in cur.fetchall():
    print(row)
conn.close()
