FROM ghcr.io/epicgames/unreal-engine:runtime-pixel-streaming
WORKDIR /home/ue4/project
COPY --chown=ue4:ue4 /ue5-sample ./

ENV RES_X=1920 \
    RES_Y=1080 \
    SIGNAL_URL=ws://localhost:8888

RUN chmod 755 TriplexHouseVilla.sh

CMD ["/bin/bash", "-c", "./TriplexHouseVilla.sh -PixelStreamingURL=${SIGNAL_URL} -RenderOffscreen -Unattended -ForceRes -ResX=${RES_X} -ResY=${RES_Y} -AllowPixelStreamingCommands ${EXTRA_ARGS}" ]
