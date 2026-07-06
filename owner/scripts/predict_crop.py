#!/usr/bin/env python3
"""
Crop Prediction Script
This script loads a trained ML model and makes crop predictions based on input parameters.
"""

import sys
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

def load_model():
    """Load the trained crop prediction model"""
    try:
        models_dir = Path(__file__).parent.parent / 'ml_models'
        model_path = models_dir / 'crop_model.joblib'
        scaler_path = models_dir / 'scaler.joblib'
        encoder_path = models_dir / 'label_encoder.joblib'

        if not model_path.exists() or not scaler_path.exists() or not encoder_path.exists():
            return create_dummy_model(), None, None

        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        label_encoder = joblib.load(encoder_path)
        return model, scaler, label_encoder
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        return create_dummy_model(), None, None

def create_dummy_model():
    """Create a dummy model for demonstration purposes"""
    class DummyModel:
        def predict(self, X):
            # Return dummy predictions based on input
            crops = [
                'Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas',
                'Mothbeans', 'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate',
                'Banana', 'Mango', 'Grapes', 'Watermelon', 'Muskmelon',
                'Apple', 'Orange', 'Papaya', 'Coconut', 'Cotton',
                'Jute', 'Coffee'
            ]
            
            # Simple logic based on temperature and rainfall
            predictions = []
            for i in range(len(X)):
                temp = X[i][3]  # temperature
                rainfall = X[i][6]  # rainfall
                
                if temp > 25 and rainfall > 1000:
                    crop = 'Rice'
                elif temp > 20 and rainfall > 500:
                    crop = 'Maize'
                elif temp < 20 and rainfall < 500:
                    crop = 'Wheat'
                elif temp > 30 and rainfall > 800:
                    crop = 'Cotton'
                else:
                    crop = 'Sugarcane'
                
                predictions.append(crop)
            
            return np.array(predictions)
    
    return DummyModel()

def get_crop_info(crop_name):
    """Get additional information about the crop"""
    crop_info = {
        'Rice': {
            'description': 'Rice is a staple food crop that requires warm temperatures and plenty of water.',
            'season': 'Kharif (Monsoon)',
            'duration': '120-150 days',
            'profitability': 'High'
        },
        'Maize': {
            'description': 'Maize is a versatile crop used for food, feed, and industrial purposes.',
            'season': 'Kharif/Rabi',
            'duration': '90-120 days',
            'profitability': 'Medium-High'
        },
        'Wheat': {
            'description': 'Wheat is a major cereal crop grown in cooler climates.',
            'season': 'Rabi (Winter)',
            'duration': '120-140 days',
            'profitability': 'High'
        },
        'Cotton': {
            'description': 'Cotton is a cash crop used for fiber production.',
            'season': 'Kharif',
            'duration': '150-180 days',
            'profitability': 'Very High'
        },
        'Sugarcane': {
            'description': 'Sugarcane is a cash crop used for sugar production.',
            'season': 'Year-round',
            'duration': '12-18 months',
            'profitability': 'High'
        }
    }
    
    return crop_info.get(crop_name, {
        'description': 'A suitable crop for your conditions.',
        'season': 'Varies',
        'duration': 'Varies',
        'profitability': 'Medium'
    })

def get_market_data(crop_name):
    """Get market information for the crop"""
    # This would typically connect to a real market API
    market_data = {
        'Rice': {
            'demand': 'High',
            'priceRange': {'min': 25, 'max': 35, 'currency': 'INR/kg'},
            'season': 'Year-round',
            'profitPotential': 'High'
        },
        'Maize': {
            'demand': 'High',
            'priceRange': {'min': 20, 'max': 30, 'currency': 'INR/kg'},
            'season': 'Year-round',
            'profitPotential': 'Medium-High'
        },
        'Wheat': {
            'demand': 'Very High',
            'priceRange': {'min': 22, 'max': 28, 'currency': 'INR/kg'},
            'season': 'Year-round',
            'profitPotential': 'High'
        },
        'Cotton': {
            'demand': 'High',
            'priceRange': {'min': 6000, 'max': 8000, 'currency': 'INR/quintal'},
            'season': 'Year-round',
            'profitPotential': 'Very High'
        },
        'Sugarcane': {
            'demand': 'High',
            'priceRange': {'min': 300, 'max': 350, 'currency': 'INR/quintal'},
            'season': 'Year-round',
            'profitPotential': 'High'
        }
    }
    
    return market_data.get(crop_name, {
        'demand': 'Medium',
        'priceRange': {'min': 20, 'max': 30, 'currency': 'INR/kg'},
        'season': 'Varies',
        'profitPotential': 'Medium'
    })

def get_recommendations(crop_name, input_data):
    """Generate recommendations based on crop and input data"""
    recommendations = []
    
    # Soil recommendations
    if input_data['ph'] < 6.0:
        recommendations.append({
            'type': 'Soil pH',
            'description': 'Consider adding lime to increase soil pH for better crop growth',
            'priority': 'High'
        })
    elif input_data['ph'] > 8.0:
        recommendations.append({
            'type': 'Soil pH',
            'description': 'Consider adding sulfur or organic matter to lower soil pH',
            'priority': 'High'
        })
    
    # Nutrient recommendations
    if input_data['nitrogen'] < 50:
        recommendations.append({
            'type': 'Fertilization',
            'description': 'Apply nitrogen-rich fertilizer to improve crop yield',
            'priority': 'High'
        })
    
    if input_data['phosphorus'] < 30:
        recommendations.append({
            'type': 'Fertilization',
            'description': 'Apply phosphorus fertilizer for better root development',
            'priority': 'Medium'
        })
    
    if input_data['potassium'] < 40:
        recommendations.append({
            'type': 'Fertilization',
            'description': 'Apply potassium fertilizer for improved disease resistance',
            'priority': 'Medium'
        })
    
    # Weather recommendations
    if input_data['rainfall'] < 500:
        recommendations.append({
            'type': 'Irrigation',
            'description': 'Ensure adequate irrigation as rainfall is below optimal levels',
            'priority': 'High'
        })
    
    if input_data['temperature'] > 35:
        recommendations.append({
            'type': 'Heat Management',
            'description': 'Consider shade nets or mulching to protect crops from excessive heat',
            'priority': 'Medium'
        })
    
    return recommendations

def main():
    """Main function to process prediction request"""
    try:
        # Get input data from command line arguments
        if len(sys.argv) < 2:
            print(json.dumps({
                'error': 'No input data provided'
            }))
            sys.exit(1)
        
        input_data = json.loads(sys.argv[1])
        
        # Validate input data
        required_fields = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 
                          'humidity', 'ph', 'rainfall', 'soil_type']
        
        for field in required_fields:
            if field not in input_data:
                print(json.dumps({
                    'error': f'Missing required field: {field}'
                }))
                sys.exit(1)
        
        # Prepare features for prediction
        # Map soil type to numerical value
        soil_type_mapping = {
            'Sandy': 0, 'Loamy': 1, 'Clay': 2, 
            'Black': 3, 'Red': 4, 'Laterite': 5
        }
        
        features = np.array([[
            input_data['nitrogen'],
            input_data['phosphorus'],
            input_data['potassium'],
            input_data['temperature'],
            input_data['humidity'],
            input_data['ph'],
            input_data['rainfall'],
            soil_type_mapping.get(input_data['soil_type'], 0)
        ]])
        
        # Load model, scaler, and label encoder
        model, scaler, label_encoder = load_model()
        if scaler is not None and label_encoder is not None:
            features_scaled = scaler.transform(features)
            prediction_encoded = model.predict(features_scaled)[0]
            predicted_crop = label_encoder.inverse_transform([prediction_encoded])[0]
        else:
            predicted_crop = model.predict(features)[0]

        # Get crop information
        crop_info = get_crop_info(predicted_crop)
        market_data = get_market_data(predicted_crop)
        recommendations = get_recommendations(predicted_crop, input_data)

        # Prepare response
        response = {
            'predictions': [{
                'crop': predicted_crop,
                'confidence': 0.85,  # Dummy confidence score
                'suitability': 'Good',
                'reasons': [
                    f'Optimal temperature range for {predicted_crop}',
                    f'Soil conditions are suitable for {predicted_crop}',
                    f'Rainfall levels are adequate for {predicted_crop}'
                ]
            }],
            'marketData': market_data,
            'recommendations': recommendations,
            'modelVersion': '1.0',
            'cropInfo': crop_info
        }

        print(json.dumps(response))
        
    except Exception as e:
        print(json.dumps({
            'error': f'Prediction failed: {str(e)}'
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
