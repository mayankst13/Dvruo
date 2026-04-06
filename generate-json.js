const fs = require("fs");
const path = require("path");

const BASE = "./tests/providers";
const OUTPUT = "./data/series-manifest.json";

function getDirs(dir) {
  return fs.readdirSync(dir).filter(f =>
    fs.statSync(path.join(dir, f)).isDirectory()
  );
}

function generate() {
  const branches = [];

  const providers = getDirs(BASE);

  providers.forEach(provider => {
    const providerPath = path.join(BASE, provider);

    getDirs(providerPath).forEach(branch => {
      const branchPath = path.join(providerPath, branch);

      const files = fs.readdirSync(branchPath).filter(f => f.endsWith(".html"));

      if (!files.length) return;

      let branchObj = branches.find(b => b.name === branch);

      if (!branchObj) {
        branchObj = { name: branch, providers: [] };
        branches.push(branchObj);
      }

      branchObj.providers.push({
        name: provider,
        series: [{
          name: "All",
          tests: files.map(f => ({
            title: f,
            path: `${branchPath}/${f}`.replace(/\\/g, "/")
          }))
        }]
      });
    });
  });

  fs.writeFileSync(OUTPUT, JSON.stringify({ branches }, null, 2));
  console.log("🔥 JSON GENERATED");
}

generate();