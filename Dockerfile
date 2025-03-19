FROM node:iron-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine-perl
# Optionally remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy the production build from the builder stage to Nginx's web directory
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
# COPY --from=builder /app/static /usr/share/nginx/html/static
COPY --from=builder /app/env.template.js /usr/share/nginx/html/env.template.js
# Expose port 80

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js && exec nginx -g 'daemon off;'"]
EXPOSE 80
# Start Nginx in the foreground
# CMD ["nginx", "-g", "daemon off;"]

