#!/usr/bin/env python3
"""
AI-Enhanced Admission Management System - ML Training Script
Author: Senior AI & ML Architect
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os

def create_synthetic_student_data(num_samples=1500):
    """
    Creates a logically distributed synthetic student admission history dataset
    """
    np.random.seed(42)
    
    # Generate independent numerical academic features
    tenth_percentage = np.random.uniform(50, 100, num_samples)
    twelfth_percentage = np.random.uniform(50, 100, num_samples)
    cgpa = np.random.uniform(5.0, 10.0, num_samples)
    entrance_score = np.random.uniform(40, 100, num_samples)
    attendance_percentage = np.random.uniform(60, 100, num_samples)
    extracurricular_score = np.random.randint(1, 100, num_samples)
    
    # Categorical progression history
    prev_academic_performance = np.random.choice(
        ['Excellent', 'Good', 'Average', 'Poor'], 
        size=num_samples, 
        p=[0.25, 0.45, 0.20, 0.10]
    )
    
    # Social and administrative categories
    category = np.random.choice(
        ['General', 'OBC', 'SC', 'ST'], 
        size=num_samples, 
        p=[0.40, 0.30, 0.20, 0.10]
    )
    
    # Formulate mathematical ground-truth separation plane mimicking real admission boundaries
    # Standardize numerical ranges first
    tenth_norm = (tenth_percentage - 50) / 50
    twelfth_norm = (twelfth_percentage - 50) / 50
    cgpa_norm = (cgpa - 5) / 5
    entrance_norm = (entrance_score - 40) / 60
    attendance_norm = (attendance_percentage - 60) / 40
    extracurricular_norm = extracurricular_score / 100
    
    performance_mapping = {'Excellent': 1.0, 'Good': 0.75, 'Average': 0.5, 'Poor': 0.2}
    perf_values = np.array([performance_mapping[p] for p in prev_academic_performance])
    
    # Score aggregation weight vectors
    aggregate_score = (
        0.15 * tenth_norm +
        0.25 * twelfth_norm +
        0.20 * cgpa_norm +
        0.25 * entrance_norm +
        0.05 * attendance_norm +
        0.10 * extracurricular_norm +
        0.05 * perf_values
    )
    
    # Label mapping (Score > threshold = Eligible)
    eligible = (aggregate_score > 0.35).astype(int)
    
    # Collect as a structure dataframe
    df = pd.DataFrame({
        'tenth_percentage': tenth_percentage,
        'twelfth_percentage': twelfth_percentage,
        'cgpa': cgpa,
        'entrance_score': entrance_score,
        'attendance_percentage': attendance_percentage,
        'extracurricular_score': extracurricular_score,
        'prev_academic_performance': prev_academic_performance,
        'category': category,
        'eligible': eligible
    })
    
    return df

def train_eval_logistic_regression():
    print("[ML Training] Creating synthetic student records dataset...")
    df = create_synthetic_student_data(1500)
    
    X = df.drop(columns=['eligible'])
    y = df['eligible']
    
    # Split into 80/20 train and test sheets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=101)
    
    numeric_features = [
        'tenth_percentage', 'twelfth_percentage', 'cgpa', 
        'entrance_score', 'attendance_percentage', 'extracurricular_score'
    ]
    categorical_features = ['prev_academic_performance', 'category']
    
    # Establish preprocessor pipelines for standard scaling & one-hot encoding
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    
    # Compile execution pipeline containing preprocessor and classifier
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(max_iter=1000, solver='lbfgs', random_state=42))
    ])
    
    print("[ML Training] Fitting Logistic Regression Model parameters...")
    pipeline.fit(X_train, y_train)
    
    # Model evaluation metrics
    predictions = pipeline.predict(X_test)
    acc = accuracy_score(y_test, predictions)
    prec = precision_score(y_test, predictions)
    rec = recall_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)
    
    print("\n==============================================")
    print("        SCIKIT-LEARN MODEL METRICS SUMMARY    ")
    print("==============================================")
    print(f"Accuracy Score  : {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision Score : {prec:.4f}")
    print(f"Recall (Sensitivity) : {rec:.4f}")
    print(f"F1-Score Metric : {f1:.4f}")
    print("==============================================\n")
    
    # Serialize pipeline using joblib for prediction service
    model_file_path = os.path.join(os.path.dirname(__file__), 'admission_model.joblib')
    joblib.dump(pipeline, model_file_path)
    print(f"[ML Training] Logistic Regression Model saved as '{model_file_path}'")

if __name__ == '__main__':
    train_eval_logistic_regression()
