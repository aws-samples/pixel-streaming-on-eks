# pixel-streaming-on-eks

Sample code for deploying Pixel streaming on Amazon EKS. See docs on how to deploy under `./docs`.

![](./architecture.png "")

## Important Notes
- The PixelStreaming and SignallingServer contained in the `./containers` directory utilize official Docker images provided by Epic Games. 
The images used are the latest as of their release, but they contain known vulnerabilities.
Please scan them with tools like [trivy](https://github.com/aquasecurity/trivy) as needed, and respond to the vulnerabilities accordingly.
- In the applications deployed in the demo, unless restricted by SecurityGroup, anyone can freely access the SignalingServer. Please implement authentication or other measures as per your requirements.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
