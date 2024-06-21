#!/usr/bin/env bash
set -eu

# Install nvidia-container-toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#installing-with-yum-or-dnf
curl -s -L https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo | \
sudo tee /etc/yum.repos.d/nvidia-container-toolkit.repo
sudo yum install -y nvidia-container-toolkit


# Install nvidia-driver and cuda
sudo yum install -y gcc kernel-devel-$(uname -r)
echo "* * Downloading NVIDIA drivers * *"
aws s3 cp --recursive s3://ec2-linux-nvidia-drivers/latest/ .
chmod +x NVIDIA-Linux-x86_64*.run
echo "* * Installing the NVIDIA drivers * *"
sudo CC=/usr/bin/gcc10-cc ./NVIDIA-Linux-x86_64*.run --silent

echo "* * Setting up NVIDIA drivers for containerd * *"

sudo nvidia-ctk runtime configure --runtime=containerd
sudo nvidia-ctk runtime configure --runtime=containerd

# sudo touch /etc/modprobe.d/nvidia.conf
# echo "options nvidia NVreg_EnableGpuFirmware=0" | sudo tee --append /etc/modprobe.d/nvidia.conf

# # Configuration for containerd to use GPU
# sudo sed -i -e "s/default_runtime_name = \"runc\"/default_runtime_name = \"nvidia\"/g" /etc/eks/containerd/containerd-config.toml
# sudo tee -a /etc/eks/containerd/containerd-config.toml << EOS

# [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia]
#   privileged_without_host_devices = false
#   runtime_engine = ""
#   runtime_root = ""
#   runtime_type = "io.containerd.runc.v1"
# [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia.options]
#    BinaryName = "/usr/bin/nvidia-container-runtime"
# EOS

echo "* * Restarting containerd * *"
sudo systemctl restart containerd

