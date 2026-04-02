let dataGlobal;

let state = {
  branch: null,
  academy: null,
  tests: [],
  filter: "all"
};

// LOAD
fetch("/api/tests")
.then(res => res.json())
.then(data => {
  dataGlobal = data;
  renderBranches();
  updateStats();
});

// STATS
function updateStats(){
  let branches = new Set();
  let totalTests = 0;

  dataGlobal.forEach(a=>{
    a.branches.forEach(b=>{
      branches.add(b.branch);
      totalTests += b.tests.length;
    });
  });

  document.getElementById("branch-count").innerText = branches.size;
  document.getElementById("provider-count").innerText = dataGlobal.length;
  document.getElementById("test-count").innerText = totalTests;
}

// ACTIVE
function setActive(container, el){
  container.querySelectorAll("div").forEach(x=>x.classList.remove("active"));
  el.classList.add("active");
}

// STEP 1
function renderBranches(){
  const el = document.getElementById("branch-grid");
  el.innerHTML = "";

  const set = new Set();

  dataGlobal.forEach(a=>{
    a.branches.forEach(b=>set.add(b.branch));
  });

  set.forEach(branch=>{
    const div = document.createElement("div");
    div.innerText = branch;

    div.onclick = ()=>{
      setActive(el, div);

      state.branch = branch;
      resetAll();

      renderAcademy();
    };

    el.appendChild(div);
  });
}

// STEP 2
function renderAcademy(){
  const el = document.getElementById("provider-chips");
  document.getElementById("provider-section").classList.remove("hidden");
  el.innerHTML = "";

  dataGlobal.forEach(a=>{
    if(a.branches.find(b=>b.branch===state.branch)){
      const div = document.createElement("div");
      div.className = "chip";
      div.innerText = a.academy;

      div.onclick = ()=>{
        setActive(el, div);

        state.academy = a.academy;
        state.tests = [];

        resetBelowAcademy();
        renderSeries();
      };

      el.appendChild(div);
    }
  });
}

// STEP 3
function renderSeries(){
  const el = document.getElementById("series-grid");
  document.getElementById("series-section").classList.remove("hidden");
  el.innerHTML = "";

  const academy = dataGlobal.find(a=>a.academy===state.academy);
  const branch = academy.branches.find(b=>b.branch===state.branch);

  const div = document.createElement("div");
  div.innerText = state.branch + " Series";

  div.onclick = ()=>{
    setActive(el, div);

    state.tests = branch.tests;
    renderTests();
  };

  el.appendChild(div);
}

// STEP 4
function renderTests(){
  document.getElementById("tests-section").classList.remove("hidden");

  state.filter = "all";
  document.querySelectorAll(".filter-chip").forEach(c=>c.classList.remove("active"));
  document.querySelector(".filter-chip").classList.add("active");

  applyFilter();
}

// FILTER
function setFilter(type, el){
  state.filter = type;

  document.querySelectorAll(".filter-chip").forEach(c=>c.classList.remove("active"));
  el.classList.add("active");

  applyFilter();
}

function applyFilter(){
  const el = document.getElementById("tests-list");
  el.innerHTML = "";

  let filtered = state.tests;

  if(state.filter !== "all"){
    filtered = filtered.filter(t =>
      t.toLowerCase().includes(state.filter)
    );
  }

  filtered.forEach(t=>{
    const div = document.createElement("div");
    div.innerText = t.replace(".html","");

    div.onclick = ()=>{
      window.open(`/tests/${state.academy}/${state.branch}/${t}`);
    };

    el.appendChild(div);
  });
}

// RESET
function resetAll(){
  state.academy = null;
  state.tests = [];

  document.getElementById("provider-section").classList.add("hidden");
  document.getElementById("series-section").classList.add("hidden");
  document.getElementById("tests-section").classList.add("hidden");

  document.getElementById("provider-chips").innerHTML = "";
  document.getElementById("series-grid").innerHTML = "";
  document.getElementById("tests-list").innerHTML = "";
}

function resetBelowAcademy(){
  document.getElementById("series-section").classList.add("hidden");
  document.getElementById("tests-section").classList.add("hidden");

  document.getElementById("series-grid").innerHTML = "";
  document.getElementById("tests-list").innerHTML = "";
}