const { execSync } = require('child_process');

const GITHUB_SHA = process.env.GITHUB_SHA || 'latest';
const COMPOSE_BASE = process.env.COMPOSE_FILES || '-f docker-compose.yml';

function runCommand(command) {
  console.log(`🏃 Executing: ${command}`);
  return execSync(command, { stdio: 'inherit' });
}

async function main() {
  console.log('🚀 Starting Blue-Green Deployment for RabbitMQ Microservices...');

  // 1. Détecter la couleur actuellement active
  let activeColor = 'blue';
  let targetColor = 'green';
  
  try {
    const runningContainers = execSync(`docker compose ${COMPOSE_BASE} ps --services --filter "status=running"`).toString();
    if (runningContainers.includes('-green')) {
      activeColor = 'green';
      targetColor = 'blue';
    }
  } catch (e) {
    console.log('⚠️ Impossible de détecter la couleur active (Premier déploiement ?). Cible par défaut : green');
  }

  console.log(`🟢 Active (Stable): ${activeColor} | Target (New): ${targetColor}`);
  let containersStarted = false;

  try {
    // 2. Lancer la nouvelle version (Target)
    process.env.TARGET_VERSION = GITHUB_SHA;
    console.log(`🛰️ Deploying ${targetColor} containers...`);
    runCommand(`docker compose ${COMPOSE_BASE} up -d gateway-${targetColor} auth-${targetColor}`);
    containersStarted = true;

    // 3. Healthcheck : On vérifie si les conteneurs tiennent la route et restent en "running"
    console.log(`⏳ Waiting for ${targetColor} containers to stabilize...`);
    let isHealthy = false;
    
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Attend 5 secondes entre chaque vérification
      
      try {
        const statusGateway = execSync(`docker compose ${COMPOSE_BASE} ps --format json gateway-${targetColor}`).toString();
        const statusAuth = execSync(`docker compose ${COMPOSE_BASE} ps --format json auth-${targetColor}`).toString();
        
        // On valide que les deux conteneurs sont bien actifs
        if (statusGateway.includes('"State":"running"') && statusAuth.includes('"State":"running"')) {
          isHealthy = true;
          break;
        }
      } catch (e) {
        isHealthy = false;
      }
      console.log(`… Retrying container healthcheck (${i + 1}/5)`);
    }

    if (!isHealthy) {
      throw new Error(`Containers ${targetColor} crashed or failed to start properly.`);
    }
    console.log(`✅ New version ${targetColor} is up and running smoothly!`);

    // 4. Éteindre proprement l'ancienne version
    // Grâce au fonctionnement de RabbitMQ, l'ancien conteneur va fermer sa queue exclusive, 
    // et le nouveau (déjà connecté avec sa propre queue exclusive sur le même Exchange) recevra tout le trafic.
    console.log(`💤 Stopping old version (${activeColor})...`);
    runCommand(`docker compose ${COMPOSE_BASE} stop gateway-${activeColor} auth-${activeColor}`);
    
    console.log('🏁 Deployment finished with success!');

  } catch (error) {
    console.error(`\n❌ DEPLOYMENT FAILED: ${error.message}`);
    
    if (containersStarted) {
      console.log(`🚨 ROLLING BACK: Stopping defective ${targetColor} containers...`);
      try {
        execSync(`docker compose ${COMPOSE_BASE} stop gateway-${targetColor} auth-${targetColor}`);
        console.log(`🛑 Defective ${targetColor} containers stopped.`);
      } catch (rollbackError) {
        console.error(`⚠️ Failed to stop defective containers: ${rollbackError.message}`);
      }
    }
    process.exit(1);
  }
}

main();