import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface BluFleetInfrastructureStackProps extends cdk.StackProps {
  environment: string;
  config: any;
}

export class BluFleetInfrastructureStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly database: rds.DatabaseInstance;
  public readonly timestreamDatabase: timestream.CfnDatabase;
  public readonly api: apigateway.RestApi;
  public readonly iotRule: iot.CfnTopicRule;

  constructor(scope: Construct, id: string, props: BluFleetInfrastructureStackProps) {
    super(scope, id, props);

    const { environment, config } = props;

    // =============================================
    // VPC AND NETWORKING
    // =============================================

    this.vpc = new ec2.Vpc(this, 'BluFleetVpc', {
      maxAzs: 3,
      natGateways: environment === 'prod' ? 3 : 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'Database',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // VPC Endpoints for AWS services
    this.vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    });

    // =============================================
    // SECURITY GROUPS
    // =============================================

    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for RDS PostgreSQL database',
      allowAllOutbound: false,
    });

    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Lambda functions',
    });

    const redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ElastiCache Redis',
      allowAllOutbound: false,
    });

    // Allow Lambda to connect to database
    databaseSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Lambda to connect to PostgreSQL'
    );

    // Allow Lambda to connect to Redis
    redisSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(6379),
      'Allow Lambda to connect to Redis'
    );

    // =============================================
    // DATABASE SECRETS
    // =============================================

    const databaseCredentials = new secretsmanager.Secret(this, 'DatabaseCredentials', {
      description: 'Credentials for BluFleet PostgreSQL database',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'blufleet_admin' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\\'',
        passwordLength: 32,
      },
    });

    // =============================================
    // RDS POSTGRESQL DATABASE
    // =============================================

    const databaseSubnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
      vpc: this.vpc,
      description: 'Subnet group for BluFleet RDS database',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    this.database = new rds.DatabaseInstance(this, 'BluFleetDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_3,
      }),
      instanceType: environment === 'prod' 
        ? ec2.InstanceType.of(ec2.InstanceClass.R6G, ec2.InstanceSize.XLARGE)
        : ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromSecret(databaseCredentials),
      vpc: this.vpc,
      subnetGroup: databaseSubnetGroup,
      securityGroups: [databaseSecurityGroup],
      databaseName: 'blufleet',
      allocatedStorage: environment === 'prod' ? 500 : 20,
      maxAllocatedStorage: environment === 'prod' ? 1000 : 100,
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      multiAz: environment === 'prod',
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(environment === 'prod' ? 30 : 7),
      deletionProtection: environment === 'prod',
      enablePerformanceInsights: true,
      performanceInsightRetention: environment === 'prod' 
        ? rds.PerformanceInsightRetention.LONG_TERM 
        : rds.PerformanceInsightRetention.DEFAULT,
      cloudwatchLogsExports: ['postgresql'],
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this,
        'PostgresParameterGroup',
        'default.postgres15'
      ),
    });

    // =============================================
    // ELASTICACHE REDIS
    // =============================================

    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for BluFleet Redis cache',
      subnetIds: this.vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }).subnetIds,
    });

    const redisCluster = new elasticache.CfnCacheCluster(this, 'BluFleetRedisCluster', {
      cacheNodeType: environment === 'prod' ? 'cache.r7g.large' : 'cache.t4g.micro',
      engine: 'redis',
      engineVersion: '7.0',
      numCacheNodes: 1,
      cacheSubnetGroupName: redisSubnetGroup.ref,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
      transitEncryptionEnabled: true,
      atRestEncryptionEnabled: true,
    });

    // =============================================
    // TIMESTREAM DATABASE
    // =============================================

    this.timestreamDatabase = new timestream.CfnDatabase(this, 'BluFleetTimestreamDB', {
      databaseName: 'blufleet_telemetry',
    });

    const timestreamTable = new timestream.CfnTable(this, 'VehicleTelemetryTable', {
      databaseName: this.timestreamDatabase.ref,
      tableName: 'vehicle_telemetry',
      retentionProperties: {
        MemoryStoreRetentionPeriodInHours: 24,
        MagneticStoreRetentionPeriodInDays: environment === 'prod' ? 2555 : 365, // 7 years for prod, 1 year for dev
      },
    });

    // =============================================
    // S3 BUCKETS
    // =============================================

    const dataBucket = new s3.Bucket(this, 'BluFleetDataBucket', {
      bucketName: `blufleet-data-${environment}-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [
        {
          id: 'TransitionToIA',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
            {
              storageClass: s3.StorageClass.DEEP_ARCHIVE,
              transitionAfter: cdk.Duration.days(365),
            },
          ],
        },
      ],
    });

    // =============================================
    // KINESIS DATA STREAMS
    // =============================================

    const telemetryStream = new kinesis.Stream(this, 'TelemetryDataStream', {
      streamName: `blufleet-telemetry-${environment}`,
      shardCount: environment === 'prod' ? 5 : 1,
      retentionPeriod: cdk.Duration.days(7),
      encryption: kinesis.StreamEncryption.MANAGED,
    });

    // =============================================
    // IOT CORE SETUP
    // =============================================

    // IoT Thing Type for vehicles
    const vehicleThingType = new iot.CfnThingType(this, 'VehicleThingType', {
      thingTypeName: 'BluFleetVehicle',
      thingTypeDescription: 'Thing type for BluFleet EV vehicles',
      thingTypeProperties: {
        description: 'Electric vehicle in BluFleet management system',
        searchableAttributes: ['make', 'model', 'vin', 'fleet_id'],
      },
    });

    // IoT Rule to process telemetry data
    this.iotRule = new iot.CfnTopicRule(this, 'TelemetryProcessingRule', {
      ruleName: `blufleet_telemetry_${environment}`,
      topicRulePayload: {
        description: 'Process vehicle telemetry data and route to Kinesis',
        sql: "SELECT *, topic() as topic, timestamp() as aws_timestamp FROM 'blufleet/telemetry/+'",
        ruleDisabled: false,
        actions: [
          {
            kinesis: {
              streamName: telemetryStream.streamName,
              partitionKey: '${vehicle_id}',
              roleArn: '', // Will be set after creating IAM role
            },
          },
        ],
      },
    });

    // =============================================
    // LAMBDA LAYERS
    // =============================================

    const postgresLayer = new lambda.LayerVersion(this, 'PostgresLayer', {
      code: lambda.Code.fromAsset('lambda-layers/postgres'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'PostgreSQL client library for Lambda functions',
    });

    const commonLayer = new lambda.LayerVersion(this, 'CommonLayer', {
      code: lambda.Code.fromAsset('lambda-layers/common'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Common utilities and AWS SDK for Lambda functions',
    });

    // =============================================
    // IAM ROLES
    // =============================================

    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
      inlinePolicies: {
        TimestreamAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'timestream:DescribeEndpoints',
                'timestream:Select',
                'timestream:WriteRecords',
              ],
              resources: [
                timestreamTable.attrArn,
                this.timestreamDatabase.attrArn,
              ],
            }),
          ],
        }),
        SecretsManagerAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'secretsmanager:GetSecretValue',
              ],
              resources: [databaseCredentials.secretArn],
            }),
          ],
        }),
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
              ],
              resources: [`${dataBucket.bucketArn}/*`],
            }),
          ],
        }),
      },
    });

    const iotRuleRole = new iam.Role(this, 'IoTRuleRole', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
      inlinePolicies: {
        KinesisAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'kinesis:PutRecord',
                'kinesis:PutRecords',
              ],
              resources: [telemetryStream.streamArn],
            }),
          ],
        }),
      },
    });

    // Update IoT rule with role ARN
    const cfnTopicRule = this.iotRule.node.defaultChild as iot.CfnTopicRule;
    cfnTopicRule.addOverride('Properties.TopicRulePayload.Actions.0.Kinesis.RoleArn', iotRuleRole.roleArn);

    // =============================================
    // LAMBDA FUNCTIONS
    // =============================================

    const environmentVariables = {
      NODE_ENV: environment,
      DB_HOST: this.database.instanceEndpoint.hostname,
      DB_PORT: '5432',
      DB_NAME: 'blufleet',
      DB_SECRET_ARN: databaseCredentials.secretArn,
      TIMESTREAM_DATABASE: this.timestreamDatabase.ref,
      TIMESTREAM_TABLE: timestreamTable.ref,
      REDIS_HOST: redisCluster.attrRedisEndpointAddress,
      REDIS_PORT: '6379',
      S3_BUCKET: dataBucket.bucketName,
      ENVIRONMENT: environment,
    };

    // Vehicle Management Lambda
    const vehicleHandler = new lambda.Function(this, 'VehicleHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'vehicles.handler',
      code: lambda.Code.fromAsset('../services/api-gateway/dist'),
      environment: environmentVariables,
      vpc: this.vpc,
      securityGroups: [lambdaSecurityGroup],
      layers: [postgresLayer, commonLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: environment === 'prod' ? 512 : 256,
      role: lambdaExecutionRole,
    });

    // Telemetry Processing Lambda
    const telemetryHandler = new lambda.Function(this, 'TelemetryHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'telemetry.handler',
      code: lambda.Code.fromAsset('../services/api-gateway/dist'),
      environment: environmentVariables,
      vpc: this.vpc,
      securityGroups: [lambdaSecurityGroup],
      layers: [postgresLayer, commonLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: environment === 'prod' ? 1024 : 512,
      role: lambdaExecutionRole,
    });

    // Analytics Lambda
    const analyticsHandler = new lambda.Function(this, 'AnalyticsHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'analytics.handler',
      code: lambda.Code.fromAsset('../services/api-gateway/dist'),
      environment: environmentVariables,
      vpc: this.vpc,
      securityGroups: [lambdaSecurityGroup],
      layers: [postgresLayer, commonLayer],
      timeout: cdk.Duration.seconds(60),
      memorySize: environment === 'prod' ? 1024 : 512,
      role: lambdaExecutionRole,
    });

    // Kinesis Stream Processor Lambda
    const streamProcessor = new lambda.Function(this, 'StreamProcessor', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'stream-processor.handler',
      code: lambda.Code.fromAsset('../services/stream-processor/dist'),
      environment: environmentVariables,
      vpc: this.vpc,
      securityGroups: [lambdaSecurityGroup],
      layers: [postgresLayer, commonLayer],
      timeout: cdk.Duration.minutes(5),
      memorySize: environment === 'prod' ? 2048 : 1024,
      role: lambdaExecutionRole,
    });

    // Add Kinesis event source to stream processor
    streamProcessor.addEventSource(
      new lambda.EventSourceMapping(this, 'KinesisEventSource', {
        eventSourceArn: telemetryStream.streamArn,
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 100,
        maxBatchingWindow: cdk.Duration.seconds(5),
        parallelizationFactor: environment === 'prod' ? 10 : 2,
      })
    );

    // =============================================
    // API GATEWAY
    // =============================================

    this.api = new apigateway.RestApi(this, 'BluFleetApi', {
      restApiName: `BluFleet API - ${environment}`,
      description: `BluFleet EV Fleet Management API - ${environment} environment`,
      defaultCorsPreflightOptions: {
        allowOrigins: environment === 'prod' 
          ? ['https://blufleet.com', 'https://app.blufleet.com']
          : apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      },
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
    });

    // API Gateway Resources and Methods
    const apiV1 = this.api.root.addResource('api').addResource('v1');

    // Vehicles endpoints
    const vehiclesResource = apiV1.addResource('vehicles');
    vehiclesResource.addMethod('GET', new apigateway.LambdaIntegration(vehicleHandler));
    vehiclesResource.addMethod('POST', new apigateway.LambdaIntegration(vehicleHandler));

    const vehicleByIdResource = vehiclesResource.addResource('{vehicleId}');
    vehicleByIdResource.addMethod('GET', new apigateway.LambdaIntegration(vehicleHandler));
    vehicleByIdResource.addMethod('PUT', new apigateway.LambdaIntegration(vehicleHandler));
    vehicleByIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(vehicleHandler));

    // Telemetry endpoints
    const telemetryResource = apiV1.addResource('telemetry');
    telemetryResource.addMethod('POST', new apigateway.LambdaIntegration(telemetryHandler));

    const telemetryVehiclesResource = telemetryResource.addResource('vehicles');
    const telemetryVehicleByIdResource = telemetryVehiclesResource.addResource('{vehicleId}');
    
    telemetryVehicleByIdResource.addResource('latest')
      .addMethod('GET', new apigateway.LambdaIntegration(telemetryHandler));
    
    telemetryVehicleByIdResource.addResource('history')
      .addMethod('GET', new apigateway.LambdaIntegration(telemetryHandler));

    telemetryResource.addResource('fleet').addResource('realtime')
      .addMethod('GET', new apigateway.LambdaIntegration(telemetryHandler));

    // Analytics endpoints
    const analyticsResource = apiV1.addResource('analytics');
    analyticsResource.addResource('dashboard')
      .addMethod('GET', new apigateway.LambdaIntegration(analyticsHandler));
    
    analyticsResource.addResource('fleet-health')
      .addMethod('GET', new apigateway.LambdaIntegration(analyticsHandler));
    
    analyticsResource.addResource('energy-efficiency')
      .addMethod('GET', new apigateway.LambdaIntegration(analyticsHandler));

    // =============================================
    // CLOUDWATCH ALARMS AND MONITORING
    // =============================================

    // SNS Topic for alerts
    const alertsTopic = new sns.Topic(this, 'BluFleetAlerts', {
      displayName: `BluFleet Alerts - ${environment}`,
    });

    // Database connection alarm
    new cloudwatch.Alarm(this, 'DatabaseConnectionAlarm', {
      metric: this.database.metricDatabaseConnections(),
      threshold: 80,
      evaluationPeriods: 2,
      alarmDescription: 'Database connection count is high',
      alarmName: `BluFleet-${environment}-Database-Connections`,
    });

    // Lambda error alarms
    [vehicleHandler, telemetryHandler, analyticsHandler, streamProcessor].forEach((func, index) => {
      const functionNames = ['Vehicle', 'Telemetry', 'Analytics', 'StreamProcessor'];
      
      new cloudwatch.Alarm(this, `${functionNames[index]}ErrorAlarm`, {
        metric: func.metricErrors(),
        threshold: 5,
        evaluationPeriods: 2,
        alarmDescription: `${functionNames[index]} Lambda function error rate is high`,
        alarmName: `BluFleet-${environment}-${functionNames[index]}-Errors`,
      });
    });

    // =============================================
    // SSM PARAMETERS
    // =============================================

    new ssm.StringParameter(this, 'DatabaseEndpointParameter', {
      parameterName: `/blufleet/${environment}/database/endpoint`,
      stringValue: this.database.instanceEndpoint.hostname,
      description: 'BluFleet PostgreSQL database endpoint',
    });

    new ssm.StringParameter(this, 'ApiEndpointParameter', {
      parameterName: `/blufleet/${environment}/api/endpoint`,
      stringValue: this.api.url,
      description: 'BluFleet API Gateway endpoint',
    });

    new ssm.StringParameter(this, 'RedisEndpointParameter', {
      parameterName: `/blufleet/${environment}/redis/endpoint`,
      stringValue: redisCluster.attrRedisEndpointAddress,
      description: 'BluFleet Redis cache endpoint',
    });

    // =============================================
    // OUTPUTS
    // =============================================

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `BluFleet-${environment}-VpcId`,
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      description: 'PostgreSQL database endpoint',
      exportName: `BluFleet-${environment}-DatabaseEndpoint`,
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url,
      description: 'API Gateway endpoint',
      exportName: `BluFleet-${environment}-ApiEndpoint`,
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: redisCluster.attrRedisEndpointAddress,
      description: 'Redis cache endpoint',
      exportName: `BluFleet-${environment}-RedisEndpoint`,
    });

    new cdk.CfnOutput(this, 'TimestreamDatabase', {
      value: this.timestreamDatabase.ref,
      description: 'Timestream database name',
      exportName: `BluFleet-${environment}-TimestreamDatabase`,
    });

    new cdk.CfnOutput(this, 'DataBucket', {
      value: dataBucket.bucketName,
      description: 'S3 data bucket name',
      exportName: `BluFleet-${environment}-DataBucket`,
    });

    new cdk.CfnOutput(this, 'TelemetryStream', {
      value: telemetryStream.streamName,
      description: 'Kinesis telemetry stream name',
      exportName: `BluFleet-${environment}-TelemetryStream`,
    });
  }
}
