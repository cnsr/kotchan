FROM nodesource/jessie:0.12.7
RUN apt-get update
RUN apt-get install git imagemagick libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev build-essential g++ wget -y
RUN bash -c "cd /tmp && wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && tar xJf ffmpeg-release-amd64-static.tar.xz && cd ffmpeg-4.2.2-amd64-static && mv ffmpeg ffprobe /usr/local/bin"
# cache package.json and node_modules to speed up builds

RUN mkdir /app
WORKDIR /app
ADD package.json package.json
RUN npm install
RUN npm i bcrypt@1.0.3


