import AWS from 'aws-sdk';

export interface AWSHealthStatus {
  s3: 'healthy' | 'warning' | 'error';
  lambda: 'healthy' | 'warning' | 'error';
  iotCore: 'healthy' | 'warning' | 'error';
  kinesis: 'healthy' | 'warning' | 'error';
  timestamp: string;
}

export class AWSHealthService {
  private s3: AWS.S3;
  private lambda: AWS.Lambda;
  private iot: AWS.Iot;
  private kinesis: AWS.Kinesis;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    
    AWS.config.update({ region });
    
    this.s3 = new AWS.S3();
    this.lambda = new AWS.Lambda();
    this.iot = new AWS.Iot();
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

  async checkIoTHealth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      // List IoT things to check connectivity
      await this.iot.listThings({ maxResults: 1 }).promise();
      return 'healthy';
    } catch (error) {
      console.error('IoT health check failed:', error);
      return 'warning'; // IoT might not be configured in dev environment
    }
  }

  async checkKinesisHealth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      // List Kinesis streams to check connectivity
      await this.kinesis.listStreams({ Limit: 1 }).promise();
      return 'healthy';
    } catch (error) {
      console.error('Kinesis health check failed:', error);
      return 'warning'; // Kinesis might not be configured in dev environment
    }
  }

  async getOverallHealth(): Promise<AWSHealthStatus> {
    const [s3Health, lambdaHealth, iotHealth, kinesisHealth] = await Promise.all([
      this.checkS3Health(),
      this.checkLambdaHealth(),
      this.checkIoTHealth(),
      this.checkKinesisHealth()
    ]);

    return {
      s3: s3Health,
      lambda: lambdaHealth,
      iotCore: iotHealth,
      kinesis: kinesisHealth,
      timestamp: new Date().toISOString()
    };
  }
}

export const awsHealthService = new AWSHealthService();
