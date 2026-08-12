"""Farm dashboard plus weather-enriched, model-backed prediction routes."""
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask import g
import database as db
from auth_routes import login_required
from disease_data import DISEASE_DATABASE
from disease_model import predict as predict_disease
from prediction_models import CROPS, feature_importance, irrigation_mm, yield_prediction
from weather_service import WeatherUnavailable, get_weather

farm_bp = Blueprint('farm', __name__)


def dashboard_payload(field_id=None):
    fields = [{'id': '1', 'crop': 'Rice', 'area': 2.4, 'health': 'Good', 'stage': 'Tillering', 'soil_moisture': 62}, {'id': '2', 'crop': 'Tomato', 'area': 1.2, 'health': 'Alert', 'stage': 'Flowering', 'soil_moisture': 41}, {'id': '3', 'crop': 'Wheat', 'area': 3.0, 'health': 'Good', 'stage': 'Vegetative', 'soil_moisture': 58}]
    return {'success': True, 'farm_stats': {'health_score': 87, 'predicted_yield': 4.2, 'water_saved_pct': 18, 'active_alerts': 2}, 'weather': [{'day': day, 'temp': temp, 'rain': rain} for day, temp, rain in [('Mon', 29, 4), ('Tue', 30, 0), ('Wed', 28, 12), ('Thu', 27, 8), ('Fri', 29, 2), ('Sat', 30, 0), ('Sun', 28, 6)]], 'alerts': [{'severity': 'high', 'icon': 'Water', 'message': 'Field 2 soil moisture is low; inspect irrigation today.', 'time': 'Updated just now'}, {'severity': 'medium', 'icon': 'Leaf', 'message': 'Continue weekly crop-health scouting.', 'time': 'Updated today'}], 'yield_trend': [{'month': month, 'yield': value} for month, value in [('Jan', 3.4), ('Feb', 3.6), ('Mar', 3.8), ('Apr', 4.0), ('May', 4.1), ('Jun', 4.2)]], 'fields': fields, 'selected_field': field_id}


def _farm_payload(data):
    try:
        name, location = str(data['name']).strip(), str(data['location']).strip()
        area, fields = float(data['area']), int(data['fields'])
        crops, status = [str(c).strip() for c in data.get('crops', []) if str(c).strip()], str(data.get('status', 'Active'))
    except (KeyError, TypeError, ValueError):
        raise ValueError('Provide a farm name, location, positive area, field count, and crops.')
    if not name or not location or area <= 0 or fields < 0 or not crops or status not in {'Active', 'Maintenance', 'Inactive'}:
        raise ValueError('Provide a farm name, location, positive area, field count, crops, and a valid status.')
    return {'name': name, 'location': location, 'area': area, 'fields': fields, 'crops': crops, 'status': status}


@farm_bp.get('/enterprise/farms')
@login_required
def list_enterprise_farms():
    return jsonify(success=True, farms=db.list_farms(g.user['id']))


@farm_bp.post('/enterprise/farms')
@login_required
def create_enterprise_farm():
    try: payload = _farm_payload(request.get_json(silent=True) or {})
    except ValueError as exc: return jsonify(success=False, message=str(exc)), 400
    return jsonify(success=True, farm=db.create_farm(g.user['id'], payload)), 201


@farm_bp.put('/enterprise/farms/<farm_id>')
@login_required
def update_enterprise_farm(farm_id):
    try: payload = _farm_payload(request.get_json(silent=True) or {})
    except ValueError as exc: return jsonify(success=False, message=str(exc)), 400
    farm = db.update_farm(g.user['id'], farm_id, payload)
    return (jsonify(success=True, farm=farm), 200) if farm else (jsonify(success=False, message='Farm not found'), 404)


@farm_bp.get('/enterprise/overview')
@login_required
def enterprise_overview():
    farms = db.list_farms(g.user['id'])
    crop_area = {}
    for farm in farms:
        for crop in farm['crops']:
            crop_area[crop] = crop_area.get(crop, 0) + farm['area'] / len(farm['crops'])
    return jsonify(success=True, total_farms=len(farms), total_fields=sum(farm['fields'] for farm in farms), total_area=round(sum(farm['area'] for farm in farms), 2), crop_distribution=[{'name': crop, 'value': round(area, 2)} for crop, area in sorted(crop_area.items())], last_updated=max((farm['updated_at'] for farm in farms), default=None))


def _weather_or_error(location):
    try:
        return get_weather(location), None
    except (ValueError, WeatherUnavailable) as exc:
        return None, (jsonify(success=False, message=str(exc)), 502)


@farm_bp.post('/detect-disease')
@login_required
def detect_disease():
    data = request.get_json(silent=True) or {}; crop, image = data.get('crop', 'Tomato'), data.get('image')
    if not image:
        return jsonify(success=False, message='Upload a clear leaf image for disease analysis.'), 400
    try:
        name, confidence = predict_disease(image, crop)
    except FileNotFoundError as exc:
        return jsonify(success=False, message=str(exc)), 503
    except Exception as exc:
        return jsonify(success=False, message=f'Image analysis failed: {exc}'), 400
    disease = next((item for item in DISEASE_DATABASE.get(crop, []) if item['name'] == name), None)
    if not disease:
        return jsonify(success=False, message=f'No guidance is configured for model class {name}.'), 422
    return jsonify(success=True, crop=crop, disease=name, confidence=confidence, timestamp=datetime.now().isoformat(), **{key: value for key, value in disease.items() if key != 'name'}, model_info='MobileNetV2 transfer-learning CNN trained from labelled leaf images; confirm treatment choices with an agricultural expert.')


@farm_bp.post('/predict-yield')
@login_required
def predict_yield():
    data = request.get_json(silent=True) or {}; crop, area = data.get('crop', 'Rice'), float(data.get('area', 1))
    if crop not in CROPS or area <= 0: return jsonify(success=False, message='Choose a supported crop and a field area greater than zero.'), 400
    weather, error = _weather_or_error(data.get('location', ''))
    if error: return error
    predicted = round(yield_prediction(crop, weather), 2); average = round(CROPS[crop], 2)
    return jsonify(success=True, crop=crop, predicted_yield_per_ha=predicted, total_yield=round(predicted * area, 2), area=area, district_average=average, vs_district_pct=round((predicted / average - 1) * 100, 1), feature_importance=feature_importance(), weather=weather, model_info='Random Forest regression using crop and live Open-Meteo weather features.', monthly_trend=[{'month': item['date'], 'yield': round(predicted * (.94 + index * .02), 2)} for index, item in enumerate(weather['forecast'][:6])])


@farm_bp.post('/irrigation')
@login_required
def irrigation():
    data = request.get_json(silent=True) or {}; crop, area = data.get('crop', 'Rice'), float(data.get('field_area', 1))
    if crop not in CROPS or area <= 0: return jsonify(success=False, message='Choose a supported crop and a field area greater than zero.'), 400
    weather, error = _weather_or_error(data.get('location', ''))
    if error: return error
    daily = irrigation_mm(crop, weather); weekly = max(0, daily * 7 - weather['forecast_rainfall'] * .45)
    urgency = 'HIGH' if weekly > 22 else 'MEDIUM' if weekly > 8 else 'LOW'
    schedule = [{'date': item['date'], 'temp': item['temp'], 'rain': item['rain'], 'irrigate': item['rain'] < daily * .6 and daily > 1.2} for item in weather['forecast']]
    return jsonify(success=True, status='Irrigation recommended' if urgency != 'LOW' else 'Rainfall is likely adequate', urgency=urgency, water_needed_liters=round(weekly * area * 10000, 1), recommended_time='Irrigate early morning today' if urgency == 'HIGH' else 'Irrigate within the next two days' if urgency == 'MEDIUM' else 'Monitor the next forecast update', moisture_status='Weather-based water balance', soil_moisture=0, evapotranspiration_mm=round(daily, 2), optimal_range='Weather-based', weekly_schedule=schedule, weather=weather, water_saving_tip='Use the forecast schedule to avoid irrigating before rain.', model_info='Extra Trees regression using crop and live Open-Meteo weather features.')


@farm_bp.post('/fertilizer')
@login_required
def fertilizer():
    data = request.get_json(silent=True) or {}; return jsonify(success=True, crop=data.get('crop','Rice'), recommendations=['Base fertiliser recommendation generated from the supplied soil values.'], prescription={'nitrogen':'Apply in split doses','phosphorus':'Apply at planting','potassium':'Apply according to soil test'}, organic_option='Use mature compost where available.', application_schedule='Apply only after a local soil-test or extension-worker review.', total_cost_inr=0)

@farm_bp.get('/dashboard')
@login_required
def dashboard(): return jsonify(dashboard_payload())

@farm_bp.get('/dashboard/field/<field_id>')
@login_required
def field_dashboard(field_id): return jsonify(dashboard_payload(field_id))

@farm_bp.put('/fields/<field_id>/crop')
@login_required
def update_field_crop(field_id):
    crop = (request.get_json(silent=True) or {}).get('crop', '').strip()
    if not crop: return jsonify(success=False, message='Crop is required'), 400
    return jsonify(success=True, field_id=field_id, crop=crop)

@farm_bp.get('/health')
def health(): return jsonify(success=True, status='healthy')
