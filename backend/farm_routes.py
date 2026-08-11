"""Prediction and dashboard routes. These responses are demonstrative, not agronomic prescriptions."""
import random
from datetime import datetime
from flask import Blueprint, jsonify, request
from auth_routes import login_required
from disease_data import DISEASE_DATABASE

farm_bp = Blueprint('farm', __name__)


def dashboard_payload(field_id=None):
    """Return the complete shape consumed by the Dashboard page."""
    fields = [
        {'id': '1', 'crop': 'Rice', 'area': 2.4, 'health': 'Good', 'stage': 'Tillering', 'soil_moisture': 62},
        {'id': '2', 'crop': 'Tomato', 'area': 1.2, 'health': 'Alert', 'stage': 'Flowering', 'soil_moisture': 41},
        {'id': '3', 'crop': 'Wheat', 'area': 3.0, 'health': 'Good', 'stage': 'Vegetative', 'soil_moisture': 58},
    ]
    return {
        'success': True,
        'farm_stats': {'health_score': 87, 'predicted_yield': 4.2, 'water_saved_pct': 18, 'active_alerts': 2},
        'weather': [{'day': day, 'temp': temp, 'rain': rain} for day, temp, rain in [('Mon', 29, 4), ('Tue', 30, 0), ('Wed', 28, 12), ('Thu', 27, 8), ('Fri', 29, 2), ('Sat', 30, 0), ('Sun', 28, 6)]],
        'alerts': [
            {'severity': 'high', 'icon': '💧', 'message': 'Field 2 soil moisture is low; inspect irrigation today.', 'time': 'Updated just now'},
            {'severity': 'medium', 'icon': '🌿', 'message': 'Continue weekly crop-health scouting.', 'time': 'Updated today'},
        ],
        'yield_trend': [{'month': month, 'yield': value} for month, value in [('Jan', 3.4), ('Feb', 3.6), ('Mar', 3.8), ('Apr', 4.0), ('May', 4.1), ('Jun', 4.2)]],
        'fields': fields,
        'selected_field': field_id,
    }

@farm_bp.post('/detect-disease')
@login_required
def detect_disease():
    crop = (request.get_json(silent=True) or {}).get('crop', 'Tomato')
    options = DISEASE_DATABASE.get(crop, DISEASE_DATABASE['Tomato'])
    disease = random.choice(options)
    return jsonify(success=True, crop=crop, disease=disease['name'], confidence=round(random.uniform(75, 97), 1), timestamp=datetime.now().isoformat(), **{key: value for key, value in disease.items() if key != 'name'}, model_info='Demonstration classifier; confirm with a local agricultural expert.')

@farm_bp.post('/predict-yield')
@login_required
def predict_yield():
    data = request.get_json(silent=True) or {}; crop, area = data.get('crop', 'Rice'), float(data.get('area', 1))
    base = {'Rice':3.8, 'Wheat':4.2, 'Maize':5.1, 'Tomato':18.5, 'Cotton':1.8}.get(crop, 3.5); predicted = round(base * random.uniform(.85, 1.15), 2)
    return jsonify(success=True, crop=crop, predicted_yield_per_ha=predicted, total_yield=round(predicted * area, 2), area=area, district_average=round(base*.88, 2), vs_district_pct=round((predicted/base-.88)*100, 1), feature_importance={'Rainfall':82,'Soil Nitrogen':71,'Temperature':60}, monthly_trend=[{'month':m,'yield':round(predicted*(.75+i*.06),2)} for i,m in enumerate(['Jan','Feb','Mar','Apr','May','Jun'])])

@farm_bp.post('/irrigation')
@login_required
def irrigation():
    data = request.get_json(silent=True) or {}; moisture = float(data.get('soil_moisture', 45)); area = float(data.get('field_area', 1)); low = moisture < 50
    return jsonify(success=True, status='Irrigation recommended' if low else 'Moisture is adequate', urgency='HIGH' if moisture < 40 else 'MEDIUM' if low else 'LOW', water_needed_liters=round(max(0, 70-moisture)*area*100, 1), recommended_time='Today within 2 hours' if moisture < 40 else 'Monitor again tomorrow', moisture_status='Low' if low else 'Adequate', evapotranspiration_mm=4.2, optimal_range='50–70%', weekly_schedule=[])

@farm_bp.post('/fertilizer')
@login_required
def fertilizer():
    data = request.get_json(silent=True) or {}; return jsonify(success=True, crop=data.get('crop','Rice'), recommendations=['Base fertiliser recommendation generated from the supplied soil values.'], prescription={'nitrogen':'Apply in split doses','phosphorus':'Apply at planting','potassium':'Apply according to soil test'}, organic_option='Use mature compost where available.', application_schedule='Apply only after a local soil-test or extension-worker review.', total_cost_inr=0)

@farm_bp.get('/dashboard')
@login_required
def dashboard():
    return jsonify(dashboard_payload())

@farm_bp.get('/dashboard/field/<field_id>')
@login_required
def field_dashboard(field_id):
    """Return the same dashboard shape for a selected field."""
    return jsonify(dashboard_payload(field_id))

@farm_bp.put('/fields/<field_id>/crop')
@login_required
def update_field_crop(field_id):
    crop = (request.get_json(silent=True) or {}).get('crop', '').strip()
    if not crop:
        return jsonify(success=False, message='Crop is required'), 400
    return jsonify(success=True, field_id=field_id, crop=crop)

@farm_bp.get('/health')
def health():
    return jsonify(success=True, status='healthy')
