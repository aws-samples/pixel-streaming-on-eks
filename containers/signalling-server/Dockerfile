FROM ghcr.io/epicgames/pixel-streaming-signalling-server:5.0.3

RUN apk update && \
    apk add --no-cache aws-cli

ADD entrypoint.sh /opt/SignallingWebServer
RUN chmod 755 ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]