#!/usr/bin/env bash
set -eu

sudo yum install gcc make -y
sudo yum update -y
sudo /sbin/shutdown -r now
