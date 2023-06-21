"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerImageStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ecr = require("aws-cdk-lib/aws-ecr");
const imagedeploy = require("cdk-docker-image-deployment");
class DockerImageStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const pixelStreamingRepository = new ecr.Repository(this, 'PixelStreamingRepository', {
            repositoryName: 'pixel-streaming',
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        const signallingServerRepository = new ecr.Repository(this, 'SignallingServerRepository', {
            repositoryName: 'signalling-server',
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        new imagedeploy.DockerImageDeployment(this, 'PixelStreamingImageDeployment', {
            source: imagedeploy.Source.directory('./containers/pixel-streaming'),
            destination: imagedeploy.Destination.ecr(pixelStreamingRepository, {
                tag: 'latest',
            }),
        });
        new imagedeploy.DockerImageDeployment(this, 'SignallingServerImageDeployment', {
            source: imagedeploy.Source.directory('./containers/signaling-server'),
            destination: imagedeploy.Destination.ecr(signallingServerRepository, {
                tag: 'latest',
            }),
        });
    }
}
exports.DockerImageStack = DockerImageStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9ja2VyLWltYWdlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZG9ja2VyLWltYWdlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFrQztBQUNsQyw2Q0FBMkM7QUFFM0MsMkNBQTBDO0FBQzFDLDJEQUEwRDtBQUUxRCxNQUFhLGdCQUFpQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzdDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFdkIsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQ2pELElBQUksRUFDSiwwQkFBMEIsRUFDMUI7WUFDRSxjQUFjLEVBQUUsaUJBQWlCO1lBQ2pDLGFBQWEsRUFBRSwyQkFBYSxDQUFDLE9BQU87U0FDckMsQ0FDRixDQUFBO1FBRUQsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQ25ELElBQUksRUFDSiw0QkFBNEIsRUFDNUI7WUFDRSxjQUFjLEVBQUUsbUJBQW1CO1lBQ25DLGFBQWEsRUFBRSwyQkFBYSxDQUFDLE9BQU87U0FDckMsQ0FDRixDQUFBO1FBRUQsSUFBSSxXQUFXLENBQUMscUJBQXFCLENBQ25DLElBQUksRUFDSiwrQkFBK0IsRUFDL0I7WUFDRSxNQUFNLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQUM7WUFDcEUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFO2dCQUNqRSxHQUFHLEVBQUUsUUFBUTthQUNkLENBQUM7U0FDSCxDQUNGLENBQUE7UUFFQyxJQUFJLFdBQVcsQ0FBQyxxQkFBcUIsQ0FDakMsSUFBSSxFQUNKLGlDQUFpQyxFQUNqQztZQUNJLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQztZQUNyRSxXQUFXLEVBQUUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ2pFLEdBQUcsRUFBRSxRQUFRO2FBQ2hCLENBQUM7U0FDTCxDQUFDLENBQUE7SUFDVixDQUFDO0NBQ0Y7QUEzQ0QsNENBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cydcbmltcG9ydCAqIGFzIGVjciBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNyJ1xuaW1wb3J0ICogYXMgaW1hZ2VkZXBsb3kgZnJvbSAnY2RrLWRvY2tlci1pbWFnZS1kZXBsb3ltZW50J1xuXG5leHBvcnQgY2xhc3MgRG9ja2VySW1hZ2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKVxuXG4gICAgY29uc3QgcGl4ZWxTdHJlYW1pbmdSZXBvc2l0b3J5ID0gbmV3IGVjci5SZXBvc2l0b3J5KFxuICAgICAgdGhpcyxcbiAgICAgICdQaXhlbFN0cmVhbWluZ1JlcG9zaXRvcnknLFxuICAgICAge1xuICAgICAgICByZXBvc2l0b3J5TmFtZTogJ3BpeGVsLXN0cmVhbWluZycsXG4gICAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIH1cbiAgICApXG5cbiAgICBjb25zdCBzaWduYWxsaW5nU2VydmVyUmVwb3NpdG9yeSA9IG5ldyBlY3IuUmVwb3NpdG9yeShcbiAgICAgIHRoaXMsXG4gICAgICAnU2lnbmFsbGluZ1NlcnZlclJlcG9zaXRvcnknLFxuICAgICAge1xuICAgICAgICByZXBvc2l0b3J5TmFtZTogJ3NpZ25hbGxpbmctc2VydmVyJyxcbiAgICAgICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgfVxuICAgIClcblxuICAgIG5ldyBpbWFnZWRlcGxveS5Eb2NrZXJJbWFnZURlcGxveW1lbnQoXG4gICAgICB0aGlzLFxuICAgICAgJ1BpeGVsU3RyZWFtaW5nSW1hZ2VEZXBsb3ltZW50JyxcbiAgICAgIHtcbiAgICAgICAgc291cmNlOiBpbWFnZWRlcGxveS5Tb3VyY2UuZGlyZWN0b3J5KCcuL2NvbnRhaW5lcnMvcGl4ZWwtc3RyZWFtaW5nJyksXG4gICAgICAgIGRlc3RpbmF0aW9uOiBpbWFnZWRlcGxveS5EZXN0aW5hdGlvbi5lY3IocGl4ZWxTdHJlYW1pbmdSZXBvc2l0b3J5LCB7XG4gICAgICAgICAgdGFnOiAnbGF0ZXN0JyxcbiAgICAgICAgfSksXG4gICAgICB9XG4gICAgKVxuXG4gICAgICBuZXcgaW1hZ2VkZXBsb3kuRG9ja2VySW1hZ2VEZXBsb3ltZW50KFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgJ1NpZ25hbGxpbmdTZXJ2ZXJJbWFnZURlcGxveW1lbnQnLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc291cmNlOiBpbWFnZWRlcGxveS5Tb3VyY2UuZGlyZWN0b3J5KCcuL2NvbnRhaW5lcnMvc2lnbmFsaW5nLXNlcnZlcicpLFxuICAgICAgICAgICAgICBkZXN0aW5hdGlvbjogaW1hZ2VkZXBsb3kuRGVzdGluYXRpb24uZWNyKHNpZ25hbGxpbmdTZXJ2ZXJSZXBvc2l0b3J5LCB7XG4gICAgICAgICAgICAgICAgICB0YWc6ICdsYXRlc3QnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICB9KVxuICB9XG59XG4iXX0=