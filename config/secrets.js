const AWS = require('aws-sdk');

// Configura la región de AWS
AWS.config.update({ region: 'tu-region-aws' });

// Crea una instancia del cliente de Secrets Manager
const secretsManager = new AWS.SecretsManager();

// Función para obtener un secreto
async function getSecret(secretName) {
    try {
        const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
        if ('SecretString' in data) {
            return JSON.parse(data.SecretString);
        }
        throw new Error('Secret not found');
    } catch (error) {
        console.error('Error al obtener el secreto:', error);
        throw error;
    }
}

module.exports = { getSecret };
