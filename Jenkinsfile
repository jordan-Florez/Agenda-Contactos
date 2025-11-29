pipeline {
    agent any

    environment {
        // Aquí puedes definir variables generales si quieres
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
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
                    echo "Bajando contenedores si existen..."
                    sh "docker-compose down || true"

                    echo "Subiendo contenedores..."
                    sh "docker-compose up -d --build"
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'CODECOV_TOKEN', variable: 'CODECOV_TOKEN')]) {
                        echo "Ejecutando tests dentro del contenedor backend..."
                        // Usando docker-compose si lo tienes
                        sh """
                        docker-compose exec -T -e CODECOV_TOKEN=\$CODECOV_TOKEN backend sh -c '
                            pytest --cov=backend/tests --junitxml=backend/tests/test-results/results.xml
                            codecov
                        '
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                node {
                    echo "Archivando resultados de tests..."
                    archiveArtifacts artifacts: 'backend/tests/test-results/**/*.xml', allowEmptyArchive: true
                    junit 'backend/tests/test-results/**/*.xml'
                    echo 'Pipeline ejecutado ✅'
                }
            }
        }

        failure {
            echo 'Pipeline falló ❌'
        }
    }
}
