FROM ghcr.io/epicgames/pixel-streaming-signalling-server:5.0.3

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" 
RUN unzip awscliv2.zip 
RUN ./aws/install

ADD entrypoint.sh /opt/SignallingWebServer
RUN chmod 755 ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]