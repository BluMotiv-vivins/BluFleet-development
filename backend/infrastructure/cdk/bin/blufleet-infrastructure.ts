#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BluFleetInfrastructureStack } from '../lib/blufleet-infrastructure-stack';

const app = new cdk.App();

// Get environment configuration
const environment = app.node.tryGetContext('environment') || 'dev';
const config = app.node.tryGetContext(environment) || {};

new BluFleetInfrastructureStack(app, `BluFleetStack-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment,
  config,
  description: `BluFleet EV Fleet Management System - ${environment.toUpperCase()} environment`
});
