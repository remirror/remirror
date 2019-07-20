FROM remirror/puppeteer-linux:0.0.5

RUN mkdir /remirror
WORKDIR /remirror
COPY . .

RUN yarn