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
# Expose port 80
EXPOSE 80
# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
