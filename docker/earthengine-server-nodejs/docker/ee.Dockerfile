# docker system prune --all
# docker build -f docker/ee.Dockerfile -t gee-map-server:0.0.3 .
# docker run -it --name gee-map-services  -p 3000:3000 -d gee-map-server:0.0.3 /bin/sh
# docker exec -it --user=root gee-map-services /bin/sh

FROM node:18.17.0-alpine
LABEL version="0.0.3"
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD npm start
