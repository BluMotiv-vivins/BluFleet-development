# FleetVolt Pro Infrastructure Configuration
# AWS Cloud-Native Microservices Architecture

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }

  backend "s3" {
    bucket         = "fleetvolt-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "fleetvolt-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "FleetVolt Pro"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "FleetVolt Team"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Local variables
locals {
  name_prefix = "fleetvolt-${var.environment}"
  
  common_tags = {
    Project     = "FleetVolt Pro"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  azs = slice(data.aws_availability_zones.available.names, 0, 3)
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  name_prefix = local.name_prefix
  cidr_block  = var.vpc_cidr
  azs         = local.azs
  
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = local.common_tags
}

# Security Groups
module "security_groups" {
  source = "./modules/security"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  
  tags = local.common_tags
}

# EKS Cluster
module "eks" {
  source = "./modules/eks"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  cluster_version = var.eks_cluster_version
  
  node_groups = {
    main = {
      instance_types = ["t3.medium", "t3.large"]
      capacity_type  = "ON_DEMAND"
      min_size       = 2
      max_size       = 10
      desired_size   = 3
    }
    
    spot = {
      instance_types = ["t3.medium", "t3.large", "t3.xlarge"]
      capacity_type  = "SPOT"
      min_size       = 0
      max_size       = 20
      desired_size   = 2
    }
  }

  tags = local.common_tags
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.database_subnet_ids
  
  engine_version = var.rds_engine_version
  instance_class = var.rds_instance_class
  allocated_storage = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  
  database_name = "fleetvolt_pro"
  master_username = var.rds_master_username
  
  backup_retention_period = 7
  backup_window = "03:00-04:00"
  maintenance_window = "sun:04:00-sun:05:00"
  
  multi_az = var.environment == "production"
  
  security_group_ids = [module.security_groups.rds_security_group_id]

  tags = local.common_tags
}

# ElastiCache Redis
module "redis" {
  source = "./modules/redis"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  node_type = var.redis_node_type
  num_cache_nodes = var.redis_num_nodes
  
  security_group_ids = [module.security_groups.redis_security_group_id]

  tags = local.common_tags
}

# Amazon MSK (Kafka)
module "msk" {
  source = "./modules/msk"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  kafka_version = var.msk_kafka_version
  instance_type = var.msk_instance_type
  
  security_group_ids = [module.security_groups.msk_security_group_id]

  tags = local.common_tags
}

# Amazon Timestream
module "timestream" {
  source = "./modules/timestream"

  name_prefix = local.name_prefix
  
  database_name = "fleetvolt_telemetry"
  
  tables = {
    vehicle_telemetry = {
      retention_properties = {
        memory_store_retention_period_in_hours = 24
        magnetic_store_retention_period_in_days = 365
      }
    }
    
    charging_telemetry = {
      retention_properties = {
        memory_store_retention_period_in_hours = 24
        magnetic_store_retention_period_in_days = 365
      }
    }
  }

  tags = local.common_tags
}

# DynamoDB Tables
module "dynamodb" {
  source = "./modules/dynamodb"

  name_prefix = local.name_prefix
  
  tables = {
    alerts = {
      hash_key = "id"
      range_key = "timestamp"
      attributes = [
        {
          name = "id"
          type = "S"
        },
        {
          name = "timestamp"
          type = "S"
        },
        {
          name = "tenant_id"
          type = "S"
        },
        {
          name = "entity_type"
          type = "S"
        }
      ]
      global_secondary_indexes = [
        {
          name = "tenant-timestamp-index"
          hash_key = "tenant_id"
          range_key = "timestamp"
          projection_type = "ALL"
        },
        {
          name = "entity-type-index"
          hash_key = "entity_type"
          range_key = "timestamp"
          projection_type = "ALL"
        }
      ]
    }
    
    events = {
      hash_key = "aggregate_id"
      range_key = "event_version"
      attributes = [
        {
          name = "aggregate_id"
          type = "S"
        },
        {
          name = "event_version"
          type = "N"
        },
        {
          name = "tenant_id"
          type = "S"
        }
      ]
      global_secondary_indexes = [
        {
          name = "tenant-timestamp-index"
          hash_key = "tenant_id"
          range_key = "timestamp"
          projection_type = "ALL"
        }
      ]
    }
  }

  tags = local.common_tags
}

# S3 Buckets
module "s3" {
  source = "./modules/s3"

  name_prefix = local.name_prefix
  
  buckets = {
    documents = {
      versioning = true
      encryption = true
      lifecycle_rules = [
        {
          id = "delete_old_versions"
          status = "Enabled"
          noncurrent_version_expiration = {
            days = 90
          }
        }
      ]
    }
    
    backups = {
      versioning = true
      encryption = true
      lifecycle_rules = [
        {
          id = "transition_to_ia"
          status = "Enabled"
          transition = {
            days = 30
            storage_class = "STANDARD_IA"
          }
        },
        {
          id = "transition_to_glacier"
          status = "Enabled"
          transition = {
            days = 90
            storage_class = "GLACIER"
          }
        }
      ]
    }
    
    logs = {
      versioning = false
      encryption = true
      lifecycle_rules = [
        {
          id = "delete_old_logs"
          status = "Enabled"
          expiration = {
            days = 365
          }
        }
      ]
    }
  }

  tags = local.common_tags
}

# API Gateway
module "api_gateway" {
  source = "./modules/api_gateway"

  name_prefix = local.name_prefix
  
  stage_name = var.environment
  
  # Custom domain configuration
  domain_name = var.api_domain_name
  certificate_arn = var.api_certificate_arn
  
  # Rate limiting
  throttle_burst_limit = var.api_throttle_burst_limit
  throttle_rate_limit = var.api_throttle_rate_limit

  tags = local.common_tags
}

# Lambda Functions
module "lambda" {
  source = "./modules/lambda"

  name_prefix = local.name_prefix
  
  functions = {
    telemetry_processor = {
      filename = "telemetry_processor.zip"
      handler = "index.handler"
      runtime = "nodejs18.x"
      timeout = 30
      memory_size = 512
      environment_variables = {
        TIMESTREAM_DATABASE = module.timestream.database_name
        TIMESTREAM_TABLE = "vehicle_telemetry"
      }
    }
    
    alert_processor = {
      filename = "alert_processor.zip"
      handler = "index.handler"
      runtime = "nodejs18.x"
      timeout = 30
      memory_size = 256
      environment_variables = {
        DYNAMODB_TABLE = module.dynamodb.table_names["alerts"]
        SNS_TOPIC_ARN = module.sns.topic_arns["alerts"]
      }
    }
  }

  tags = local.common_tags
}

# SNS Topics
module "sns" {
  source = "./modules/sns"

  name_prefix = local.name_prefix
  
  topics = {
    alerts = {
      display_name = "FleetVolt Pro Alerts"
    }
    
    notifications = {
      display_name = "FleetVolt Pro Notifications"
    }
  }

  tags = local.common_tags
}

# SQS Queues
module "sqs" {
  source = "./modules/sqs"

  name_prefix = local.name_prefix
  
  queues = {
    telemetry_processing = {
      visibility_timeout_seconds = 300
      message_retention_seconds = 1209600 # 14 days
      max_message_size = 262144 # 256 KB
      delay_seconds = 0
      receive_wait_time_seconds = 20
      redrive_policy = {
        deadLetterTargetArn = "telemetry_processing_dlq"
        maxReceiveCount = 3
      }
    }
    
    alert_processing = {
      visibility_timeout_seconds = 60
      message_retention_seconds = 1209600 # 14 days
      max_message_size = 262144 # 256 KB
      delay_seconds = 0
      receive_wait_time_seconds = 20
      redrive_policy = {
        deadLetterTargetArn = "alert_processing_dlq"
        maxReceiveCount = 3
      }
    }
  }

  tags = local.common_tags
}

# CloudWatch
module "cloudwatch" {
  source = "./modules/cloudwatch"

  name_prefix = local.name_prefix
  
  log_groups = {
    api_gateway = {
      retention_in_days = 30
    }
    
    eks_cluster = {
      retention_in_days = 30
    }
    
    lambda_functions = {
      retention_in_days = 14
    }
  }
  
  alarms = {
    high_error_rate = {
      alarm_description = "High error rate detected"
      metric_name = "ErrorRate"
      namespace = "AWS/ApiGateway"
      statistic = "Average"
      period = 300
      evaluation_periods = 2
      threshold = 5
      comparison_operator = "GreaterThanThreshold"
    }
    
    high_latency = {
      alarm_description = "High latency detected"
      metric_name = "Latency"
      namespace = "AWS/ApiGateway"
      statistic = "Average"
      period = 300
      evaluation_periods = 2
      threshold = 5000
      comparison_operator = "GreaterThanThreshold"
    }
  }

  tags = local.common_tags
}

# IAM Roles and Policies
module "iam" {
  source = "./modules/iam"

  name_prefix = local.name_prefix
  
  # EKS service roles
  eks_cluster_role_arn = module.eks.cluster_role_arn
  eks_node_group_role_arn = module.eks.node_group_role_arn
  
  # Lambda execution roles
  lambda_function_names = keys(module.lambda.function_names)
  
  # Service-specific policies
  timestream_database_arn = module.timestream.database_arn
  dynamodb_table_arns = values(module.dynamodb.table_arns)
  s3_bucket_arns = values(module.s3.bucket_arns)

  tags = local.common_tags
}

# Secrets Manager
module "secrets" {
  source = "./modules/secrets"

  name_prefix = local.name_prefix
  
  secrets = {
    database_credentials = {
      description = "RDS database credentials"
      secret_string = jsonencode({
        username = var.rds_master_username
        password = random_password.rds_password.result
        engine = "postgres"
        host = module.rds.endpoint
        port = 5432
        dbname = "fleetvolt_pro"
      })
    }
    
    jwt_secrets = {
      description = "JWT signing secrets"
      secret_string = jsonencode({
        access_token_secret = random_password.jwt_access_secret.result
        refresh_token_secret = random_password.jwt_refresh_secret.result
      })
    }
    
    external_api_keys = {
      description = "External API keys and credentials"
      secret_string = jsonencode({
        mapbox_api_key = var.mapbox_api_key
        weather_api_key = var.weather_api_key
        sms_api_key = var.sms_api_key
      })
    }
  }

  tags = local.common_tags
}

# Random passwords
resource "random_password" "rds_password" {
  length  = 32
  special = true
}

resource "random_password" "jwt_access_secret" {
  length  = 64
  special = true
}

resource "random_password" "jwt_refresh_secret" {
  length  = 64
  special = true
}

# Route53 DNS
module "route53" {
  source = "./modules/route53"
  count  = var.create_dns_records ? 1 : 0

  domain_name = var.domain_name
  api_domain_name = var.api_domain_name
  
  api_gateway_domain_name = module.api_gateway.domain_name
  api_gateway_hosted_zone_id = module.api_gateway.hosted_zone_id
  
  cloudfront_domain_name = var.cloudfront_domain_name
  cloudfront_hosted_zone_id = var.cloudfront_hosted_zone_id

  tags = local.common_tags
}

# WAF
module "waf" {
  source = "./modules/waf"

  name_prefix = local.name_prefix
  
  # Associate with API Gateway
  resource_arn = module.api_gateway.arn
  
  # Rate limiting rules
  rate_limit_rules = {
    general = {
      limit = 2000
      period = 300 # 5 minutes
    }
    
    auth = {
      limit = 100
      period = 300 # 5 minutes
    }
  }
  
  # IP whitelist/blacklist
  ip_whitelist = var.ip_whitelist
  ip_blacklist = var.ip_blacklist

  tags = local.common_tags
}