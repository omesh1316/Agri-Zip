# db_utils.py (you can also put this in utils.py if you want)

import sqlite3

def save_prediction(data):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    c.execute('''
        INSERT INTO predictions (soil_type, season, temperature, humidity, suggested_crop, water_needs, pest_warning)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['soil_type'],
        data['season'],
        data['temperature'],
        data['humidity'],
        data['suggested_crop'],
        data['water_needs'],
        data['pest_warning']
    ))

    conn.commit()
    conn.close()
