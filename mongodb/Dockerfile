FROM mongo:6.0

# Copier les scripts d'initialisation
COPY init-mongo.js /docker-entrypoint-initdb.d/

# Créer le répertoire pour les données
RUN mkdir -p /data/db

# Exposer le port MongoDB
EXPOSE 27017

# Utiliser le point d'entrée par défaut de MongoDB
CMD ["mongod"]
