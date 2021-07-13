# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.134.0/containers/javascript-node/.devcontainer/base.Dockerfile
ARG VARIANT="14"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# Install additional OS packages
RUN apt-get update -yq && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -yq install --no-install-recommends nano \
    # Install Git LFS
    && curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash \
    && apt-get install -yq git-lfs \
    && git lfs install

ARG PNPM_VERSION="5.15.0"
# Install more global node modules
RUN sudo -u node npm install -g pnpm@${PNPM_VERSION}
