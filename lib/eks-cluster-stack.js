"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksClusterStack = void 0;
const cdk = require("aws-cdk-lib");
const eks = require("aws-cdk-lib/aws-eks");
const lambda_layer_kubectl_v24_1 = require("@aws-cdk/lambda-layer-kubectl-v24");
const ec2 = require("aws-cdk-lib/aws-ec2");
const iam = require("aws-cdk-lib/aws-iam");
class EksClusterStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // EKS Cluster
        const cluster = new eks.Cluster(this, 'EksCluster', {
            version: eks.KubernetesVersion.V1_24,
            kubectlLayer: new lambda_layer_kubectl_v24_1.KubectlV24Layer(this, 'KubectlLayer'),
            // Custom Node を使うので DefaultCapacity は 0 にしておく
            defaultCapacity: 0,
        });
        // Admin 用の IAM Role が EKS Cluster にアクセスできるよう aws-auth を設定
        // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_eks-readme.html#permissions-and-security
        const adminRole = iam.Role.fromRoleName(this, 'AdminRole', 'Admin');
        cluster.awsAuth.addMastersRole(adminRole);
        // User の場合
        // const User = iam.User.fromUserName(this, 'User', 'username')
        // cluster.awsAuth.addUserMapping(User, { groups: ['system:masters'] })
        const nodePortSecurityGroup = new ec2.SecurityGroup(this, 'NodePortSecurityGroup', {
            vpc: cluster.vpc,
        });
        nodePortSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcpRange(30000, 32767));
        // EBS を暗号化する LaunchTemplate
        const launchTemplate = new ec2.CfnLaunchTemplate(this, 'NodeLaunchTemplate', {
            launchTemplateData: {
                instanceType: 'g4dn.xlarge',
                securityGroupIds: [
                    cluster.clusterSecurityGroupId,
                    nodePortSecurityGroup.securityGroupId,
                ],
                blockDeviceMappings: [
                    {
                        deviceName: '/dev/xvda',
                        ebs: {
                            volumeType: 'gp2',
                            volumeSize: 100,
                            encrypted: true,
                        },
                    },
                ],
            },
        });
        // GPU Node を追加
        cluster.addNodegroupCapacity('GpuNodeGroup', {
            minSize: 2,
            amiType: eks.NodegroupAmiType.AL2_X86_64_GPU,
            launchTemplateSpec: {
                id: launchTemplate.ref,
                version: launchTemplate.attrLatestVersionNumber,
            },
            labels: {
                // aws-virtual-gpu-device-plugin 用の Label
                'k8s.amazonaws.com/accelerator': 'vgpu',
            },
            subnets: { subnetType: ec2.SubnetType.PUBLIC },
        });
        /*
        new eks.AlbController(this, 'AlbController', {
          cluster: cluster,
          version: eks.AlbControllerVersion.V2_4_1,
        });
         */
    }
}
exports.EksClusterStack = EksClusterStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzLWNsdXN0ZXItc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJla3MtY2x1c3Rlci1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBa0M7QUFFbEMsMkNBQTBDO0FBQzFDLGdGQUFtRTtBQUNuRSwyQ0FBMEM7QUFDMUMsMkNBQTBDO0FBRTFDLE1BQWEsZUFBZ0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUM1QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRXZCLGNBQWM7UUFDZCxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNsRCxPQUFPLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEtBQUs7WUFDcEMsWUFBWSxFQUFFLElBQUksMENBQWUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDO1lBQ3ZELDhDQUE4QztZQUM5QyxlQUFlLEVBQUUsQ0FBQztTQUNuQixDQUFDLENBQUE7UUFFRiwwREFBMEQ7UUFDMUQsdUdBQXVHO1FBQ3ZHLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDbkUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFekMsV0FBVztRQUNYLCtEQUErRDtRQUMvRCx1RUFBdUU7UUFFdkUsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQ2pELElBQUksRUFDSix1QkFBdUIsRUFDdkI7WUFDRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7U0FDakIsQ0FDRixDQUFBO1FBRUQscUJBQXFCLENBQUMsY0FBYyxDQUNsQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQ2hDLENBQUE7UUFFRCw0QkFBNEI7UUFDNUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQzlDLElBQUksRUFDSixvQkFBb0IsRUFDcEI7WUFDRSxrQkFBa0IsRUFBRTtnQkFDbEIsWUFBWSxFQUFFLGFBQWE7Z0JBQzNCLGdCQUFnQixFQUFFO29CQUNoQixPQUFPLENBQUMsc0JBQXNCO29CQUM5QixxQkFBcUIsQ0FBQyxlQUFlO2lCQUN0QztnQkFDRCxtQkFBbUIsRUFBRTtvQkFDbkI7d0JBQ0UsVUFBVSxFQUFFLFdBQVc7d0JBQ3ZCLEdBQUcsRUFBRTs0QkFDSCxVQUFVLEVBQUUsS0FBSzs0QkFDakIsVUFBVSxFQUFFLEdBQUc7NEJBQ2YsU0FBUyxFQUFFLElBQUk7eUJBQ2hCO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRixDQUNGLENBQUE7UUFFRCxlQUFlO1FBQ2YsT0FBTyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsRUFBRTtZQUMzQyxPQUFPLEVBQUUsQ0FBQztZQUNWLE9BQU8sRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsY0FBYztZQUM1QyxrQkFBa0IsRUFBRTtnQkFDbEIsRUFBRSxFQUFFLGNBQWMsQ0FBQyxHQUFHO2dCQUN0QixPQUFPLEVBQUUsY0FBYyxDQUFDLHVCQUF1QjthQUNoRDtZQUNELE1BQU0sRUFBRTtnQkFDTix5Q0FBeUM7Z0JBQ3pDLCtCQUErQixFQUFFLE1BQU07YUFDeEM7WUFDRCxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7U0FDL0MsQ0FBQyxDQUFBO1FBRUY7Ozs7O1dBS0c7SUFDTCxDQUFDO0NBQ0Y7QUFqRkQsMENBaUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cydcbmltcG9ydCAqIGFzIGVrcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJ1xuaW1wb3J0IHsgS3ViZWN0bFYyNExheWVyIH0gZnJvbSAnQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjI0J1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSdcblxuZXhwb3J0IGNsYXNzIEVrc0NsdXN0ZXJTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKVxuXG4gICAgLy8gRUtTIENsdXN0ZXJcbiAgICBjb25zdCBjbHVzdGVyID0gbmV3IGVrcy5DbHVzdGVyKHRoaXMsICdFa3NDbHVzdGVyJywge1xuICAgICAgdmVyc2lvbjogZWtzLkt1YmVybmV0ZXNWZXJzaW9uLlYxXzI0LFxuICAgICAga3ViZWN0bExheWVyOiBuZXcgS3ViZWN0bFYyNExheWVyKHRoaXMsICdLdWJlY3RsTGF5ZXInKSxcbiAgICAgIC8vIEN1c3RvbSBOb2RlIOOCkuS9v+OBhuOBruOBpyBEZWZhdWx0Q2FwYWNpdHkg44GvIDAg44Gr44GX44Gm44GK44GPXG4gICAgICBkZWZhdWx0Q2FwYWNpdHk6IDAsXG4gICAgfSlcblxuICAgIC8vIEFkbWluIOeUqOOBriBJQU0gUm9sZSDjgYwgRUtTIENsdXN0ZXIg44Gr44Ki44Kv44K744K544Gn44GN44KL44KI44GGIGF3cy1hdXRoIOOCkuioreWumlxuICAgIC8vIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9jZGsvYXBpL3YyL2RvY3MvYXdzLWNkay1saWIuYXdzX2Vrcy1yZWFkbWUuaHRtbCNwZXJtaXNzaW9ucy1hbmQtc2VjdXJpdHlcbiAgICBjb25zdCBhZG1pblJvbGUgPSBpYW0uUm9sZS5mcm9tUm9sZU5hbWUodGhpcywgJ0FkbWluUm9sZScsICdBZG1pbicpXG4gICAgY2x1c3Rlci5hd3NBdXRoLmFkZE1hc3RlcnNSb2xlKGFkbWluUm9sZSlcblxuICAgIC8vIFVzZXIg44Gu5aC05ZCIXG4gICAgLy8gY29uc3QgVXNlciA9IGlhbS5Vc2VyLmZyb21Vc2VyTmFtZSh0aGlzLCAnVXNlcicsICd1c2VybmFtZScpXG4gICAgLy8gY2x1c3Rlci5hd3NBdXRoLmFkZFVzZXJNYXBwaW5nKFVzZXIsIHsgZ3JvdXBzOiBbJ3N5c3RlbTptYXN0ZXJzJ10gfSlcblxuICAgIGNvbnN0IG5vZGVQb3J0U2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cChcbiAgICAgIHRoaXMsXG4gICAgICAnTm9kZVBvcnRTZWN1cml0eUdyb3VwJyxcbiAgICAgIHtcbiAgICAgICAgdnBjOiBjbHVzdGVyLnZwYyxcbiAgICAgIH1cbiAgICApXG5cbiAgICBub2RlUG9ydFNlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBlYzIuUGVlci5hbnlJcHY0KCksXG4gICAgICBlYzIuUG9ydC50Y3BSYW5nZSgzMDAwMCwgMzI3NjcpXG4gICAgKVxuXG4gICAgLy8gRUJTIOOCkuaal+WPt+WMluOBmeOCiyBMYXVuY2hUZW1wbGF0ZVxuICAgIGNvbnN0IGxhdW5jaFRlbXBsYXRlID0gbmV3IGVjMi5DZm5MYXVuY2hUZW1wbGF0ZShcbiAgICAgIHRoaXMsXG4gICAgICAnTm9kZUxhdW5jaFRlbXBsYXRlJyxcbiAgICAgIHtcbiAgICAgICAgbGF1bmNoVGVtcGxhdGVEYXRhOiB7XG4gICAgICAgICAgaW5zdGFuY2VUeXBlOiAnZzRkbi54bGFyZ2UnLFxuICAgICAgICAgIHNlY3VyaXR5R3JvdXBJZHM6IFtcbiAgICAgICAgICAgIGNsdXN0ZXIuY2x1c3RlclNlY3VyaXR5R3JvdXBJZCxcbiAgICAgICAgICAgIG5vZGVQb3J0U2VjdXJpdHlHcm91cC5zZWN1cml0eUdyb3VwSWQsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBibG9ja0RldmljZU1hcHBpbmdzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGRldmljZU5hbWU6ICcvZGV2L3h2ZGEnLFxuICAgICAgICAgICAgICBlYnM6IHtcbiAgICAgICAgICAgICAgICB2b2x1bWVUeXBlOiAnZ3AyJyxcbiAgICAgICAgICAgICAgICB2b2x1bWVTaXplOiAxMDAsXG4gICAgICAgICAgICAgICAgZW5jcnlwdGVkOiB0cnVlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIClcblxuICAgIC8vIEdQVSBOb2RlIOOCkui/veWKoFxuICAgIGNsdXN0ZXIuYWRkTm9kZWdyb3VwQ2FwYWNpdHkoJ0dwdU5vZGVHcm91cCcsIHtcbiAgICAgIG1pblNpemU6IDIsXG4gICAgICBhbWlUeXBlOiBla3MuTm9kZWdyb3VwQW1pVHlwZS5BTDJfWDg2XzY0X0dQVSxcbiAgICAgIGxhdW5jaFRlbXBsYXRlU3BlYzoge1xuICAgICAgICBpZDogbGF1bmNoVGVtcGxhdGUucmVmLFxuICAgICAgICB2ZXJzaW9uOiBsYXVuY2hUZW1wbGF0ZS5hdHRyTGF0ZXN0VmVyc2lvbk51bWJlcixcbiAgICAgIH0sXG4gICAgICBsYWJlbHM6IHtcbiAgICAgICAgLy8gYXdzLXZpcnR1YWwtZ3B1LWRldmljZS1wbHVnaW4g55So44GuIExhYmVsXG4gICAgICAgICdrOHMuYW1hem9uYXdzLmNvbS9hY2NlbGVyYXRvcic6ICd2Z3B1JyxcbiAgICAgIH0sXG4gICAgICBzdWJuZXRzOiB7IHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyB9LFxuICAgIH0pXG5cbiAgICAvKlxuICAgIG5ldyBla3MuQWxiQ29udHJvbGxlcih0aGlzLCAnQWxiQ29udHJvbGxlcicsIHtcbiAgICAgIGNsdXN0ZXI6IGNsdXN0ZXIsXG4gICAgICB2ZXJzaW9uOiBla3MuQWxiQ29udHJvbGxlclZlcnNpb24uVjJfNF8xLFxuICAgIH0pO1xuICAgICAqL1xuICB9XG59XG4iXX0=