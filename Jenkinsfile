pipeline {
    agent any

    environment {
        CODECOV_TOKEN = credentials('CODECOV_TOKEN')
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
                    echo "Eliminando contenedores viejos si existen..."
                    sh "docker rm -f agenda_backend || true"
                    sh "docker rm -f agenda_frontend || true"

                    echo "Subiendo contenedores..."
                    sh "docker-compose up -d --build"
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                script {
                    echo "Ejecutando tests en el backend..."
                    sh """
                        docker-compose exec -T -e CODECOV_TOKEN=\$CODECOV_TOKEN backend sh -c '
                        mkdir -p /app/tests/results &&
                        pytest --junitxml=/app/tests/results/results.xml &&
                        codecov
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                node {
                    echo "Archivando resultados de tests..."
                    archiveArtifacts artifacts: 'backend/tests/results/**/*.xml', allowEmptyArchive: true
                    junit 'backend/tests/results/**/*.xml'
                    echo 'Pipeline ejecutado ✅'
                }
            }
        }
        failure {
            echo 'Pipeline falló ❌'
        }
    }
}