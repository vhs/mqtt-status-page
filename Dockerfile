FROM node:lts as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn build

FROM nginx:stable-alpine

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html


