import * as cdk from 'aws-cdk-lib'
import { RemovalPolicy } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as imagedeploy from 'cdk-docker-image-deployment'

export class DockerImageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const pixelStreamingRepository = new ecr.Repository(
      this,
      'PixelStreamingRepository',
      {
        repositoryName: 'pixel-streaming',
        removalPolicy: RemovalPolicy.DESTROY,
      }
    )

    const signallingServerRepository = new ecr.Repository(
      this,
      'SignallingServerRepository',
      {
        repositoryName: 'signalling-server',
        removalPolicy: RemovalPolicy.DESTROY,
      }
    )

    const turnServerRepository = new ecr.Repository(
      this,
      'TurnServerRepository',
      {
        repositoryName: 'turn-server',
        removalPolicy: RemovalPolicy.DESTROY,
      }
    )

    new imagedeploy.DockerImageDeployment(
      this,
      'PixelStreamingImageDeployment',
      {
        source: imagedeploy.Source.directory('./containers/pixel-streaming'),
        destination: imagedeploy.Destination.ecr(pixelStreamingRepository, {
          tag: 'latest',
        }),
      }
    )

    new imagedeploy.DockerImageDeployment(
      this,
      'SignallingServerImageDeployment',
      {
        source: imagedeploy.Source.directory('./containers/signalling-server'),
        destination: imagedeploy.Destination.ecr(signallingServerRepository, {
          tag: 'latest',
        }),
      }
    )

    new imagedeploy.DockerImageDeployment(this, 'TurnServerImageDeployment', {
      source: imagedeploy.Source.directory('./containers/turn-server'),
      destination: imagedeploy.Destination.ecr(turnServerRepository, {
        tag: 'latest',
      }),
    })
  }
}
