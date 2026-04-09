const fs = require("fs");
const path = require("path");

const BASE = "./tests/providers";
const OUTPUT = "./data/series-manifest.json";

function normalize(name) {
  return name.toLowerCase().trim(); // 🔥 simple + safe
}

function getDirs(dir) {
  return fs.readdirSync(dir).filter(f =>
    fs.statSync(path.join(dir, f)).isDirectory()
  );
}

function generate() {
  const branchesMap = {};

  // ❗ FIRST LEVEL = BRANCHES (FIXED)
  const branches = getDirs(BASE);

  branches.forEach(branch => {
    const branchPath = path.join(BASE, branch);

    // ❗ SECOND LEVEL = PROVIDERS (FIXED)
    const providers = getDirs(branchPath);

    providers.forEach(provider => {
      const providerPath = path.join(branchPath, provider);

      const files = fs.readdirSync(providerPath).filter(f => f.endsWith(".html"));
      if (!files.length) return;

      const branchKey = normalize(branch);

      // ✅ create branch
      if (!branchesMap[branchKey]) {
        branchesMap[branchKey] = {
          name: branch,
          providers: []
        };
      }

      const branchObj = branchesMap[branchKey];

      // ✅ check provider exists
      let providerObj = branchObj.providers.find(
        p => normalize(p.name) === normalize(provider)
      );

      if (!providerObj) {
        providerObj = {
          name: provider,
          series: []
        };
        branchObj.providers.push(providerObj);
      }

      // ✅ add tests
      providerObj.series.push({
        name: "All",
        tests: files.map(f => ({
          title: f.replace(".html", ""),
          path: `/tests/providers/${branch}/${provider}/${f}` // 🔥 PATH FIXED
        }))
      });
    });
  });

  const branchesArr = Object.values(branchesMap);

  fs.writeFileSync(OUTPUT, JSON.stringify({ branches: branchesArr }, null, 2));
  console.log("🔥 JSON GENERATED CORRECTLY (FIXED)");
}

generate();