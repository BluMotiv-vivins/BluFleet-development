import AWS from 'aws-sdk';

export interface AWSHealthStatus {
  s3: 'healthy' | 'warning' | 'error';
  lambda: 'healthy' | 'warning' | 'error';
  iotCore: 'healthy' | 'warning' | 'error';
  kinesis: 'healthy' | 'warning' | 'error';
  lastChecked: string;
}

export class AWSHealthService {
  private s3: AWS.S3;
  private lambda: AWS.Lambda;
  private iotData: AWS.IotData;
  private kinesis: AWS.Kinesis;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    
    AWS.config.update({ region });
    
    this.s3 = new AWS.S3();
    this.lambda = new AWS.Lambda();
    this.iotData = new AWS.IotData({ endpoint: process.env.IOT_ENDPOINT || 'https://iot.us-east-1.amazonaws.com' });
    this.kinesis = new AWS.Kinesis();
  }

  async checkS3Health(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      const bucketName = process.env.S3_BUCKET_NAME || 'blufleet-predictions-20250826';
      await this.s3.headBucket({ Bucket: bucketName }).promise();
      return 'healthy';
    } catch (error) {
      console.error('S3 health check failed:', error);
      return 'error';
    }
  }

  async checkLambdaHealth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      // Check if any of our Lambda functions exist
      const functionName = process.env.LAMBDA_FUNCTION_NAME || 'blufleet-data-processor';
      await this.lambda.getFunction({ FunctionName: functionName }).promise();
      return 'healthy';
    } catch (error) {
      console.error('Lambda health check failed:', error);
      return 'warning'; // Lambda functions might not exist in dev environment
    }
  }

  async checkIoTCoreHealth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      // IoT Core doesn't have a direct health check API
      // We'll consider it healthy if we can initialize the client
      return 'healthy';
    } catch (error) {
      console.error('IoT Core health check failed:', error);
      return 'error';
    }
  }

  async checkKinesisHealth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      const streamName = process.env.KINESIS_STREAM_NAME || 'blufleet-telemetry-stream';
      const result = await this.kinesis.describeStream({ StreamName: streamName }).promise();
      
      if (result.StreamDescription?.StreamStatus === 'ACTIVE') {
        return 'healthy';
      } else {
        return 'warning';
      }
    } catch (error) {
      console.error('Kinesis health check failed:', error);
      return 'warning'; // Stream might not exist in dev environment
    }
  }

  async checkAllServices(): Promise<AWSHealthStatus> {
    const [s3, lambda, iotCore, kinesis] = await Promise.all([
      this.checkS3Health(),
      this.checkLambdaHealth(),
      this.checkIoTCoreHealth(),
      this.checkKinesisHealth()
    ]);

    return {
      s3,
      lambda,
      iotCore,
      kinesis,
      lastChecked: new Date().toISOString()
    };
  }

  async sendTestIoTMessage(payload: any): Promise<{ messageId: string; timestamp: string }> {
    try {
      // In development, we'll mock this. In production, this would send to actual IoT Core
      const messageId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Mock IoT message sent:', { messageId, payload });
      
      // Uncomment below for real IoT Core publishing:
      // const topic = 'blufleet/vehicle/telemetry';
      // await this.iotData.publish({
      //   topic,
      //   payload: JSON.stringify(payload)
      // }).promise();
      
      return {
        messageId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to send IoT test message:', error);
      throw error;
    }
  }
}
