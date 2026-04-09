const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "tests/providers");
const OUTPUT = path.join(__dirname, "data/series-manifest.json");

function normalize(name) {
  return name.toLowerCase().trim();
}

function getDirs(dir) {
  return fs.readdirSync(dir).filter(f =>
    fs.statSync(path.join(dir, f)).isDirectory()
  );
}

// 🔥 RECURSIVE HTML FILE FINDER
function getAllHtmlFiles(dir) {
  let results = [];

  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(filePath)); // recursion
    } else {
      if (file.toLowerCase().endsWith(".html")) {
        results.push(filePath);
      }
    }
  });

  return results;
}

function generate() {
  const branchesMap = {};

  console.log("BASE:", BASE);

  const branches = getDirs(BASE);
  console.log("Branches found:", branches);

  branches.forEach(branch => {
    const branchPath = path.join(BASE, branch);
    const providers = getDirs(branchPath);

    console.log(`➡️ Branch: ${branch}`);
    console.log(`   Providers:`, providers);

    providers.forEach(provider => {
      const providerPath = path.join(branchPath, provider);

      // 🔥 get ALL html files (recursive)
      const files = getAllHtmlFiles(providerPath);

      if (!files.length) {
        console.log(`❌ No HTML files in: ${providerPath}`);
        return;
      }

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
          title: path.basename(f).replace(/\.html$/i, ""),
          path: f
            .replace(__dirname, "")
            .replace(/\\/g, "/") // windows fix
        }))
      });
    });
  });

  const branchesArr = Object.values(branchesMap);

  fs.writeFileSync(OUTPUT, JSON.stringify({ branches: branchesArr }, null, 2));

  console.log("🔥 JSON GENERATED CORRECTLY");
}

generate();