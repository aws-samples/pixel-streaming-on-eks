# Deployment steps for the demo

## Prerequisites
Please ensure your environment meets the following requirements necessary for deployment.

- You have built an Unreal Engine Pixel Streaming application using the instructions [here](./UNREAL_ENGINE_EN.md)
- The required AWS IAM permissions (IAM roles, IAM users, etc.) are set.
    - Administrator-level privileges are necessary.
- You're logged in to Docker with a GitHub account linked to your Unreal Engine account.
    - For authentication methods, please refer to  [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#container-registry%E3%81%A7%E3%81%AE%E8%AA%8D%E8%A8%BC). Make sure to set up the personal access token (classic) with the scope to `read/write/delete:packages` as described in the documentation.

- The necessary software is installed.
    - Node.js (LTS version)
    - Docker
        - If you are using an ARM64 development environment, for example an M1 Mac, please set up to build images as AMD64.
    - Packer
    - kubectl
    - helm
    - [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
    - [AWS Cloud Development Kit (AWS CDK)](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)


## Building the AMI

Build an AMI with the latest NVIDIA GPU drivers for the EKS cluster worker node.

1. Install the required Packer plugins and navigate to the [Packer template directory](../packer/).

```console
$ packer plugins install github.com/hashicorp/amazon
$ cd pixel-streaming-on-eks/packer
```

2. Create the instance profile needed for the Packer AMI builder instance to download the NVIDIA drivers

```console
$ aws iam create-role --role-name packer-instance-role --assume-role-policy-document file://packer-instance-trust-policy.json
$ aws iam create-policy --policy-name packer-instance-profile-policy --policy-document file://packer-instance-profile-policy.json
$ PACKER_ACCOUNT_ID=`aws sts get-caller-identity --query "Account" --output text`
$ aws iam attach-role-policy --role-name packer-instance-role --policy-arn "arn:aws:iam::$PACKER_ACCOUNT_ID:policy/packer-instance-profile-policy"
$ aws iam create-instance-profile --instance-profile-name packer-instance-profile
$ aws iam add-role-to-instance-profile --instance-profile-name packer-instance-profile --role-name packer-instance-role
```

3. Update the region and Kubernetes variables in the command below and execute the command to build the AMI for the pixel streaming node.

```console
$ packer build -var 'region=eu-west-2' -var 'k8_version=1.29' eks-gpu-node.pkr.hcl
```

4. Once the build completes successfully, take note of the AMI ID that begins with `ami-`. 

```console
==> Builds finished. The artifacts of successful builds are:
--> amazon-ebs.eks-gpu-node: AMIs were created:
eu-west-2: ami-123abc123abc123
```

You can also query for the AMI ID using the AWS CLI.

```console
$ aws ec2 describe-images --owners self --filters "Name=tag:Name,Values=Packer*" --query 'Images[*].[ImageId,Name,ImageType,CreationDate]' --output table
```

5. Then make sure to remove the instance profile, role, and policy that are no longer needed.

```console
$ aws iam detach-role-policy --role-name packer-instance-role --policy-arn "arn:aws:iam::$PACKER_ACCOUNT_ID:policy/packer-instance-profile-policy"
$ aws iam remove-role-from-instance-profile --instance-profile-name packer-instance-profile --role-name packer-instance-role
$ aws iam delete-role --role-name packer-instance-role
$ aws iam delete-policy --policy-arn "arn:aws:iam::$PACKER_ACCOUNT_ID:policy/packer-instance-profile-policy"
$ aws iam delete-instance-profile --instance-profile-name packer-instance-profile
```

## Deploying the CDK App
1. We will no deploy the CDK App, which includes the EKS Cluster and Docker container images.

    If you are currently in the `packer` directory, return to the directory above. Ensure that there is a `cdk.json` file in the same directory.

```console
$ ls
README.md  cdk.json ...
```

2. Open the file [containers/pixel-streaming/Dockerfile](../containers/pixel-streaming/Dockerfile) and replace the `UNREAL_ENGINE_APP` environment variable with the name of the `.sh` file used to launch your Unreal Engine application, for example `ThirdPersonShooter.sh`.

3. Open the [lib/eks-cluster-stack.ts](../lib/eks-cluster-stack.ts) TypeScripts CDK file and update the deployment specific variables.

    a) `EKS_ACCESS_ROLE` 

    Change this to the name of an existing role or user to the EKS cluster. By default, a role named Admin is the target. If you prefer to set this outside of the CDK deployment, refer to [Enabling IAM principal access to your cluster](https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html)  for guidance.

    b) `SOURCE_CIDR`

    Update this to the IP range of the device(s) that you will access the pixel streaming demo from. Best practice is to set this to a small range and not provide access to all external IPs.

    c) `AMI_ID`

    Update this constant to the ID of the AMI that was generated by the Packer build process.

    d) Kubernetes version

    Verify that the Kubernetes version specified in the `new eks.Cluster(...)` call matches the version specified when generating the AMI with Packer.

4. Install all Node dependencies and [bootstrap the CDK environment](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html), if required.

```console
$ npm install
$ npx cdk bootstrap 
```

5. Then deploy all stacks defines in the application.

```console
$ npx cdk deploy --all --require-approval never
```

6. After the stack has been deployed, we use the AWS CLI to set up `kubectl` to talk to our EKS managed Kubernetes cluster.

```console
$ aws eks update-kubeconfig --name PrototypeEksCluster 
```

You can check that your `kubeconfig` has been correctly update by listing the single node in your cluster.

```console
$ kubectl get nodes
NAME                                        STATUS   ROLES    AGE   VERSION
ip-10-0-01-193.eu-west-2.compute.internal   Ready    <none>   11m   v1.30.0-eks-123456b
```

**Congratulations!** You have now deployed the base Kubernetes cluster without the pixel streaming application.

## Set up the Kubernetes environment to make use of the GPU


[Set up the NVIDIA Helm repo](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html#procedure)

```console
$ helm repo add nvidia https://helm.ngc.nvidia.com/nvidia \
    && helm repo update
```

Set up the GPU operator using [pre-Installed NVIDIA GPU Drivers and NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html#pre-installed-nvidia-gpu-drivers-and-nvidia-container-toolkit)

```console
$ helm install --wait --generate-name \
     -n gpu-operator --create-namespace \
      nvidia/gpu-operator \
      --set driver.enabled=false \
      --set toolkit.enabled=false
```


## Set up GPU time-slicing

Settgin up cluster-wide time slicing: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-sharing.html#applying-one-cluster-wide-configuration

```console
$ cd manifests
$ kubectl create -n gpu-operator -f time-slicing-config-all.yaml
```

```console
$ kubectl patch clusterpolicies.nvidia.com/cluster-policy \
    -n gpu-operator --type merge \
    -p '{"spec": {"devicePlugin": {"config": {"name": "time-slicing-config-all", "default": "any"}}}}'
```


2. Wait for a while, then run the command `kubectl describe node`. If you can see four GPUs, then it's working correctly.

Time slicing is not enabled:
```console
$ kubectl describe node | grep nvidia.com/gpu:
  nvidia.com/gpu:              1
  nvidia.com/gpu:              1
```
Time slicing is enabled:
```
$ kubectl describe node | grep nvidia.com/gpu:
  nvidia.com/gpu:              4
  nvidia.com/gpu:              4
```

## Deploying the Demo App
1. Execute `./scripts/deploy_demo.sh N`. `N` specifies the number of deployments. (Example: `./scripts/deploy_demo.sh 1`)
   Wait for a while, then execute ./scripts/get_addresses.sh to retrieve the URL for access.
```
$ ./scripts/get_addresses.sh
http://18.183.134.12:30000
```

## Deleting all the stacks
You can delete the deployed environment with the following command. Since some components cannot be removed from CDK and will remain, open the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/home) to check and manually delete them if unnecessary.
```
$ npx cdk destroy --all
```
