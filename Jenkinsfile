pipeline {
    agent any

    environment {
        // ID de la credencial que guardaste en Jenkins para Codecov
        CODECOV_TOKEN = credentials('codecov-token-id')
        PYTHONPATH = '.'  // Para que pytest encuentre tu módulo backend
    }

    options {
        // Mantener solo 10 builds para no llenar disco
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout de 30 minutos por build
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Python') {
            steps {
                script {
                    // Activar el virtualenv si es necesario
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
                        pip install --upgrade pip
                        pip install -r backend/requirements.txt
                    '''
                }
            }
        }

        stage('Run Tests & Coverage') {
            steps {
                script {
                    // Correr los tests con coverage
                    sh '''
                        . venv/bin/activate
                        PYTHONPATH=. pytest --cov=backend --cov-report=xml
                    '''
                }
            }
        }

        stage('Upload Coverage to Codecov') {
            steps {
                script {
                    sh '''
                        . venv/bin/activate
                        bash <(curl -s https://codecov.io/bash) -t $CODECOV_TOKEN
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                // Guardar los logs de pytest y coverage en artifacts opcionalmente
                archiveArtifacts artifacts: '**/coverage.xml', allowEmptyArchive: true
                junit 'backend/tests/**/*.xml'  // Si usas pytest-junitxml
            }
        }
        success {
            echo "Pipeline ejecutado correctamente ✅"
        }
        failure {
            echo "Pipeline falló ❌"
        }
    }
}
