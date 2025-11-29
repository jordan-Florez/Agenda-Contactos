pipeline {
    agent any

    environment {
        // Token de Codecov configurado en Jenkins como Secret Text
        CODECOV_TOKEN = credentials('CODECOV_TOKEN')
    }

    stages {
        stage('Checkout') {
            steps {
                // Obtenemos el código del repositorio
                checkout scm
            }
        }

        stage('Setup Python') {
            steps {
                script {
                    // Activamos entorno virtual y instalamos dependencias
                    sh '''
                    python3 -m venv venv
                    source venv/bin/activate
                    pip install --upgrade pip
                    pip install -r backend/requirements.txt
                    '''
                }
            }
        }

        stage('Run Tests & Coverage') {
            steps {
                script {
                    sh '''
                    # Configuramos PYTHONPATH para que los imports funcionen
                    export PYTHONPATH=.
                    source venv/bin/activate
                    pytest --cov=backend --cov-report=xml
                    '''
                }
            }
        }

        stage('Upload Coverage to Codecov') {
            steps {
                script {
                    sh '''
                    source venv/bin/activate
                    bash <(curl -s https://codecov.io/bash) -t $CODECOV_TOKEN
                    '''
                }
            }
        }
    }

    post {
        always {
            // Guardar resultados de cobertura y logs aunque falle
            archiveArtifacts artifacts: 'coverage.xml', allowEmptyArchive: true
            junit 'backend/tests/test-results/*.xml' // si usas JUnit XML output
        }
        success {
            echo 'Pipeline ejecutado correctamente ✅'
        }
        failure {
            echo 'Pipeline falló ❌'
        }
    }
}
