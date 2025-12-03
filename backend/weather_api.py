# backend/weather_api.py
import requests

def get_weather(city):
    API_KEY = "8dfae1abe3eec5992798a11bd64c9938"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    res = requests.get(url).json()
    weather = {
        "temp": res["main"]["temp"],
        "humidity": res["main"]["humidity"]
    }
    return weather
