FROM electronuserland/builder:wine

ENV GT_TOKEN 1c5deffaaba94c10716c30ebcb2180a4c351bb49
ENV REPO_NAME gmail-electron
RUN git clone --quiet https://cyfrost:${GT_TOKEN}@github.com/cyfrost/${REPO_NAME} && \
    cd ${REPO_NAME} && \
    make install-yarn && \
    make install && \
    make build-all
