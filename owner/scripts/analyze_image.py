#!/usr/bin/env python3
"""
Crop Image Analysis Script
This script analyzes crop images for pest/disease detection using computer vision.
"""

import sys
import json
import requests
import numpy as np
from PIL import Image
import io

def download_image(url):
    """Download image from URL"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content))
    except Exception as e:
        print(f"Error downloading image: {e}", file=sys.stderr)
        return None

def analyze_crop_image(image):
    """Analyze crop image for issues"""
    # This is a simplified analysis - in production, you would use a trained CNN model
    # For demonstration, we'll return mock results based on image properties
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Get image dimensions
    width, height = image.size
    
    # Convert to numpy array for analysis
    img_array = np.array(image)
    
    # Simple color analysis
    mean_colors = np.mean(img_array, axis=(0, 1))
    
    # Mock analysis based on color patterns
    detected_issues = []
    
    # Check for yellowing (potential nutrient deficiency)
    if mean_colors[1] > mean_colors[0] * 1.2:  # Green > Red
        detected_issues.append({
            'type': 'nutrient_deficiency',
            'name': 'Nitrogen Deficiency',
            'confidence': 0.75,
            'severity': 'Medium',
            'description': 'Yellowing of leaves indicates potential nitrogen deficiency',
            'recommendations': [
                'Apply nitrogen-rich fertilizer',
                'Check soil pH levels',
                'Consider organic compost'
            ],
            'treatmentOptions': [
                {
                    'name': 'Urea Application',
                    'description': 'Apply urea fertilizer at recommended rates',
                    'effectiveness': 'High',
                    'cost': 'Low'
                },
                {
                    'name': 'Organic Compost',
                    'description': 'Apply well-decomposed organic compost',
                    'effectiveness': 'Medium',
                    'cost': 'Low'
                }
            ]
        })
    
    # Check for brown spots (potential disease)
    if mean_colors[0] > mean_colors[1] * 1.1:  # Red > Green
        detected_issues.append({
            'type': 'disease',
            'name': 'Leaf Spot Disease',
            'confidence': 0.68,
            'severity': 'Low',
            'description': 'Brown spots on leaves may indicate fungal infection',
            'recommendations': [
                'Remove affected leaves',
                'Improve air circulation',
                'Apply fungicide if necessary'
            ],
            'treatmentOptions': [
                {
                    'name': 'Copper Fungicide',
                    'description': 'Apply copper-based fungicide',
                    'effectiveness': 'High',
                    'cost': 'Medium'
                },
                {
                    'name': 'Neem Oil',
                    'description': 'Apply neem oil as organic treatment',
                    'effectiveness': 'Medium',
                    'cost': 'Low'
                }
            ]
        })
    
    # Check for pest damage (irregular patterns)
    if width > 0 and height > 0:
        # Simple edge detection simulation
        edge_density = np.std(img_array) / 255.0
        
        if edge_density > 0.3:  # High variation might indicate pest damage
            detected_issues.append({
                'type': 'pest',
                'name': 'Aphid Infestation',
                'confidence': 0.62,
                'severity': 'Low',
                'description': 'Irregular leaf patterns may indicate pest damage',
                'recommendations': [
                    'Inspect plants regularly',
                    'Use beneficial insects',
                    'Apply insecticidal soap if needed'
                ],
                'treatmentOptions': [
                    {
                        'name': 'Insecticidal Soap',
                        'description': 'Apply insecticidal soap to affected areas',
                        'effectiveness': 'High',
                        'cost': 'Low'
                    },
                    {
                        'name': 'Ladybugs',
                        'description': 'Introduce ladybugs as natural predators',
                        'effectiveness': 'Medium',
                        'cost': 'Medium'
                    }
                ]
            })
    
    # If no issues detected, mark as healthy
    if not detected_issues:
        detected_issues.append({
            'type': 'healthy',
            'name': 'Healthy Plant',
            'confidence': 0.85,
            'severity': 'Low',
            'description': 'No visible signs of disease or pest damage',
            'recommendations': [
                'Continue current care practices',
                'Monitor regularly for any changes',
                'Maintain proper watering schedule'
            ],
            'treatmentOptions': []
        })
    
    return detected_issues

def determine_crop_type(image):
    """Determine crop type from image (simplified)"""
    # In production, this would use a trained classifier
    # For now, return a mock result
    crop_types = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato']
    return np.random.choice(crop_types)

def determine_growth_stage(image):
    """Determine growth stage from image (simplified)"""
    # In production, this would analyze plant size, leaf count, etc.
    growth_stages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Mature']
    return np.random.choice(growth_stages)

def calculate_overall_health(detected_issues):
    """Calculate overall plant health based on detected issues"""
    if not detected_issues:
        return 'Excellent', 0.95
    
    # Count issues by severity
    severity_scores = {'Low': 0.1, 'Medium': 0.3, 'High': 0.6, 'Critical': 0.9}
    total_severity = sum(severity_scores.get(issue['severity'], 0.1) for issue in detected_issues)
    
    # Calculate health score
    health_score = max(0, 1 - (total_severity / len(detected_issues)))
    
    # Determine health level
    if health_score >= 0.9:
        health_level = 'Excellent'
    elif health_score >= 0.7:
        health_level = 'Good'
    elif health_score >= 0.5:
        health_level = 'Fair'
    elif health_score >= 0.3:
        health_level = 'Poor'
    else:
        health_level = 'Critical'
    
    return health_level, health_score

def main():
    """Main function to process image analysis request"""
    try:
        # Get image URL from command line arguments
        if len(sys.argv) < 2:
            print(json.dumps({
                'error': 'No image URL provided'
            }))
            sys.exit(1)
        
        image_url = sys.argv[1]
        
        # Download and analyze image
        image = download_image(image_url)
        if image is None:
            print(json.dumps({
                'error': 'Failed to download or process image'
            }))
            sys.exit(1)
        
        # Analyze the image
        detected_issues = analyze_crop_image(image)
        crop_type = determine_crop_type(image)
        growth_stage = determine_growth_stage(image)
        overall_health, health_confidence = calculate_overall_health(detected_issues)
        
        # Prepare response
        response = {
            'analysis': {
                'detectedIssues': detected_issues,
                'cropType': crop_type,
                'growthStage': growth_stage,
                'overallHealth': overall_health,
                'confidence': health_confidence
            }
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        print(json.dumps({
            'error': f'Image analysis failed: {str(e)}'
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
