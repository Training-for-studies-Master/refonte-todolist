const { execSync } = require("child_process");
const manifest = require("../compatibility-manifest.json");

const owner = (process.env.OWNER_LC || "Training-for-studies-Master").toLowerCase();

// 👉 liste de tes images (adapte si besoin)
const images = {
  auth: `ghcr.io/${owner}/auth:latest`,
  tasks: `ghcr.io/${owner}/tasks:latest`,
  gateway: `ghcr.io/${owner}/gateway:latest`,
  notifications: `ghcr.io/${owner}/notifications:latest`,
  frontend: `ghcr.io/${owner}/frontend:latest`,
  projects: `ghcr.io/${owner}/projects:latest`,
};

// 👇 COPIE ET COLLE CE BLOC ICI :
console.log("=== DEBUG DIRECT DE L'IMAGE AUTH ===");
try {
  const rawLabels = execSync(`docker inspect ${images.auth} --format '{{ json .Config.Labels }}'`).toString();
  console.log("Labels bruts trouves pour auth :", rawLabels);
} catch(e) {
  console.error("Impossible d'inspecter auth en direct :", e.message);
}
console.log("====================================\n");

// ----------------------------
// Récupère les labels Docker
// ----------------------------
function getDockerLabels(image) {
  try {
    const output = execSync(
      `docker inspect ${image} --format '{{ json .Config.Labels }}'`,
      { stdio: ['pipe', 'pipe', 'inherit'] }
    ).toString();

    return JSON.parse(output) || {};
  } catch (err) {
    console.error(`❌ Erreur critique lors de l'inspect de l'image : ${image}`);
    process.exit(1);
  }
}

// ----------------------------
// Compare versions (simple semver range)
// ----------------------------
function isCompatible(range, version) {
  // range: ">=1.0.0 <=2.0.0"
  const match = range.match(/(\d+\.\d+\.\d+)/g);
  if (!match) return false;

  const min = match[0].split(".").map(Number);
  const max = match[1] ? match[1].split(".").map(Number) : null;
  const v = version.split(".").map(Number);

  const toNum = (a) => a[0] * 10000 + a[1] * 100 + a[2];

  const vNum = toNum(v);
  const minNum = toNum(min);
  const maxNum = max ? toNum(max) : Infinity;

  return vNum >= minNum && vNum <= maxNum;
}

// ----------------------------
// MAIN CHECK
// ----------------------------
let ok = true;

console.log("\n🔍 Checking service compatibility via Docker labels...\n");

for (const service in manifest) {
  const rules = manifest[service];

  const image = images[service];
  const labels = getDockerLabels(image);

  const provides = labels["provides.api-version"];

  console.log(`\n📦 Service: ${service}`);
  console.log(`   Image: ${image}`);
  console.log(`   Provides: ${provides}`);

  if (provides !== rules.provides) {
    console.error(
      `❌ API mismatch for ${service}: expected ${rules.provides}, got ${provides}`
    );
    ok = false;
  }

  for (const dep in rules.requires) {
    const requiredRange = rules.requires[dep];

    const depImage = images[dep];
    const depLabels = getDockerLabels(depImage);

    const depVersion = depLabels["service.version"];

    console.log(`   → depends on ${dep}`);
    console.log(`     version: ${depVersion}`);
    console.log(`     required: ${requiredRange}`);

    if (!depVersion) {
      console.error(`❌ Missing version label for ${dep}`);
      ok = false;
      continue;
    }

    const compatible = isCompatible(requiredRange, depVersion);

    if (!compatible) {
      console.error(
        `❌ INCOMPATIBLE: ${service} requires ${dep} ${requiredRange} but found ${depVersion}`
      );
      ok = false;
    } else {
      console.log(`   ✅ compatible`);
    }
  }
}

if (!ok) {
  console.error("\n❌ Compatibility check FAILED");
  process.exit(1);
}

console.log("\n✅ All services are compatible");