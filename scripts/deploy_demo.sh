#!/bin/sh
set -eu

if [ $# -ne 1 ]; then
  echo "Specify the number to deploy in the argument." 1>&2
  exit 1
fi

REPLICAS=$1
REPLICAS_PER_NODE=2
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=ap-northeast-1
PORT_START=50000
NODE_PORT_START=30000
APP_TEMPLATE_FILE=./manifests/pixel-streaming.template.yaml
APP_MANIFEST_FILE=./manifests/pixel-streaming.yaml
TURN_TEMPLATE_FILE=./manifests/turn-server.template.yaml
TURN_MANIFEST_FILE=./manifests/turn-server.yaml

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

ASG_NAME=$(aws autoscaling describe-auto-scaling-groups \
  --query 'AutoScalingGroups[?starts_with(AutoScalingGroupName, `eks-EksClusterNodegroupGpuNode`) == `true`].[AutoScalingGroupName]' \
  --output text | head -n 1)
NODE_CAPACITY=$(((REPLICAS + REPLICAS_PER_NODE - 1) / REPLICAS_PER_NODE))

echo "Required ASG desired-capacity is ${NODE_CAPACITY}"
aws autoscaling set-desired-capacity --auto-scaling-group-name $ASG_NAME --desired-capacity $NODE_CAPACITY || true

# Deploy turn-server
rm -f $TURN_MANIFEST_FILE
cat $TURN_TEMPLATE_FILE \
  | sed s/__ACCOUNT_ID__/${ACCOUNT_ID}/ \
  | sed s/__REGION__/${REGION}/ \
  >> $TURN_MANIFEST_FILE

kubectl apply -f ./manifests/turn-server.yaml

# Deploy pixel-streaming
rm -f $APP_MANIFEST_FILE
for i in `seq 1 $REPLICAS`
do
  PORT=$(($PORT_START+$i-1))
  NODE_PORT=$(($NODE_PORT_START+$i-1))

  cat $APP_TEMPLATE_FILE \
    | sed s/__NUMBER__/${i}/ \
    | sed s/__ACCOUNT_ID__/${ACCOUNT_ID}/ \
    | sed s/__REGION__/${REGION}/ \
    | sed s/__PORT__/${PORT}/ \
    | sed s/__NODE_PORT__/${NODE_PORT}/ \
    >> $APP_MANIFEST_FILE
done

if [ $REPLICAS -gt 0 ]; then
  kubectl apply -f $APP_MANIFEST_FILE
fi

# Maximum number of services deployed now
MAX_NUMBER=`kubectl get svc --no-headers -o custom-columns=":metadata.name" \
  | grep pixelstreaming | grep -o '[0-9]*' | sort -rn | head -1`

# Delete services for more than the number specified in the argument
if [ $MAX_NUMBER -gt $(($REPLICAS)) ]; then
  for i in `seq $(($REPLICAS+1)) $MAX_NUMBER`
  do
    kubectl delete service pixelstreaming-service${i}
    kubectl delete deployment pixelstreaming-deployment${i}
  done
fi
