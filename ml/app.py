#!/usr/bin/env python3
"""
AI-Enhanced Admission Management System - ML Flask Inference Server
Author: Senior AI & ML Architect
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'admission_model.joblib')

# Attempt model load fallback dynamically
try:
    if not os.path.exists(MODEL_PATH):
        print("[Flask Server] Saved model not found. Running training process locally...")
        from train import train_eval_logistic_regression
        train_eval_logistic_regression()
        
    model_pipeline = joblib.load(MODEL_PATH)
    print(f"[Flask Server] Scikit-learn Logistic Regression Pipeline successfully loaded from '{MODEL_PATH}'")
except Exception as e:
    print(f"[Flask Server Error] Failed to load model workspace: {e}")
    model_pipeline = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model_pipeline is not None,
        "engine": "Scikit-learn Logistic Regression"
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model_pipeline is None:
        return jsonify({"error": "Model engine uninitialized or offline. Train first."}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Empty body payload"}), 400

        # Required fields check
        required_fields = [
            'tenth_percentage', 'twelfth_percentage', 'cgpa', 
            'entrance_score', 'attendance_percentage', 
            'extracurricular_score', 'prev_academic_performance', 'category'
        ]
        
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"error": f"Missing parameters: {missing}"}), 400

        # Extract rows
        row = {
            'tenth_percentage': float(data['tenth_percentage']),
            'twelfth_percentage': float(data['twelfth_percentage']),
            'cgpa': float(data['cgpa']),
            'entrance_score': float(data['entrance_score']),
            'attendance_percentage': float(data['attendance_percentage']),
            'extracurricular_score': int(data['extracurricular_score']),
            'prev_academic_performance': str(data['prev_academic_performance']),
            'category': str(data['category'])
        }

        # Convert to pandas DataFrame for standard preprocessing pipeline
        input_df = pd.DataFrame([row])
        
        # Predict class and probabilities
        class_pred = int(model_pipeline.predict(input_df)[0])
        probs = model_pipeline.predict_proba(input_df)[0]
        probability = float(probs[1]) # probability of class 1 (eligible)

        return jsonify({
            "eligible": class_pred,
            "probability_score": round(probability, 4)
        })

    except ValueError as val_err:
        return jsonify({"error": f"Data conversion formatting error: {str(val_err)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Internal execution crash: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    host = os.getenv('HOST', '127.0.0.1')
    print(f"[Flask Server] Hosting Machine Learning inference API on http://{host}:{port}")
    app.run(host=host, port=port, debug=False)
