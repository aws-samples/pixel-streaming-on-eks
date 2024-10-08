#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const eks_cluster_stack_1 = require("../lib/eks-cluster-stack");
const docker_image_stack_1 = require("../lib/docker-image-stack");
const app = new cdk.App();
const region = process.env.CDK_DEFAULT_REGION;
const prefix = 'UnrealPixelStreaming';
new eks_cluster_stack_1.EksClusterStack(app, prefix + 'EksClusterStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region },
});
new docker_image_stack_1.DockerImageStack(app, prefix + 'DockerImageStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5yZWFsLXBpeGVsLXN0cmVhbWluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVucmVhbC1waXhlbC1zdHJlYW1pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQW9DO0FBQ3BDLG1DQUFrQztBQUNsQyxnRUFBMEQ7QUFDMUQsa0VBQTREO0FBRTVELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ3pCLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQTtBQUMxQixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsQ0FBQTtBQUVyQyxJQUFJLG1DQUFlLENBQUMsR0FBRyxFQUFFLE1BQU0sR0FBRyxpQkFBaUIsRUFBRTtJQUNuRCxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLEVBQUU7Q0FDMUQsQ0FBQyxDQUFBO0FBRUYsSUFBSSxxQ0FBZ0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxHQUFHLGtCQUFrQixFQUFFO0lBQ3JELEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRTtDQUMxRCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcidcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IEVrc0NsdXN0ZXJTdGFjayB9IGZyb20gJy4uL2xpYi9la3MtY2x1c3Rlci1zdGFjaydcbmltcG9ydCB7IERvY2tlckltYWdlU3RhY2sgfSBmcm9tICcuLi9saWIvZG9ja2VyLWltYWdlLXN0YWNrJ1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpXG5jb25zdCByZWdpb24gPSAndXMtd2VzdC0yJ1xuY29uc3QgcHJlZml4ID0gJ1VucmVhbFBpeGVsU3RyZWFtaW5nJ1xuXG5uZXcgRWtzQ2x1c3RlclN0YWNrKGFwcCwgcHJlZml4ICsgJ0Vrc0NsdXN0ZXJTdGFjaycsIHtcbiAgZW52OiB7IGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsIHJlZ2lvbiB9LFxufSlcblxubmV3IERvY2tlckltYWdlU3RhY2soYXBwLCBwcmVmaXggKyAnRG9ja2VySW1hZ2VTdGFjaycsIHtcbiAgZW52OiB7IGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsIHJlZ2lvbiB9LFxufSlcbiJdfQ==