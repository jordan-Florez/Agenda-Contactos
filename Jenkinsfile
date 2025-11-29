pipeline {
    agent any

    parameters {
        choice(
            name: 'OPERATION',
            description: '¿Qué quieres hacer?',
            choices: ['up', 'down', 'restart', 'test-backend', 'clean']
        )
        choice(
            name: 'SERVICE',
            description: 'Servicio objetivo (para restart)',
            choices: ['backend', 'frontend', 'all']
        )
        string(
            name: 'TAIL',
            defaultValue: '200',
            description: 'Líneas de logs a mostrar (solo en test/logs si lo usas luego)'
        )
    }

    environment {
        // VARIABLES DE TU AMIGO (Mantenidas por estructura)
        COMPOSE       = 'docker compose'
        COMPOSE_FILES = '-f docker-compose.yml -f docker-compose.ci.yml'
        PROFILE       = '--profile app'
        PROJECT       = '-p gestor-operaciones-ci'
        
        // TUS VARIABLES ESPECÍFICAS AÑADIDAS
        CODECOV_TOKEN = credentials('codecov-token-id')
        APP_DIR = "backend"
        IMAGE_TAG = "agenda-contactos-backend:${env.BUILD_NUMBER}"
    }

    options {
        disableConcurrentBuilds()
        // skipDefaultCheckout(true) // si algún día quieres desactivar el checkout implícito
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'ls -la'
            }
        }

        stage('Docker Info') {
            steps {
                sh """
                    set -e
                    echo '>>> Docker version'
                    docker version

                    echo ''
                    echo '>>> docker compose ps (stack CI: gestor-operaciones-ci)'
                    ${COMPOSE} ${PROJECT} ${COMPOSE_FILES} ${PROFILE} ps || true
                """
            }
        }

        stage('Run Operation') {
            steps {
                script {
                    def baseCmd = "${COMPOSE} ${PROJECT} ${COMPOSE_FILES} ${PROFILE}"

                    echo "Operación seleccionada: ${params.OPERATION}"
                    echo "Servicio objetivo: ${params.SERVICE}"

                    switch (params.OPERATION) {

                    case 'up':
                        echo "Levantando stack CI (build + up -d)..."
                        sh """
                            set -e
                            ${baseCmd} up -d --build
                            ${baseCmd} ps
                        """

                        // 🔍 helper para saber si el backend está corriendo
                        def isBackendRunning = {
                            return sh(
                                script: "${baseCmd} ps -q backend",
                                returnStdout: true
                            ).trim()
                        }

                        // 🕒 pequeña espera inicial
                        sleep 5

                        if (!isBackendRunning()) {
                            echo "⚠️ Backend no está corriendo tras el primer up. Haciendo un intento de restart..."

                            // Intento de restart
                            sh """
                                set -e
                                ${baseCmd} restart backend || true
                                sleep 5
                                ${baseCmd} ps || true
                            """

                            // Volvemos a comprobar
                            if (!isBackendRunning()) {
                                echo "❌ Backend sigue caído después del restart. Mostrando info de debug..."

                                // Logs y estado del contenedor
                                sh """
                                    echo '>>> docker ps -a (filtrando backend)...'
                                    docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Image}}' | grep backend || true

                                    echo ''
                                    echo '>>> Logs del backend (últimas ${params.TAIL} líneas)...'
                                    ${baseCmd} logs backend --tail=${params.TAIL} || true

                                    echo ''
                                    echo '>>> Inspect del contenedor backend (si existe)...'
                                    docker inspect gestor-operaciones-ci-backend-1 || true
                                """

                                error "Backend no se pudo levantar en CI (ver logs anteriores)."
                            } else {
                                echo "✅ Backend quedó corriendo después del restart."
                            }

                        } else {
                            echo "✅ Backend está corriendo después del primer up."
                        }

                        break
                    case 'down':
                        echo "Bajando stack CI (down --remove-orphans)..."
                        sh """
                            set -e
                            ${baseCmd} down --remove-orphans
                            ${baseCmd} ps || true
                        """
                        break

                    case 'restart':
                        if (params.SERVICE == 'all') {
                            echo "Reiniciando todos los servicios del stack CI..."
                            sh """
                                set -e
                                ${baseCmd} restart
                                ${baseCmd} ps
                            """
                        } else {
                            echo "Reiniciando solo el servicio: ${params.SERVICE}"
                            sh """
                                set -e
                                ${baseCmd} restart ${params.SERVICE}
                                ${baseCmd} ps
                            """
                        }
                        break
                        
                    case 'test-backend':
                        // Bloque de Stage para Build y Test de TU PROYECTO
                        stage('Build & Test Backend') {
                            echo "Operación seleccionada: ${OPERATION}"
                            echo "Servicio objetivo: ${SERVICE}"
                            
                            echo '>>> Construyendo la imagen para tests...'
                            sh "docker build -t ${env.IMAGE_TAG} -f ${env.APP_DIR}/Dockerfile ${env.APP_DIR}"
                            
                            echo '>>> Ejecutando pytest + coverage (docker run)...'
                            sh """
                                docker run --rm \
                                -v ${WORKSPACE}/${env.APP_DIR}:/app \
                                -w /app \
                                ${env.IMAGE_TAG} \
                                /bin/bash -c "pytest --cov=. --cov-report=xml:coverage.xml --junitxml=results.xml"
                            """

                            // Verifica si el archivo se generó
                            if (sh(script: "test -f ${env.APP_DIR}/results.xml", returnStatus: true) != 0) {
                                echo "❌ El archivo results.xml no fue generado. Fallo en tests o permisos."
                                error "Tests fallidos o archivo de reporte no encontrado."
                            } else {
                                echo "✅ Reportes generados con éxito."
                            }
                        }
                        
                        // Etapa para Subir Cobertura
                        stage('Upload Coverage') {
                            echo 'Subiendo cobertura a Codecov...'
                            sh "codecov -t ${env.CODECOV_TOKEN} -f ${env.APP_DIR}/coverage.xml"
                        }
                        
                        break
                        
                    case 'clean':
                        echo "Bajando stack CI (down --remove-orphans) y limpiando imágenes..."
                        sh """
                            set -e
                            ${baseCmd} down --remove-orphans || true
                            docker rmi ${env.IMAGE_TAG} --force || true
                            docker rmi ${env.IMAGE_TAG} --force || true
                            docker rmi ${env.IMAGE_TAG} --force || true
                            ${baseCmd} ps || true
                        """
                        break
                    
                    default:
                        error "Operación no soportada: ${params.OPERATION}"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo "Post actions: archivando y limpiando..."
                
                // TUS NECESIDADES DE ARCHIVADO Y LIMPIEZA
                echo '📄 Archivando resultados de tests...'
                node {
                    junit "${env.APP_DIR}/results.xml"
                }

                echo '🧹 Limpiando imagen de Docker...'
                node { 
                    sh "docker rmi ${env.IMAGE_TAG} || true" 
                }
                
                // LOG DE TU AMIGO
                echo "Post actions: estado final del stack CI (gestor-operaciones-ci):"
                sh """
                    ${COMPOSE} ${PROJECT} ${COMPOSE_FILES} ${PROFILE} ps || true
                """
            }
        }
        success {
            echo '✅ Pipeline finalizó correctamente.'
        }
        failure {
            echo '❌ Pipeline falló. Revisar logs de tests y cobertura.'
        }
    }
}