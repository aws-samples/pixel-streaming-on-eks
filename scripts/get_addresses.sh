#!/bin/sh

NODE_PORT_START=30000

# Maximum number of services deployed now
MAX_NUMBER=`kubectl get svc --no-headers -o custom-columns=":metadata.name" \
  | grep pixelstreaming | grep -o '[0-9]*' | sort -rn | head -1`

# Get service's endpoints
for i in `seq 1 $MAX_NUMBER`
do
  NODE_PORT=$(($NODE_PORT_START+$i-1))
  NODE_NAME=$(kubectl get endpoints pixelstreaming-service${i} -o jsonpath='{.subsets[0].addresses[0].nodeName}')
  NODE_IP=$(aws ec2 describe-instances --filters \
    "Name=private-ip-address,Values=$(kubectl get node $NODE_NAME \
    -o=jsonpath='{.status.addresses[?(@.type=="InternalIP")].address}')" \
    --query "Reservations[].Instances[].PublicIpAddress" --output=text)

  if [ -z "$NODE_IP" ]; then
    echo "Cannot get NODE_IP. Try again in a few minutes"
    exit 1
  fi

  echo http://${NODE_IP}:${NODE_PORT}
done
