FROM ghcr.io/epicgames/pixel-streaming-signalling-server:5.0.3

ADD entrypoint.sh /opt/SignallingWebServer
RUN chmod 755 ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
