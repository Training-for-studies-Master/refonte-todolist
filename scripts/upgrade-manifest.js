const fs = require('fs');
const path = require('path');

// Récupération des arguments : node upgrade-manifest.js <service-name> <new-version-or-bump-type>
const serviceName = process.argv[2]; 
const bumpType = process.argv[3] || 'patch'; // 'major', 'minor', ou 'patch'

if (!serviceName) {
  console.error("❌ Veuillez spécifier le nom du service (ex: auth, tasks...)");
  process.exit(1);
}

const manifestPath = path.join(__dirname, '../compatibility-manifest.json');

// 1. Lire le manifeste actuel
if (!fs.existsSync(manifestPath)) {
  console.error(`❌ Manifeste introuvable à l'emplacement : ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (!manifest[serviceName]) {
  console.error(`❌ Le service "${serviceName}" n'existe pas dans le manifeste.`);
  process.exit(1);
}

// 2. Fonction pour incrémenter une version SemVer (X.Y.Z)
function bumpVersion(currentVersion, type) {
  // On nettoie si jamais il y a des symboles, mais on attend une version pure "1.0.0"
  let parts = currentVersion.replace(/[^0-9.]/g, '').split('.').map(Number);
  
  if (parts.length !== 3) parts = [1, 0, 0]; // Fallback

  if (type === 'major') {
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
  } else if (type === 'minor') {
    parts[1] += 1;
    parts[2] = 0;
  } else { // patch par défaut
    parts[2] += 1;
  }

  return parts.join('.');
}

// Exemple d'évolution : si ton provides est "v1", "v2", on extrait le chiffre.
// Si c'est du SemVer pur, on utilise bumpVersion.
const currentProvides = manifest[serviceName].provides;
let newProvides = currentProvides;
if (currentProvides.startsWith('v')) {
  const currentNum = parseInt(currentProvides.replace('v', ''), 10);
  // On n'incrémente le 'provides' (l'API) QUE si c'est un breaking change (major)
  if (bumpType === 'major') {
    newProvides = `v${currentNum + 1}`;
  }
} else {
  newProvides = bumpVersion(currentProvides, bumpType);
}

// 3. Mettre à jour le manifeste
console.log(`🔄 Mise à jour du service [${serviceName}]...`);
console.log(`   Ancien provides: ${currentProvides} ➡️ Nouveau: ${newProvides}`);

manifest[serviceName].provides = newProvides;

// Optionnel : Mettre à jour les "requires" des AUTRES services si nécessaire ?
// Généralement, c'est le service lui-même qui déclare ce qu'il fournit.

// 4. Écrire le fichier modifié
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log("✅ Manifeste de compatibilité mis à jour avec succès !");