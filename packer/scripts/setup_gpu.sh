#!/usr/bin/env bash
set -eu


# For Ubuntu
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

echo "* * Updating packages * *"
sudo apt-get update
# Install Vulkan drivers for Ubuntu
sudo apt install libvulkan1 -y


echo "* * Installing nvidia-container-toolkit * *"
sudo apt-get install -y nvidia-container-toolkit

echo "* * Installing AWS CLI * *"
sudo apt install -y unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" 
unzip awscliv2.zip 
sudo ./aws/install

echo "* * Updating NVIDIA driver prerequisites * *"
sudo apt-get install -y gcc make linux-headers-$(uname -r)
cat << EOF | sudo tee --append /etc/modprobe.d/blacklist.conf
blacklist vga16fb
blacklist nouveau
blacklist rivafb
blacklist nvidiafb
blacklist rivatv
EOF
echo 'GRUB_CMDLINE_LINUX="rdblacklist=nouveau"' | sudo tee --append /etc/default/grub
sudo update-grub

echo "* * Downloading NVIDIA drivers * *"
aws s3 cp --recursive s3://ec2-linux-nvidia-drivers/latest/ .
chmod +x NVIDIA-Linux-x86_64*.run

echo "* * Installing the NVIDIA drivers * *"
sudo /bin/sh ./NVIDIA-Linux-x86_64*.run --silent

# For Amazon Linux
    # Install nvidia-container-toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#installing-with-yum-or-dnf
    # curl -s -L https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo | \
    # sudo tee /etc/yum.repos.d/nvidia-container-toolkit.repo
    # sudo yum install -y nvidia-container-toolkit
    # Install nvidia-driver and cuda
    # sudo yum install -y gcc kernel-devel-$(uname -r)
    # echo "* * Downloading NVIDIA drivers * *"
    # aws s3 cp --recursive s3://ec2-linux-nvidia-drivers/latest/ .
    # chmod +x NVIDIA-Linux-x86_64*.run
    # echo "* * Installing the NVIDIA drivers * *"
    # sudo CC=/usr/bin/gcc10-cc ./NVIDIA-Linux-x86_64*.run --silent

echo "* * Setting up NVIDIA drivers for containerd * *"
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

echo "* * Config /etc/containerd/config.toml before updating with NVIDIA runtime * *\n\n"
cat /etc/containerd/config.toml

echo "* * Restarting containerd * *"
sudo systemctl restart containerd

