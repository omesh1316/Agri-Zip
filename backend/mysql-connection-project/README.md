# filepath: c:\Users\omesh\Desktop\Desktop\AI-Agri-Assistant\backend\mysql_utils.py

import mysql.connector
from mysql.connector import Error

def create_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            password=user_password,
            database=db_name
        )
        print("Connection to MySQL DB successful")
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection

def save_prediction(connection, data):
    cursor = connection.cursor()
    query = '''
        INSERT INTO predictions (soil_type, season, temperature, humidity, suggested_crop, water_needs, pest_warning)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    '''
    values = (
        data['soil_type'],
        data['season'],
        data['temperature'],
        data['humidity'],
        data['suggested_crop'],
        data['water_needs'],
        data['pest_warning']
    )
    
    try:
        cursor.execute(query, values)
        connection.commit()
        print("Prediction saved successfully")
    except Error as e:
        print(f"The error '{e}' occurred")
    finally:
        cursor.close()

if __name__ == "__main__":
    # Replace with your database credentials
    connection = create_connection("localhost", "root", "", "your_database_name")

    # Example data to insert
    prediction_data = {
        'soil_type': 'Loamy',
        'season': 'Summer',
        'temperature': 30,
        'humidity': 70,
        'suggested_crop': 'Tomato',
        'water_needs': 'Moderate',
        'pest_warning': 'None'
    }

    if connection:
        save_prediction(connection, prediction_data)
        connection.close()
```

### Explanation:
1. **create_connection**: This function establishes a connection to the MySQL database using the provided credentials (host, username, password, and database name).
2. **save_prediction**: This function takes a connection and a dictionary containing prediction data, constructs an SQL `INSERT` statement, and executes it to save the data in the `predictions` table.
3. **Main Block**: The script connects to the database and calls the `save_prediction` function with example data.

### Note:
- Make sure to replace `"your_database_name"` with the actual name of your database.
- Ensure that the MySQL server is running in XAMPP and that the `predictions` table exists in your database with the appropriate columns.