variable "region" {
  type        = string
  description = "AWS region to create the AMI in"
}

variable "k8_version" {
  type        = string
  description = "Kubernetes version for the EKS node AMI"
}

source "amazon-ebs" "eks-gpu-node" {
  region         = "${var.region}"
  instance_type  = "g4dn.xlarge"
  # Amazon Linux SSH user
  # ssh_username   = "ec2-user"
  # Ubuntu SSH user
  ssh_username = "ubuntu"
  iam_instance_profile = "packer-instance-profile"

  source_ami_filter {
    filters = {
      # name = "amazon-eks-node-${var.k8_version}-v*"
      name = "ubuntu-eks/k8s_${var.k8_version}/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
    }
    # owners      = ["602401143452"]
    owners      = ["amazon"]
    most_recent = true
  }

  # ami_name = "eks-gpu-node-${var.k8_version}-{{timestamp}}"
  ami_name = "eks-ubuntu-gpu-node-${var.k8_version}-{{timestamp}}"

  tags = {
    Name        = "Packer EKS Ubuntu GPU Node AMI-${var.k8_version}-{{timestamp}}"
    Base_AMI_ID   = "{{ .SourceAMI }}"
    Base_AMI_NAME = "{{ .SourceAMIName }}"
  }

  launch_block_device_mappings {
    device_name = "/dev/xvda"
    volume_size = 40
    volume_type = "gp2"
    encrypted   = true
  }

  ssh_pty = true
  ssh_read_write_timeout = "5m"
}

build {
  sources = ["source.amazon-ebs.eks-gpu-node"]

  provisioner "shell" {
    script        = "./scripts/update_kernel.sh"
    pause_before  = "15s"
    expect_disconnect = true
  }

  provisioner "shell" {
    script        = "./scripts/setup_gpu.sh"
    pause_before  = "30s"
  }
}
