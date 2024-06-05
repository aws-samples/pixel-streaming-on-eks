#!/usr/bin/env bash
set -eu

# Install nvidia-driver and cuda
sudo yum install -y gcc kernel-devel-$(uname -r)
#wget https://developer.download.nvidia.com/compute/cuda/12.0.1/local_installers/cuda_12.0.1_525.85.12_linux.run
#chmod +x ./cuda_12.0.1_525.85.12_linux.run
#sudo CC=/usr/bin/gcc10-cc ./cuda_12.0.1_525.85.12_linux.run --silent
sudo touch /etc/modprobe.d/nvidia.conf
echo "options nvidia NVreg_EnableGpuFirmware=0" | sudo tee --append /etc/modprobe.d/nvidia.conf

# Install nvidia-container-runtime
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-container-runtime/$distribution/nvidia-container-runtime.repo |   sudo tee /etc/yum.repos.d/nvidia-container-runtime.repo
sudo yum install -y nvidia-container-runtime

# Configuration for docker to use GPU
# This setting is optional because Kubernetes 1.24 does NOT use Docker runtime.
# https://kubernetes.io/blog/2020/12/02/dont-panic-kubernetes-and-docker/
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/override.conf <<EOF
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd --host=fd:// --add-runtime=nvidia=/usr/bin/nvidia-container-runtime
EOF
sudo systemctl daemon-reload
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
