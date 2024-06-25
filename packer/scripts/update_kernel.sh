#!/usr/bin/env bash
set -eu

# For Amazon Linux 2
# sudo yum install gcc make -y
# sudo yum update -y

# For Ubuntu
# sudo apt-get install -y gcc make 
sudo apt-get update -y
sudo NEEDRESTART_MODE=a apt-get upgrade -y linux-aws
sudo apt-get upgrade -y

sudo /sbin/shutdown -r now