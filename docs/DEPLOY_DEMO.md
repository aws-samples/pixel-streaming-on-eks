# Deployment steps for the demo

## Prerequisites
Please ensure your environment meets the following requirements necessary for deployment.
- The required AWS IAM permissions (IAM roles, IAM users, etc.) are set.
    - Administrator-level privileges are necessary.
- You're logged in to Docker with a GitHub account linked to your Unreal Engine account.
    - For authentication methods, please refer to  [Working with the Container registry](https://docs.github.com/ja/packages/working-with-a-github-packages-registry/working-with-the-container-registry#container-registry%E3%81%A7%E3%81%AE%E8%AA%8D%E8%A8%BC).
- The necessary software is installed.
    - Node.js (LTS version)
    - Docker
        - If you're using an ARM64 environment (like M1 Mac), please set up to build images as AMD64.
    - Packer
    - awscli
    - kubectl
    - helm

## Building the AMI

Build an AMI to handle the latest GPU Driver for EKS.

1. Navigate to the packer directory, and build.

```
$ cd pixel-streaming-on-eks/packer
$ packer build eks-gpu-node.json
```

2. Once the build completes successfully, take note of the AMI ID that begins with `ami-`.

```
==> amazon-ebs: Waiting for the instance to stop...
==> amazon-ebs: Creating AMI eks-gpu-node-1.24-1676732590 from instance i-068f246c113c251df
    amazon-ebs: AMI: ami-038246843a7aabe29
==> amazon-ebs: Waiting for AMI to become ready...
...
```

## Deploying the CDK App
1. We will deploy the CDK App, which includes the EKS Cluster and Docker Image.

If you are currently in the packer directory, return to the directory above. Ensure that there is a cdk.json file in the same directory.

```
$ ls
README.md  cdk.json ...
```

2. Edit around line 22 of lib/eks-cluster-stack.ts to set access rights for an existing role or user to the EKS cluster. By default, a role named Admin is the target.

If you prefer to set this without using CDK, refer to [Enabling IAM principal access to your cluster](https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html)  for guidance.

```
// Configure aws-auth to allow IAM Role for Admin to access EKS Cluster
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_eks-readme.html#permissions-and-security
const adminRole = iam.Role.fromRoleName(this, 'AdminRole', 'Admin') <= HERE
cluster.awsAuth.addMastersRole(adminRole)

// For user
// const user = iam.User.fromUserName(this, 'User', 'username')
// cluster.awsAuth.addUserMapping(user, { groups: ['system:masters'] })
```

3. Modify the allowedIpRange around line 39 of `lib/eks-cluster-stack.ts` to the IP range that you want to allow access to the demo.
   To allow access from all IP addresses, specify `0.0.0.0/0`.
```
const allowedIpRange = ec2.Peer.ipv4('59.138.151.0/24') <= HERE
```

4. Change the imageId around line 67 of `lib/eks-cluster-stack.ts` to the ID of the AMI you created in the previous step.
```
const launchTemplate = new ec2.CfnLaunchTemplate(
      this,
      'NodeLaunchTemplate',
      {
        launchTemplateData: {
          imageId: 'ami-038246843a7aabe29',  <= HERE
          instanceType: 'g4dn.xlarge',
          ...
```

5. Execute the following commands to deploy. Please run `npm install` and `npx cdk bootstrap` only for the first time.
```
$ npm install
$ npx cdk bootstrap --cloudformation-execution-policies \
  'arn:aws:iam::aws:policy/PowerUserAccess,arn:aws:iam::aws:policy/IAMFullAccess'
$ npx cdk deploy --all --require-approval never

Outputs:
UnrealPixelStreamingStack.EksClusterConfigCommand2AE6ED67 = aws eks update-kubeconfig --name EksClusterFAB68BDB-25b7897febe6406db6795748575ae956 --region ap-northeast-1 --role-arn arn:aws:iam::...
UnrealPixelStreamingStack.EksClusterGetTokenCommandDF0BEDB9 = aws eks get-token --cluster-name EksClusterFAB68BDB-25b7897febe6406db6795748575ae956 --region ap-northeast-1 --role-arn arn:aws:iam::...
```

6. The line beginning with `UnrealPixelStreamingStack.EksClusterConfigCommand` that is output to the log is the command to configure kubectl. Copy and paste it to execute.
```
$ aws eks update-kubeconfig --name EksClusterFAB68BDB-25b7897febe6406db6795748575ae956 --region ap-northeast-1 --role-arn arn:aws:iam::...
```

## Setting Up EKS to Handle GPU
We will deploy the k8s-device-plugin and set up CUDA Time-Slicing.

1. Install nvidia-device-plugin using helm.
```
$ helm repo add nvdp https://nvidia.github.io/k8s-device-plugin
$ helm repo update
$ helm upgrade -i nvdp nvdp/nvidia-device-plugin \
    --namespace nvidia-device-plugin \
    --create-namespace \
    --version 0.13.0 \
    --set-file config.map.config=./manifests/nvidia-device-plugin-config.yaml
```

2. Wait for a while, then run `kubectl describe node`. If you can see four GPUs, then it's working correctly.
```
$ kubectl describe node | grep nvidia.com/gpu:
  nvidia.com/gpu:              1
  nvidia.com/gpu:              1
↑ State with one GPU

$ kubectl describe node | grep nvidia.com/gpu:
  nvidia.com/gpu:              4
  nvidia.com/gpu:              4
↑ State with four GPUs
```

## Deploying the Demo App
1. Execute `./scripts/deploy_demo.sh N`. `N` specifies the number of deployments. (Example: `./scripts/deploy_demo.sh 1`)
   Wait for a while, then execute ./scripts/get_addresses.sh to retrieve the URL for access.
```
$ ./scripts/get_addresses.sh
http://18.183.134.12:30000
```

## Deleting the Deployed Environment
You can delete the deployed environment with the following command. Since some components cannot be removed from CDK and will remain, open the CloudFormation Console to check and manually delete them if unnecessary.
```
$ npx cdk destroy --all
```
