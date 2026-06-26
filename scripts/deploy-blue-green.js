const { execSync } = require('child_process');

const GITHUB_SHA = process.env.GITHUB_SHA || 'latest';
const COMPOSE_BASE = process.env.COMPOSE_FILES || '-f docker-compose.yml';

// 1. Liste complète de tous vos services dédoublés (SANS le suffixe -blue/-green)
const SERVICES_TO_DEPLOY = ['frontend', 'gateway', 'auth', 'tasks', 'projects', 'notifications'];

function runCommand(command) {
  console.log(`🏃 Executing: ${command}`);
  return execSync(command, { stdio: 'inherit' });
}

// Fonction utilitaire pour générer la liste des conteneurs cibles avec leur couleur
function getServiceNamesWithColor(color) {
  return SERVICES_TO_DEPLOY.map(service => `${service}-${color}`).join(' ');
}

async function main() {
  console.log('🚀 Starting Blue-Green Deployment for RabbitMQ Microservices...');

  // 2. Détecter la couleur actuellement active
  let activeColor = 'blue';
  let targetColor = 'green';
  
  try {
    const runningContainers = execSync(`docker compose ${COMPOSE_BASE} ps --services --filter "status=running"`).toString();
    // Si un seul des services green tourne, on considère que la prod actuelle est Green
    if (runningContainers.includes('-green')) {
      activeColor = 'green';
      targetColor = 'blue';
    }
  } catch (e) {
    console.log('⚠️ Impossible de détecter la couleur active (Premier déploiement ?). Cible par défaut : green');
  }

  console.log(`🟢 Active (Stable): ${activeColor} | Target (New): ${targetColor}`);
  let containersStarted = false;

  const targetServicesList = getServiceNamesWithColor(targetColor);
  const activeServicesList = getServiceNamesWithColor(activeColor);

  try {
    // MODIFICATION OPTIMISATION RAM : 
    // On éteint l'ancien frontend et l'ancienne gateway pour libérer ~1 Go de RAM immédiatement.
    // Nginx restera debout et les autres microservices (auth, tasks...) continueront de traiter les files RabbitMQ en tâche de fond.
    console.log(`🧹 Optimization: Stopping old frontend and gateway to free up RAM...`);
    try {
      execSync(`docker compose ${COMPOSE_BASE} stop frontend-${activeColor} gateway-${activeColor}`);
    } catch (e) {
      console.log('⚠️ Aucun ancien conteneur frontend/gateway à arrêter.');
    }

    // 3. Lancer TOUTE la nouvelle version (Target)
    process.env.TARGET_VERSION = GITHUB_SHA;
    console.log(`🛰️ Deploying ${targetColor} containers (${targetServicesList})...`);
    runCommand(`docker compose ${COMPOSE_BASE} up -d ${targetServicesList}`);
    containersStarted = true;

    // 4. Healthcheck global : On vérifie si TOUS les nouveaux conteneurs restent en "running"
    console.log(`⏳ Waiting for ${targetColor} containers to stabilize...`);
    let isHealthy = false;
    
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Attend 5 secondes
      
      try {
        // On demande le statut brut de tous les conteneurs de la cible
        const runningServices = execSync(`docker compose ${COMPOSE_BASE} ps --services --filter "status=running"`).toString();
        
        // On vérifie que chaque service attendu est bien dans la liste des conteneurs qui tournent
        const allRunning = SERVICES_TO_DEPLOY.every(service => runningServices.includes(`${service}-${targetColor}`));
        
        if (allRunning) {
          isHealthy = true;
          break;
        }
      } catch (e) {
        isHealthy = false;
      }
      console.log(`… Retrying container healthcheck (${i + 1}/6)`);
    }

    if (!isHealthy) {
      throw new Error(`One or more containers in ${targetColor} environment crashed or failed to start properly.`);
    }
    console.log(`✅ New version ${targetColor} is up and running smoothly!`);

    // 5. Éteindre proprement le RESTE de l'ancienne version (les microservices restants)
    console.log(`💤 Stopping remaining old version services (${activeColor})...`);
    runCommand(`docker compose ${COMPOSE_BASE} stop ${activeServicesList}`);
    
    // 6. Recharger Nginx pour s'assurer qu'il pointe sur la nouvelle couleur
    console.log(`📺 Reloading Nginx configuration...`);
    try {
      execSync(`docker compose ${COMPOSE_BASE} exec -T nginx nginx -s reload`);
    } catch (nginxError) {
      console.log(`⚠️ Nginx reload failed, trying a hard restart...`);
      execSync(`docker compose ${COMPOSE_BASE} restart nginx`);
    }

    console.log('🏁 Deployment finished with success!');

  } catch (error) {
    console.error(`\n❌ DEPLOYMENT FAILED: ${error.message}`);
    
    if (containersStarted) {
      console.log(`🚨 ROLLING BACK: Stopping defective ${targetColor} containers...`);
      try {
        execSync(`docker compose ${COMPOSE_BASE} stop ${targetServicesList}`);
        console.log(`🛑 Defective ${targetColor} containers stopped.`);
        
        // En cas d'échec, on relance d'urgence l'ancien frontend et gateway qu'on avait coupés au début
        console.log(`↩️ Restarting old frontend and gateway to restore service...`);
        execSync(`docker compose ${COMPOSE_BASE} start frontend-${activeColor} gateway-${activeColor}`);
      } catch (rollbackError) {
        console.error(`⚠️ Failed to rollback properly: ${rollbackError.message}`);
      }
    }
    process.exit(1);
  }
}

main();