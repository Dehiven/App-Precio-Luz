import requests
import json
from datetime import datetime
from flask import Flask, jsonify, request

API_TOKEN = "454b7c51532f99c87cd532ed28e16abb6feaf0e16d2ca270c2e9b1044eb40ed2"
INDICADOR = "1001"
URL = f"https://api.esios.ree.es/indicators/{INDICADOR}"

headers = {
    "Accept": "application/json; application/vnd.esios-api-v1+json",
    "Content-Type": "application/json",
    "Host": "api.esios.ree.es",
    "x-api-key": API_TOKEN,
}

app = Flask(__name__)

cached_data = None
last_fetch = None


def fetch_from_ree():
    global cached_data, last_fetch
    try:
        respuesta = requests.get(URL, headers=headers)

        if respuesta.status_code == 200:
            datos = respuesta.json()
            valores = datos["indicator"]["values"]

            processed_data = []
            for item in valores:
                datetime_str = item["datetime"]
                dt = datetime.fromisoformat(datetime_str.replace("Z", "+00:00"))

                processed_data.append(
                    {
                        "hour": dt.hour,
                        "date": dt.strftime("%Y-%m-%d"),
                        "price": item["value"] / 1000,
                        "datetime": datetime_str,
                        "value_mwh": item["value"],
                    }
                )

            cached_data = {
                "indicator": datos["indicator"]["name"],
                "prices": processed_data,
                "fetched_at": datetime.now().isoformat(),
            }
            last_fetch = datetime.now()
            return True
        else:
            print(f"Error API: {respuesta.status_code}")
            return False
    except Exception as e:
        print(f"Error fetching data: {e}")
        return False


@app.route("/")
def index():
    return jsonify(
        {
            "status": "ok",
            "message": "Precio Luz API",
            "endpoints": {
                "/prices": "Obtener precios actuales",
                "/prices/today": "Precios de hoy",
                "/refresh": "Forzar actualización",
            },
        }
    )


@app.route("/prices")
def get_prices():
    global cached_data, last_fetch

    if cached_data is None or (
        last_fetch and (datetime.now() - last_fetch).seconds > 300
    ):
        fetch_from_ree()

    if cached_data:
        return jsonify(cached_data)
    return jsonify({"error": "No data available"}), 500


@app.route("/prices/today")
def get_today_prices():
    global cached_data

    if cached_data is None:
        fetch_from_ree()

    if cached_data:
        today = datetime.now().strftime("%Y-%m-%d")
        today_prices = [p for p in cached_data["prices"] if p["date"] == today]

        if today_prices:
            prices_only = [p["price"] for p in today_prices]
            return jsonify(
                {
                    "date": today,
                    "prices": today_prices,
                    "min_price": min(prices_only),
                    "max_price": max(prices_only),
                    "avg_price": sum(prices_only) / len(prices_only),
                }
            )

    return jsonify({"error": "No data available"}), 500


@app.route("/refresh")
def refresh():
    success = fetch_from_ree()
    if success:
        return jsonify({"status": "success", "message": "Data refreshed"})
    return jsonify({"status": "error", "message": "Failed to refresh"}), 500


@app.route("/prices/hour/<int:hour>")
def get_price_by_hour(hour):
    global cached_data

    if cached_data is None:
        fetch_from_ree()

    if cached_data:
        today = datetime.now().strftime("%Y-%m-%d")
        hour_prices = [
            p for p in cached_data["prices"] if p["date"] == today and p["hour"] == hour
        ]

        if hour_prices:
            return jsonify(hour_prices[0])

    return jsonify({"error": "No data for this hour"}), 404


if __name__ == "__main__":
    print("Iniciando servidor Precio Luz API...")
    print("Obteniendo datos iniciales de REE...")
    fetch_from_ree()
    print(
        f"Datos cargados: {len(cached_data['prices']) if cached_data else 0} registros"
    )
    print("\nServidor ejecutándose en http://localhost:5000")
    print("Presiona Ctrl+C para detener\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
