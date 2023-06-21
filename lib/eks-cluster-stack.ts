import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as eks from 'aws-cdk-lib/aws-eks'
import { KubectlV24Layer } from '@aws-cdk/lambda-layer-kubectl-v24'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'
import { readFileSync } from 'fs'

export class EksClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // EKS Cluster
    const cluster = new eks.Cluster(this, 'EksCluster', {
      clusterName: 'PrototypeEksCluster',
      version: eks.KubernetesVersion.V1_24,
      kubectlLayer: new KubectlV24Layer(this, 'KubectlLayer'),
      // Custom Node を使うので DefaultCapacity は 0 にしておく
      defaultCapacity: 0,
    })

    // Configure aws-auth to allow IAM Role for Admin to access EKS Cluster
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_eks-readme.html#permissions-and-security
    const adminRole = iam.Role.fromRoleName(this, 'AdminRole', 'Admin')
    cluster.awsAuth.addMastersRole(adminRole)

    // For user
    // const User = iam.User.fromUserName(this, 'User', 'username')
    // cluster.awsAuth.addUserMapping(User, { groups: ['system:masters'] })

    const nodePortSecurityGroup = new ec2.SecurityGroup(
        this,
        'NodePortSecurityGroup',
        {
          vpc: cluster.vpc,
        }
    )

    const allowedIpRange = ec2.Peer.ipv4('59.138.151.0/24')

    nodePortSecurityGroup.addIngressRule(
        allowedIpRange,
        ec2.Port.tcpRange(30000, 32767)
    )

    nodePortSecurityGroup.addIngressRule(allowedIpRange, ec2.Port.tcp(3478))
    nodePortSecurityGroup.addIngressRule(allowedIpRange, ec2.Port.udp(3478))

    const cfnKeyPair = new ec2.CfnKeyPair(this, 'NodeKeyPair', {
      keyName: 'eks-node-key-pair',
    })
    cfnKeyPair.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    new cdk.CfnOutput(this, 'GetSSHKeyCommand', {
      value: `aws ssm get-parameter --name /ec2/keypair/${cfnKeyPair.getAtt(
          'KeyPairId'
      )} --region ${
          this.region
      } --with-decryption --query Parameter.Value --output text`,
    })

    const userDataScript = readFileSync('./lib/user-data.txt', 'utf8')

    const launchTemplate = new ec2.CfnLaunchTemplate(
        this,
        'NodeLaunchTemplate',
        {
          launchTemplateData: {
            imageId: 'ami-07cb6d290e2501de3',
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
                  volumeSize: 80,
                  encrypted: true,
                },
              },
            ],
            keyName: cdk.Token.asString(cfnKeyPair.ref),
            userData: cdk.Fn.base64(userDataScript),
          },
        }
    )

    // Add GPU Node
    const nodegroup = cluster.addNodegroupCapacity('GpuNodeGroup', {
      minSize: 1,
      maxSize: 4,
      launchTemplateSpec: {
        id: launchTemplate.ref,
        version: launchTemplate.attrLatestVersionNumber,
      },
      subnets: { subnetType: ec2.SubnetType.PUBLIC },
      labels: {
        // https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#special-note-on-gpu-instances
        'k8s.amazonaws.com/accelerator': 'nvidia-tesla-t4',
      },
      tags: {
        // https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/autoscaling.html
        'k8s.io/cluster-autoscaler/PrototypeEksCluster': 'owned',
        'k8s.io/cluster-autoscaler/enabled': 'true',
      },
    })

    // https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended
    const autoscalerPolicyDocument = iam.PolicyDocument.fromJson({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'autoscaling:DescribeAutoScalingGroups',
            'autoscaling:DescribeAutoScalingInstances',
            'autoscaling:DescribeLaunchConfigurations',
            'autoscaling:DescribeScalingActivities',
            'autoscaling:DescribeTags',
            'ec2:DescribeInstanceTypes',
            'ec2:DescribeLaunchTemplateVersions',
          ],
          Resource: ['*'],
        },
        {
          Effect: 'Allow',
          Action: [
            'autoscaling:SetDesiredCapacity',
            'autoscaling:TerminateInstanceInAutoScalingGroup',
            'ec2:DescribeImages',
            'ec2:GetInstanceTypesFromInstanceRequirements',
            'eks:DescribeNodegroup',
          ],
          Resource: ['*'],
        },
      ],
    })

    const autoscalerManagedPolicy = new iam.ManagedPolicy(
        this,
        'AutoscalerManagedPolicy',
        {
          document: autoscalerPolicyDocument,
        }
    )

    nodegroup.role.addManagedPolicy(autoscalerManagedPolicy)
  }
}