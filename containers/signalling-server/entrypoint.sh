#!/bin/sh

PUBLIC_IP=`curl https://checkip.amazonaws.com/`

/usr/local/bin/node /opt/SignallingWebServer/cirrus.js \
  --peerConnectionOptions "{\"iceServers\": [{\"urls\": [\"stun:${PUBLIC_IP}:3478\",\"turn:${PUBLIC_IP}:3478?transport=udp\"],\"username\": \"user\",\"credential\": \"RifyF3akkEmCrFr4rx8K7Wq6xbiXt6da\"}]}"
