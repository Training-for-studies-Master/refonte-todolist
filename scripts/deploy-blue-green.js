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
// ex: ['frontend-blue', 'gateway-blue', ...]
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

    // 5. Éteindre proprement l'ancienne version
    // Vos consommateurs RabbitMQ actuels vont fermer leurs connexions, 
    // et les nouveaux prendront le relai instantanément sans perte de message.
    console.log(`💤 Stopping old version (${activeColor})...`);
    runCommand(`docker compose ${COMPOSE_BASE} stop ${activeServicesList}`);
    
    console.log('🏁 Deployment finished with success!');

  } catch (error) {
    console.error(`\n❌ DEPLOYMENT FAILED: ${error.message}`);
    
    if (containersStarted) {
      console.log(`🚨 ROLLING BACK: Stopping defective ${targetColor} containers...`);
      try {
        execSync(`docker compose ${COMPOSE_BASE} stop ${targetServicesList}`);
        console.log(`🛑 Defective ${targetColor} containers stopped.`);
      } catch (rollbackError) {
        console.error(`⚠️ Failed to stop defective containers: ${rollbackError.message}`);
      }
    }
    process.exit(1);
  }
}

main();