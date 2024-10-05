#!/bin/sh

PUBLIC_IP=`curl -s https://checkip.amazonaws.com/`

USER=$(aws secretsmanager get-secret-value --secret-id pixel/ice/user --query "SecretString" --output text)
PASSWORD=$(aws secretsmanager get-secret-value --secret-id pixel/ice/password --query "SecretString" --output text)

/usr/local/bin/node /opt/SignallingWebServer/cirrus.js \
  --peerConnectionOptions "{\"iceServers\": [{\"urls\": [\"stun:${PUBLIC_IP}:3478\",\"turn:${PUBLIC_IP}:3478?transport=udp\"],\"username\": \"${USER}\",\"credential\": \"${PASSWORD}\"}]}"