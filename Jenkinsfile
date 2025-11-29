pipeline {
    agent any

    environment {
        CODECOV_TOKEN = credentials('codecov-token') // Ajusta el ID de tu credencial
    }

    stages {

        stage('Stop Containers (if needed)') {
            steps {
                sh 'docker-compose down || true'
            }
        }

        stage('Start Containers') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        stage('Run Tests & Coverage in Backend Container') {
            steps {
                script {
                    // Ejecuta pytest dentro del contenedor backend
                    sh """
                    docker exec backend bash -c '
                        pip install --upgrade pip
                        pip install -r backend/requirements.txt
                        export PYTHONPATH=.
                        pytest --cov=backend --cov-report=xml --junitxml=backend/tests/test-results/results.xml
                    '
                    """
                }
            }
        }

        stage('Upload Coverage to Codecov') {
            steps {
                script {
                    sh """
                    docker exec backend bash -c '
                        bash <(curl -s https://codecov.io/bash) -t ${CODECOV_TOKEN}
                    '
                    """
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'backend/tests/test-results/**/*.xml', allowEmptyArchive: true
            junit 'backend/tests/test-results/**/*.xml'
            echo 'Pipeline ejecutado ✅'
        }
        failure {
            echo 'Pipeline falló ❌'
        }
    }
}
