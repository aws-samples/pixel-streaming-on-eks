#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { EksClusterStack } from '../lib/eks-cluster-stack'
import { DockerImageStack } from '../lib/docker-image-stack'

const app = new cdk.App()
const prefix = 'UnrealPixelStreaming'

new EksClusterStack(app, prefix + 'EksClusterStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})

new DockerImageStack(app, prefix + 'DockerImageStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
