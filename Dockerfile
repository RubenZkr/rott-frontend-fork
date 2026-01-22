# Inspired by https://skamalakannan.dev/posts/dockerizing-your-spa/

FROM node:alpine AS build-step
ARG REACT_APP_API_BASE_URL=http://localhost:8000
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN mkdir -p /app
RUN npm cache clear --force
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build

FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-step /app/build /usr/share/nginx/html

# Add script to use PORT environment variable
RUN echo '#!/bin/sh\n\
    PORT=${PORT:-80}\n\
    sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/nginx.conf\n\
    nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

EXPOSE 80

STOPSIGNAL SIGTERM

CMD ["/start.sh"]