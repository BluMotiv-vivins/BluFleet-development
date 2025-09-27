#!/usr/bin/env python3
import json
import boto3
import uuid
from datetime import datetime
import time

# Initialize AWS clients
iot_client = boto3.client('iot-data')

def send_single_test_data():
    """Send a single test data point to AWS IoT Core"""
    
    # Generate a unique device ID for this test
    device_id = f"test_vehicle_{str(uuid.uuid4())[:8]}"
    
    # Create a test data point
    test_data = {
        "device_id": device_id,
        "cycle": 150,
        "frequency": 2.5,
        "Z_real": 0.25,
        "Z_imag": 0.35,
        "Z_mag": 0.43,
        "Z_phase_rad": 0.95,
        "rRUL": 200.5,
        "timestamp": datetime.utcnow().isoformat(),
        "test_id": str(uuid.uuid4())[:8]
    }
    
    print(f"Sending test data to IoT Core:")
    print(json.dumps(test_data, indent=2))
    
    # Send to IoT Core topic
    topic = "blufleet/vehicle/telemetry"
    
    try:
        # Publish to IoT Core
        response = iot_client.publish(
            topic=topic,
            qos=1,
            payload=json.dumps(test_data)
        )
        
        print(f"\nSuccessfully published to IoT Core topic '{topic}'")
        print(f"Response: {response}")
        print(f"\nData should flow through this pipeline:")
        print("IoT Core → Kinesis Stream → Lambda Function → S3 Buckets")
        print("\nWaiting 10 seconds for processing to complete...")
        time.sleep(10)
        
        # Construct the expected S3 path format
        now = datetime.utcnow()
        date_path = f"year={now.year}/month={now.strftime('%m')}/day={now.strftime('%d')}"
        
        print("\nCheck the following S3 locations for the processed data:")
        print(f"1. Raw data: s3://blufleet-data-lake-20250826/raw/{date_path}/")
        print(f"2. Processed data: s3://blufleet-data-lake-20250826/processed/{date_path}/")
        print(f"3. Predictions CSV: s3://blufleet-predictions-20250826/predictions/{date_path}/")
        
        return device_id
    
    except Exception as e:
        print(f"Error sending data to IoT Core: {e}")
        return None

if __name__ == "__main__":
    print("Sending single test data to AWS IoT Core...")
    device_id = send_single_test_data()
    
    if device_id:
        print(f"\nTo check if the data was processed correctly, run the following commands:")
        print(f"\n# Check raw data files:")
        print(f"aws s3 ls s3://blufleet-data-lake-20250826/raw/ --recursive | grep {device_id}")
        print(f"\n# Check processed data files:")
        print(f"aws s3 ls s3://blufleet-data-lake-20250826/processed/ --recursive | grep {device_id}")
        print(f"\n# View the predictions CSV file:")
        print(f"aws s3 ls s3://blufleet-predictions-20250826/predictions/ --recursive")
    else:
        print("Failed to send test data.")
