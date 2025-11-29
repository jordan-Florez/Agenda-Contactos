pipeline {
    agent any

    environment {
        CODECOV_TOKEN = credentials('codecov-token')
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Start Containers') {
            steps {
                sh '''
                    # Levantar contenedores si no están arriba
                    docker-compose -f docker-compose.yml up -d
                '''
            }
        }

        stage('Run Tests Inside Backend Container') {
            steps {
                sh '''
                    # Ejecutar los tests dentro del contenedor backend
                    docker exec backend-container-name bash -c "
                        source venv/bin/activate
                        pytest --cov=backend --cov-report=xml --junitxml=backend/tests/test-results/results.xml
                    "
                '''
            }
        }

        stage('Upload Coverage to Codecov') {
            steps {
                sh '''
                    docker exec backend-container-name bash -c "
                        source venv/bin/activate
                        bash <(curl -s https://codecov.io/bash) -t $CODECOV_TOKEN
                    "
                '''
            }
        }
    }

    post {
        always {
            script {
                node {
                    archiveArtifacts artifacts: 'backend/tests/test-results/**/*.xml', allowEmptyArchive: true
                    junit 'backend/tests/test-results/**/*.xml'
                    echo 'Pipeline ejecutado correctamente ✅'
                }
            }
        }
        failure {
            echo 'Pipeline falló ❌'
        }
    }
}
