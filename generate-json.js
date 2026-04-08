const fs = require("fs");
const path = require("path");

const BASE = "./tests/providers";
const OUTPUT = "./data/series-manifest.json";

// 🔥 normalize function (IMPORTANT)
function normalize(name) {
  return name.toLowerCase().replace(/[\s-_]/g, "");
}

function getDirs(dir) {
  return fs.readdirSync(dir).filter(f =>
    fs.statSync(path.join(dir, f)).isDirectory()
  );
}

function generate() {
  const branchesMap = {};

  const providers = getDirs(BASE);

  providers.forEach(provider => {
    const providerPath = path.join(BASE, provider);

    getDirs(providerPath).forEach(branch => {
      const branchPath = path.join(providerPath, branch);

      const files = fs.readdirSync(branchPath).filter(f => f.endsWith(".html"));
      if (!files.length) return;

      const branchKey = normalize(branch);

      // ✅ create branch if not exists
      if (!branchesMap[branchKey]) {
        branchesMap[branchKey] = {
          name: branch.replace(/[-_]/g, " "),
          providers: []
        };
      }

      const branchObj = branchesMap[branchKey];

      // ✅ check if provider already exists
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

      // ✅ add series
      providerObj.series.push({
        name: "All",
        tests: files.map(f => ({
          title: f.replace(".html", ""),
          path: `/tests/providers/${provider}/${branch}/${f}` // 🔥 FIXED PATH
        }))
      });
    });
  });

  const branches = Object.values(branchesMap);

  fs.writeFileSync(OUTPUT, JSON.stringify({ branches }, null, 2));
  console.log("🔥 JSON GENERATED CORRECTLY");
}

generate();