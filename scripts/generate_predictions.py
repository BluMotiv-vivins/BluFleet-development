#!/usr/bin/env python3
import csv
import random
from datetime import datetime, timedelta
import uuid

# Vehicle fleet data
vehicles = ['vehicle_001', 'vehicle_002', 'vehicle_003', 'vehicle_004', 'vehicle_005']
health_stages = ['healthy', 'warning', 'critical']

def generate_prediction_record(vehicle_id, timestamp):
    record_id = str(uuid.uuid4())[:8]
    cycle = random.randint(50, 300)
    frequency = round(random.uniform(1.0, 5.0), 2)
    z_real = round(random.uniform(0.1, 0.5), 10)
    z_imag = round(random.uniform(0.1, 0.5), 10)
    rrul = round(random.uniform(50.0, 500.0), 2)
    rul_prediction = round(random.uniform(20.0, 100.0), 2)
    
    # Health stage based on RUL prediction
    if rul_prediction > 80:
        health_stage = 'healthy'
    elif rul_prediction > 50:
        health_stage = 'warning'
    else:
        health_stage = 'critical'
    
    kinesis_stream = 'blufleet-live-stream'
    sagemaker_endpoint = 'blufleet-optimized-endpoint'
    lambda_request_id = str(uuid.uuid4())
    raw_data_location = f"raw/year={timestamp.year}/month={timestamp.month:02d}/day={timestamp.day:02d}/hour={timestamp.hour:02d}/{timestamp.strftime('%Y%m%d_%H%M%S')}_{record_id}.json"
    
    return {
        'record_id': record_id,
        'timestamp': timestamp.isoformat(),
        'device_id': vehicle_id,
        'cycle': cycle,
        'frequency': frequency,
        'z_real': z_real,
        'z_imag': z_imag,
        'rrul': rrul,
        'rul_prediction': rul_prediction,
        'health_stage': health_stage,
        'kinesis_stream': kinesis_stream,
        'sagemaker_endpoint': sagemaker_endpoint,
        'lambda_request_id': lambda_request_id,
        'raw_data_location': raw_data_location
    }

# Generate predictions for the last 7 days
start_date = datetime.now() - timedelta(days=7)
predictions = []

for day in range(7):
    current_date = start_date + timedelta(days=day)
    
    # Generate 10-20 predictions per day
    num_predictions = random.randint(10, 20)
    
    for _ in range(num_predictions):
        # Random hour and minute
        random_hour = random.randint(0, 23)
        random_minute = random.randint(0, 59)
        random_second = random.randint(0, 59)
        
        timestamp = current_date.replace(
            hour=random_hour, 
            minute=random_minute, 
            second=random_second,
            microsecond=random.randint(0, 999999)
        )
        
        vehicle_id = random.choice(vehicles)
        prediction = generate_prediction_record(vehicle_id, timestamp)
        predictions.append(prediction)

# Sort by timestamp
predictions.sort(key=lambda x: x['timestamp'])

# Write to CSV file
output_file = '/tmp/blufleet_predictions_enhanced.csv'
fieldnames = [
    'record_id', 'timestamp', 'device_id', 'cycle', 'frequency',
    'z_real', 'z_imag', 'rrul', 'rul_prediction', 'health_stage',
    'kinesis_stream', 'sagemaker_endpoint', 'lambda_request_id', 'raw_data_location'
]

with open(output_file, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(predictions)

print(f"Generated {len(predictions)} prediction records")
print(f"Output file: {output_file}")
print("Sample records:")
for i, pred in enumerate(predictions[:3]):
    print(f"{i+1}. Vehicle: {pred['device_id']}, Health: {pred['health_stage']}, RUL: {pred['rul_prediction']}")
