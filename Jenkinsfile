pipeline {
    // Define el agente como un contenedor Docker.
    agent {
        dockerfile {
            // Asume que el Dockerfile para el backend está en el subdirectorio 'backend/'
            dir 'backend'
            filename 'Dockerfile'
        }
    }

    environment {
        // Token de Codecov almacenado en Jenkins
        CODECOV_TOKEN = credentials('codecov-token-id')
    }

    stages {
        stage('Checkout') {
            steps {
                // El checkout del SCM debe ir primero
                checkout scm
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo 'Ejecutando tests y generando reportes de cobertura...'
                // Ejecutamos los comandos DENTRO del contenedor Docker.
                // --cov=backend: Asegura que pytest mida la cobertura del módulo 'backend'.
                // --cov-report=xml:coverage.xml: Genera el reporte de cobertura en formato XML.
                // --junitxml=results.xml: Genera el reporte JUnit para Jenkins.
                sh '''
                    pytest --cov=backend --cov-report=xml:coverage.xml --junitxml=results.xml
                '''
            }
        }

        stage('Upload coverage') {
            steps {
                echo 'Subiendo cobertura a Codecov...'
                // Usamos el archivo 'coverage.xml' (NO results.xml) para Codecov
                sh "codecov -t $CODECOV_TOKEN -f coverage.xml"
            }
        }
    }

    post {
        always {
            echo 'Archivando resultados de tests...'
            // El paso 'junit' ahora se ejecuta con el contexto de agente correcto.
            junit '**/results.xml'
        }
        success {
            echo '✅ Pipeline finalizó correctamente. Artefactos listos para el despliegue.'
        }
        failure {
            echo '❌ Pipeline falló. Revisar logs de tests y cobertura.'
        }
    }
}