FROM ghcr.io/epicgames/unreal-engine:runtime-pixel-streaming
WORKDIR /home/ue4/project
COPY --chown=ue4:ue4 /uepackage ./

ENV RES_X=1920 \
    RES_Y=1080 \
    SIGNAL_URL=ws://localhost:8888 \
    UNREAL_ENGINE_APP=ThirdPersonCityScape.sh

RUN chmod 755 ThirdPersonCityScape.sh

CMD ["/bin/bash", "-c", "./${UNREAL_ENGINE_APP} -PixelStreamingURL=${SIGNAL_URL} -RenderOffscreen -Unattended -ForceRes -ResX=${RES_X} -ResY=${RES_Y} -AllowPixelStreamingCommands ${EXTRA_ARGS}" ]
