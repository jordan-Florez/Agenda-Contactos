pipeline {
    agent any

    environment {
        CODECOV_TOKEN = credentials('codecove-token-id') // Cambia por el ID de tus credenciales en Jenkins
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Setup Containers') {
            steps {
                script {
                    echo 'Eliminando contenedores viejos si existen...'
                    sh 'docker rm -f agenda_backend || true'
                    sh 'docker rm -f agenda_frontend || true'

                    echo 'Subiendo contenedores...'
                    sh 'docker-compose up -d --build'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                script {
                    echo 'Ejecutando tests en el backend...'
                    // Crear carpeta de resultados y ejecutar pytest + codecov
                    sh '''
                        docker-compose exec -T -e CODECOV_TOKEN=$CODECOV_TOKEN backend sh -c "
                            mkdir -p /app/tests/results &&
                            pytest /app/tests --junitxml=/app/tests/results/results.xml -v &&
                            codecov --token=$CODECOV_TOKEN --commit=$(git rev-parse HEAD) --branch=$(git rev-parse --abbrev-ref HEAD)
                        "
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo 'Archivando resultados de tests...'
                // Ajusta la ruta si tu carpeta tests está dentro del backend
                junit 'backend/tests/results/**/*.xml'
            }
            echo 'Pipeline finalizado.'
        }
    }
}
