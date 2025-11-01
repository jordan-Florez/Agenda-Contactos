# Dockerfile para servir el frontend con Nginx
FROM nginx:alpine
COPY ./index.html /usr/share/nginx/html/index.html
COPY ./styles.css /usr/share/nginx/html/styles.css
COPY ./app.js /usr/share/nginx/html/app.js
# Opcional: puedes agregar una configuración personalizada de nginx.conf si lo necesitas
EXPOSE 80
