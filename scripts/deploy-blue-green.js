const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const NGINX_CONF_PATH = path.join(__dirname, '../nginx.conf');
const GITHUB_SHA = process.env.GITHUB_SHA || 'latest';

function runCommand(command) {
  console.log(`🏃 Executing: ${command}`);
  return execSync(command, { stdio: 'inherit' });
}

function checkHealth(port) {
  try {
    const response = execSync(`curl -s http://localhost:${port}/health`).toString();
    return response.includes('OK');
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Blue-Green Deployment...');

  // 1. Détecter la couleur active (actuelle) et la cible
  const nginxConf = fs.readFileSync(NGINX_CONF_PATH, 'utf8');
  let activeColor = 'blue';
  let targetColor = 'green';
  let targetPort = '8082';

  if (nginxConf.includes('backend_green')) {
    activeColor = 'green';
    targetColor = 'blue';
    targetPort = '8081';
  }

  console.log(`🟢 Active (Stable): ${activeColor} | Target (New): ${targetColor} (Port ${targetPort})`);

  // On garde en mémoire si on a démarré les conteneurs pour savoir s'il faut les nettoyer en cas de crash
  let containersStarted = false;

  try {
    // 2. Lancer la couleur cible avec la nouvelle version
    process.env.TARGET_VERSION = GITHUB_SHA;
    runCommand(`docker compose up -d gateway-${targetColor} auth-${targetColor}`);
    containersStarted = true;

    // 3. Healthcheck (5 tentatives toutes les 5 secondes)
    console.log(`⏳ Waiting for ${targetColor} to be ready...`);
    let isHealthy = false;
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      isHealthy = checkHealth(targetPort);
      if (isHealthy) break;
      console.log(`… Retrying healthcheck (${i + 1}/5)`);
    }

    // SI LE HEALTHCHECK ÉCHOUE, ON LANCE UNE ERREUR POUR ENTRER DANS LE CATCH
    if (!isHealthy) {
      throw new Error(`Healthcheck failed on port ${targetPort}`);
    }
    console.log(`✅ Target service ${targetColor} is healthy!`);

    // 4. Modifier nginx.conf pour basculer le trafic
    console.log(`🔄 Switching traffic from ${activeColor} to ${targetColor}...`);
    const updatedNginxConf = nginxConf.replace(`backend_${activeColor}`, `backend_${targetColor}`);
    fs.writeFileSync(NGINX_CONF_PATH, updatedNginxConf, 'utf8');

    // 5. Recharger Nginx sans coupure
    runCommand('docker compose exec -T proxy nginx -s reload');
    console.log(`🎉 Traffic successfully routed to ${targetColor}!`);

    // 6. Éteindre proprement l'ancienne couleur stable
    console.log(`💤 Stopping old version (${activeColor})...`);
    runCommand(`docker compose stop gateway-${activeColor} auth-${activeColor}`);
    
    console.log('🏁 Deployment finished with success!');

  } catch (error) {
    console.error(`\n❌ DEPLOYMENT FAILED: ${error.message}`);
    
    // ACTION DE ROLLBACK
    if (containersStarted) {
      console.log(`🚨 ROLLING BACK: Stopping defective ${targetColor} containers...`);
      try {
        // On stoppe les conteneurs qui viennent de rater le healthcheck
        execSync(`docker compose stop gateway-${targetColor} auth-${targetColor}`);
        console.log(`🛑 Defective ${targetColor} containers stopped.`);
      } catch (rollbackError) {
        console.error(`⚠️ Failed to stop defective containers: ${rollbackError.message}`);
      }
    }

    console.log(`ℹ️ Traffic was never switched. Production is still safely running on ${activeColor}.`);
    // On quitte avec un code d'erreur pour que GitHub Actions sache que le déploiement a échoué
    process.exit(1);
  }
}

main();