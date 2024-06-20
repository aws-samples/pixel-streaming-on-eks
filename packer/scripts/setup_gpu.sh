#!/usr/bin/env bash
set -eu

# Install nvidia-container-toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#installing-with-yum-or-dnf
curl -s -L https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo | \
sudo tee /etc/yum.repos.d/nvidia-container-toolkit.repo
sudo yum-config-manager --enable nvidia-container-toolkit-experimental
sudo yum install -y nvidia-container-toolkit


# Install nvidia-driver and cuda
sudo yum install -y gcc kernel-devel-$(uname -r)
aws s3 cp --recursive s3://ec2-linux-nvidia-drivers/latest/ .
chmod +x NVIDIA-Linux-x86_64*.run
sudo CC=/usr/bin/gcc10-cc ./NVIDIA-Linux-x86_64*.run

sudo touch /etc/modprobe.d/nvidia.conf
echo "options nvidia NVreg_EnableGpuFirmware=0" | sudo tee --append /etc/modprobe.d/nvidia.conf

# Install nvidia-container-runtime DEPRECATED
# distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
# curl -s -L https://nvidia.github.io/nvidia-container-runtime/$distribution/nvidia-container-runtime.repo |   sudo tee /etc/yum.repos.d/nvidia-container-runtime.repo
# sudo yum install -y nvidia-container-runtime

# Configuration for docker to use GPU
# This setting is optional because Kubernetes 1.24 does NOT use Docker runtime.
# https://kubernetes.io/blog/2020/12/02/dont-panic-kubernetes-and-docker/
# sudo mkdir -p /etc/systemd/system/docker.service.d
# sudo tee /etc/systemd/system/docker.service.d/override.conf <<EOF
# [Service]
# ExecStart=
# ExecStart=/usr/bin/dockerd --host=fd:// --add-runtime=nvidia=/usr/bin/nvidia-container-runtime
# EOF
# sudo systemctl daemon-reload
# sudo systemctl restart docker

# Configuration for containerd to use GPU
sudo sed -i -e "s/default_runtime_name = \"runc\"/default_runtime_name = \"nvidia\"/g" /etc/eks/containerd/containerd-config.toml
sudo tee -a /etc/eks/containerd/containerd-config.toml << EOS

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia]
  privileged_without_host_devices = false
  runtime_engine = ""
  runtime_root = ""
  runtime_type = "io.containerd.runc.v1"
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia.options]
   BinaryName = "/usr/bin/nvidia-container-runtime"
EOS

sudo systemctl restart containerd
# sudo systemctl restart kubelet
