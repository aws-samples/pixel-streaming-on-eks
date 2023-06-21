#!/usr/bin/env bash
set -eu

sudo yum update -y
sudo /sbin/shutdown -r now
