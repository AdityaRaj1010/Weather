
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/weather")
def get_weather(lat: float, lon: float, tz: str = "auto"):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ",".join([
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "is_day",
            "precipitation",
            "wind_speed_10m",
            "wind_direction_10m",
            "weather_code",
            "surface_pressure",
            "cloud_cover"
        ]),
        "hourly": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "cloud_cover",
            "wind_speed_10m"
        ]),
        "daily": ",".join([
            "temperature_2m_max",
            "temperature_2m_min",
            "uv_index_max",
            "sunrise",
            "sunset",
            "precipitation_sum"
        ]),
        "forecast_days": 7,
        "timezone": tz
    }

    r = requests.get(url, params=params)
    if r.status_code != 200:
        return {"error": True, "reason": r.text}

    return r.json()


@app.get("/api/reverse")
async def reverse_geocode(lat: float, lon: float):
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    async with httpx.AsyncClient() as client:
        r = await client.get(url, headers={"User-Agent": "WeatherApp/1.0"})
    return r.json()

@app.get("/api/search")
async def search_places(q: str):
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={q}&limit=5"
    async with httpx.AsyncClient() as client:
        r = await client.get(url, headers={"User-Agent": "WeatherApp/1.0"})
    return r.json()
