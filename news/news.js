let mockArticles = {
  technology: [
    { title: "Vanilla JavaScript in 2026: Why Teams are Dropping Bundlers", description: "With browser support for Native Import Maps, ES Modules, and Anchor Positioning, build sizes are dropping.", source: { name: "JS Chronicles" }, publishedAt: "2026-06-12T09:00:00Z", url: "https://github.com" },
    { title: "Chrome 140 Launches with Native WebGPU Improvements", description: "Google's browser release introduces deep updates for local WebGPU rendering and direct WebAssembly thread compilation.", source: { name: "DevTech Weekly" }, publishedAt: "2026-06-11T14:30:00Z", url: "https://github.com" },
    { title: "CSS Anchor Positioning is Now Baseline Widely Available", description: "All major browsers now natively support CSS anchor attributes. Tooltips and popovers no longer require scripts.", source: { name: "Styles & Semantics" }, publishedAt: "2026-06-09T08:15:00Z", url: "https://github.com" }
  ],
  sports: [
    { title: "Formula 1 2026: Grid Changes & Hybrid Fuel Rules", description: "Team principals weigh in on the complex power-delivery regulations and aerodynamics changes.", source: { name: "Speed Fanatics" }, publishedAt: "2026-06-12T11:00:00Z", url: "https://github.com" },
    { title: "Championship League: Last-Minute Penalty Decides Finals", description: "An incredible turn of events in extra time leads to a spectacular overhead goal.", source: { name: "Sports Wire" }, publishedAt: "2026-06-11T20:45:00Z", url: "https://github.com" }
  ],
  business: [
    { title: "SaaS Enterprise Spend Reaches All-Time High in Q2", description: "Market research indicates a massive push in enterprise subscriptions driven by AI agent architectures.", source: { name: "Financial Tech Index" }, publishedAt: "2026-06-12T07:20:00Z", url: "https://github.com" },
    { title: "Tech Stock Rally Post Global Infrastructure Reports", description: "Markets responded favorably to hardware manufacturing forecasts, pushing indexes into record growth.", source: { name: "Wall Street Reports" }, publishedAt: "2026-06-11T16:00:00Z", url: "https://github.com" }
  ],
  health: [
    { title: "Clinical Trials for Synthetic Enzyme Delivery Show 90% Success", description: "New clinical data suggests targeted cellular enzymes offer quick recoveries for tissue degradation.", source: { name: "Biotech Science Journal" }, publishedAt: "2026-06-12T06:00:00Z", url: "https://github.com" },
    { title: "Consistent Sleep Regimen Vital for Executive Function", description: "New studies prove consistent wake times play a major role in neural cognitive focus.", source: { name: "Mind & Body Ledger" }, publishedAt: "2026-06-10T12:00:00Z", url: "https://github.com" }
  ],
  science: [
    { title: "Nuclear Fusion Reactor Sustains Plasma for 10 Minutes", description: "A major physics milestone has been crossed as researchers maintain burning plasma conditions.", source: { name: "Global Physics Review" }, publishedAt: "2026-06-12T10:15:00Z", url: "https://github.com" },
    { title: "Deep Space Telescope Captures Radio Burst in Carina Nebula", description: "Astronomers have documented a repetitive FRB event, opening doors to understanding magnetars.", source: { name: "Cosmic Horizon" }, publishedAt: "2026-06-10T19:30:00Z", url: "https://github.com" }
  ]
};

let activeCategory = "technology";
let searchQuery = "";

export function init(container) {
  let banner = container.querySelector("#news-demo-banner");
  if (banner) {
    banner.style.display = "flex";
  }
  setupPage(container);
  getNews(container);
}

function setupPage(container) {
  let searchBtn = container.querySelector("#news-search-btn");
  let searchInput = container.querySelector("#news-search-input");

  searchBtn.addEventListener("click", function() {
    searchQuery = searchInput.value.trim();
    getNews(container);
  });

  searchInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      searchQuery = searchInput.value.trim();
      getNews(container);
    }
  });

  let pills = container.querySelector("#news-category-pills");
  pills.addEventListener("click", function(e) {
    let pill = e.target.closest(".category-pill");
    if (pill === null) return;
    activeCategory = pill.dataset.category;
    let allPills = pills.querySelectorAll(".category-pill");
    for (let i = 0; i < allPills.length; i++) {
      allPills[i].classList.remove("active");
    }
    pill.classList.add("active");
    searchQuery = "";
    searchInput.value = "";
    getNews(container);
  });
}

function getNews(container) {
  let displayArea = container.querySelector("#news-display-area");
  if (displayArea === null) return;

  let articles = mockArticles[activeCategory];
  if (articles === undefined) articles = [];

  let filtered = [];
  if (searchQuery === "") {
    filtered = articles;
  } else {
    let queryLower = searchQuery.toLowerCase();
    for (let i = 0; i < articles.length; i++) {
      let titleMatch = articles[i].title.toLowerCase().indexOf(queryLower) !== -1;
      let descMatch = articles[i].description.toLowerCase().indexOf(queryLower) !== -1;
      if (titleMatch || descMatch) {
        filtered.push(articles[i]);
      }
    }
  }

  if (filtered.length === 0) {
    displayArea.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📰</div><h3>No articles found.</h3><p style="margin-top:8px;">Try different keywords or switch categories.</p></div>';
    return;
  }

  displayArea.innerHTML = "";
  let grid = document.createElement("div");
  grid.className = "news-grid";
  for (let i = 0; i < filtered.length; i++) {
    let card = showCard(filtered[i]);
    grid.appendChild(card);
  }
  displayArea.appendChild(grid);
}

function showCard(article) {
  let card = document.createElement("div");
  card.className = "news-card";

  let sourceName = "Web Report";
  if (article.source && article.source.name) {
    sourceName = article.source.name;
  }

  let dateString = "Recent";
  let dateObj = new Date(article.publishedAt);
  if (!isNaN(dateObj.getTime())) {
    dateString = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  let desc = article.description;
  if (!desc) desc = "No description available.";

  card.innerHTML = '<div class="news-card-content"><div class="news-card-meta"><span class="news-card-source">' + sourceName + '</span><span>' + dateString + '</span></div><h3 class="news-card-title">' + article.title + '</h3><p class="news-card-desc">' + desc + '</p><a class="news-card-link" href="' + article.url + '" target="_blank">Read More →</a></div>';
  return card;
}
