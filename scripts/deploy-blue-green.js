const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const NGINX_CONF_PATH = path.join(__dirname, '../nginx.conf');
const GITHUB_SHA = process.env.GITHUB_SHA || 'latest';

async function runCommand(command) {
  try {
    console.log(`🏃 Executing: ${command}`);
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

async function checkHealth(port) {
  // On simule un fetch basique sans dépendance externe (via curl)
  try {
    const response = execSync(`curl -s http://localhost:${port}/health`).toString();
    return response.includes('OK');
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Blue-Green Deployment...');

  // 1. Détecter la couleur active en lisant le fichier nginx.conf
  const nginxConf = fs.readFileSync(NGINX_CONF_PATH, 'utf8');
  let activeColor = 'blue';
  let targetColor = 'green';
  let targetPort = '8082';

  if (nginxConf.includes('backend_green')) {
    activeColor = 'green';
    targetColor = 'blue';
    targetPort = '8081';
  }

  console.log(`🟢 Active color: ${activeColor} | Target color: ${targetColor} (Port ${targetPort})`);

  // 2. Mettre à jour l'environnement et lancer la couleur cible
  process.env.TARGET_VERSION = GITHUB_SHA;
  console.log(`📦 Deploying version: ${GITHUB_SHA}`);
  
  await runCommand(`docker compose up -d gateway-${targetColor} auth-${targetColor}`);

  // 3. Healthcheck de la nouvelle version (on tente 5 fois toutes les 5 secondes)
  console.log(`⏳ Waiting for ${targetColor} to be ready...`);
  let isHealthy = false;
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    isHealthy = await checkHealth(targetPort);
    if (isHealthy) break;
    console.log(`… Retrying healthcheck (${i + 1}/5)`);
  }

  if (!isHealthy) {
    console.error(`❌ Healthcheck failed on port ${targetPort}. Aborting deployment.`);
    process.exit(1);
  }
  console.log(`✅ Target service ${targetColor} is healthy!`);

  // 4. Modifier le fichier nginx.conf pour basculer le trafic
  console.log(`🔄 Switching traffic from ${activeColor} to ${targetColor}...`);
  const updatedNginxConf = nginxConf.replace(`backend_${activeColor}`, `backend_${targetColor}`);
  fs.writeFileSync(NGINX_CONF_PATH, updatedNginxConf, 'utf8');

  // 5. Recharger Nginx sans coupure
  await runCommand('docker compose exec -T proxy nginx -s reload');
  console.log(`🎉 Traffic successfully routed to ${targetColor}!`);

  // 6. Éteindre proprement l'ancienne couleur
  console.log(`💤 Stopping old version (${activeColor})...`);
  await runCommand(`docker compose stop gateway-${activeColor} auth-${activeColor}`);
  
  console.log('🏁 Deployment finished with success!');
}

main();