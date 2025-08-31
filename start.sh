#!/bin/bash

# Script de démarrage pour JGazette
# Usage: ./start.sh [dev|prod]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Démarrage de JGazette        ${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Vérifier si Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez installer Docker d'abord."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
        exit 1
    fi
}

# Vérifier si le fichier .env existe
check_env_file() {
    if [ ! -f .env ]; then
        print_warning "Fichier .env non trouvé. Création à partir du template..."
        if [ -f env.example ]; then
            cp env.example .env
            print_message "Fichier .env créé. Veuillez le modifier avec vos paramètres."
        else
            print_error "Fichier env.example non trouvé."
            exit 1
        fi
    fi
}

# Nettoyer les conteneurs existants
cleanup() {
    print_message "Nettoyage des conteneurs existants..."
    docker-compose down --remove-orphans
}

# Construire les images
build_images() {
    print_message "Construction des images Docker..."
    docker-compose build --no-cache
}

# Démarrer les services
start_services() {
    local mode=${1:-dev}
    
    if [ "$mode" = "prod" ]; then
        print_message "Démarrage en mode production..."
        docker-compose --profile production up -d
    else
        print_message "Démarrage en mode développement..."
        docker-compose up -d
    fi
}

# Attendre que les services soient prêts
wait_for_services() {
    print_message "Attente que les services soient prêts..."
    
    # Attendre MongoDB
    print_message "Attente de MongoDB..."
    until docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        sleep 2
    done
    
    # Attendre l'API
    print_message "Attente de l'API..."
    until curl -f http://localhost:5000/health > /dev/null 2>&1; do
        sleep 2
    done
    
    # Attendre le frontend
    print_message "Attente du frontend..."
    until curl -f http://localhost/health > /dev/null 2>&1; do
        sleep 2
    done
}

# Afficher les informations de connexion
show_info() {
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}  JGazette est prêt !           ${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "${BLUE}Frontend:${NC} http://localhost"
    echo -e "${BLUE}API:${NC}      http://localhost:5000"
    echo -e "${BLUE}MongoDB:${NC}  localhost:27017"
    echo ""
    echo -e "${YELLOW}Pour voir les logs:${NC}"
    echo -e "  docker-compose logs -f"
    echo ""
    echo -e "${YELLOW}Pour arrêter:${NC}"
    echo -e "  docker-compose down"
    echo ""
    echo -e "${YELLOW}Pour redémarrer:${NC}"
    echo -e "  ./start.sh"
}

# Fonction principale
main() {
    local mode=${1:-dev}
    
    print_header
    check_docker
    check_env_file
    cleanup
    build_images
    start_services "$mode"
    wait_for_services
    show_info
}

# Gestion des arguments
case "${1:-dev}" in
    "dev"|"development")
        main "dev"
        ;;
    "prod"|"production")
        main "prod"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: ./start.sh [dev|prod]"
        echo ""
        echo "Options:"
        echo "  dev, development  Démarrage en mode développement (défaut)"
        echo "  prod, production  Démarrage en mode production avec nginx"
        echo "  help, -h, --help   Afficher cette aide"
        ;;
    *)
        print_error "Option invalide: $1"
        echo "Usage: ./start.sh [dev|prod]"
        exit 1
        ;;
esac
