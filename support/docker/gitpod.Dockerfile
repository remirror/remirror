FROM gitpod/workspace-full

USER root

RUN \
  apt-get update && \
  apt-get install -y sudo curl git && \
  curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash && \
  sudo apt-get install git-lfs && \
  git lfs install

USER gitpod

ENV REMIRROR_E2E_DOCKER=true

USER root
