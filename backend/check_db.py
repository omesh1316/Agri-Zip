import sqlite3

conn = sqlite3.connect('db/database.db')
cursor = conn.cursor()

cursor.execute("SELECT * FROM predictions ORDER BY id DESC LIMIT 5")  # recent 5 rows
rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()
