pipeline {
    agent any

    environment {
        CODECOV_TOKEN = credentials('codecov-token') // Asegúrate que exista en Jenkins
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
                    // Bajar contenedores si ya estaban corriendo
                    sh 'docker-compose down || true'

                    // Levantar contenedores en background
                    sh 'docker-compose up -d --build'
                }
            }
        }

        stage('Run Tests in Backend Container') {
            steps {
                script {
                    // Ejecutar tests directamente dentro del contenedor backend
                    sh '''
                    docker-compose exec backend bash -c "
                        python -m venv venv
                        source venv/bin/activate
                        pip install --upgrade pip
                        pip install -r backend/requirements.txt
                        pytest --cov=backend --cov-report=xml --junitxml=backend/tests/test-results/results.xml
                    "
                    '''
                }
            }
        }

        stage('Upload Coverage to Codecov') {
            steps {
                script {
                    sh '''
                    docker-compose exec backend bash -c "
                        source venv/bin/activate
                        bash <(curl -s https://codecov.io/bash) -t $CODECOV_TOKEN
                    "
                    '''
                }
            }
        }
    }

    post {
        always {
            node {
                // Archivar los resultados de los tests
                archiveArtifacts artifacts: 'backend/tests/test-results/**/*.xml', allowEmptyArchive: true
                junit 'backend/tests/test-results/**/*.xml'
                echo 'Pipeline ejecutado ✅'
            }
        }
        failure {
            echo 'Pipeline falló ❌'
        }
    }
}
