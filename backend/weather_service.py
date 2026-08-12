"""Small, dependency-free client for Open-Meteo's free geocoding and forecast APIs."""
from __future__ import annotations

import json
from datetime import datetime
from urllib.parse import urlencode
from urllib.request import urlopen


class WeatherUnavailable(RuntimeError):
    pass


def _get_json(url: str) -> dict:
    try:
        with urlopen(url, timeout=8) as response:  # no API key is required by Open-Meteo
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise WeatherUnavailable("Live weather could not be reached. Please try again shortly.") from exc


def get_weather(location: str) -> dict:
    """Resolve a place name and return current conditions plus a seven-day forecast."""
    location = (location or "").strip()
    if not location:
        raise ValueError("A farm location is required")
    places = _get_json("https://geocoding-api.open-meteo.com/v1/search?" + urlencode({"name": location, "count": 1, "language": "en", "format": "json"})).get("results", [])
    if not places:
        raise ValueError("Location was not found. Try a city and state, for example Pune, Maharashtra.")
    place = places[0]
    query = urlencode({
        "latitude": place["latitude"], "longitude": place["longitude"],
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,et0_fao_evapotranspiration",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration",
        "forecast_days": 7, "timezone": "auto",
    })
    data = _get_json("https://api.open-meteo.com/v1/forecast?" + query)
    current, daily = data["current"], data["daily"]
    forecast = [
        {"date": day, "temp": round((hi + lo) / 2, 1), "rain": round(rain, 1), "et0": round(et0, 2)}
        for day, hi, lo, rain, et0 in zip(daily["time"], daily["temperature_2m_max"], daily["temperature_2m_min"], daily["precipitation_sum"], daily["et0_fao_evapotranspiration"])
    ]
    return {
        "location": ", ".join(filter(None, [place.get("name"), place.get("admin1"), place.get("country")])),
        "latitude": place["latitude"], "longitude": place["longitude"], "observed_at": current.get("time", datetime.now().isoformat()),
        "temperature": float(current["temperature_2m"]), "humidity": float(current["relative_humidity_2m"]),
        "precipitation": float(current["precipitation"]), "wind_speed": float(current["wind_speed_10m"]),
        "et0": float(current["et0_fao_evapotranspiration"]), "forecast": forecast,
        "forecast_rainfall": round(sum(item["rain"] for item in forecast), 1),
        "forecast_et0": round(sum(item["et0"] for item in forecast), 2),
    }
