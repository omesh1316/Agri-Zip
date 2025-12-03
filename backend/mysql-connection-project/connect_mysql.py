import mysql.connector

# MySQL database se connect karne ka code
my_connect = mysql.connector.connect(
    host='localhost',
    user='root',
    password='omesh',      # agar password hai toh yahan likhein
    database='agri_app'  # apne database ka naam yahan likhein
)

if my_connect.is_connected():
    print("✅ Successfully connected to MySQL database!")
else:
    print("❌ Connection failed.")