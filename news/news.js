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
  if (banner !== null) {
    banner.style.display = "flex";
  }
  setupPage(container);
  getNews(container);
}

function setupPage(container) {
  let btn = container.querySelector("#news-search-btn");
  let input = container.querySelector("#news-search-input");
  btn.addEventListener("click", function() {
    searchQuery = input.value.trim();
    getNews(container);
  });
  bindEnterKey(container, input);
  setupCategoryEvents(container, input);
}

function bindEnterKey(container, input) {
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      searchQuery = input.value.trim();
      getNews(container);
    }
  });
}

function setupCategoryEvents(container, input) {
  let pills = container.querySelector("#news-category-pills");
  if (pills === null) return;
  let list = pills.querySelectorAll(".category-pill");
  list.forEach(function(pill) {
    pill.addEventListener("click", function() {
      activeCategory = pill.getAttribute("data-category");
      updateActivePill(pills, pill);
      searchQuery = "";
      input.value = "";
      getNews(container);
    });
  });
}

function updateActivePill(pills, pill) {
  let list = pills.querySelectorAll(".category-pill");
  list.forEach(function(item) {
    item.classList.remove("active");
  });
  pill.classList.add("active");
}

function getNews(container) {
  let area = container.querySelector("#news-display-area");
  if (area === null) return;
  let list = mockArticles[activeCategory] ? mockArticles[activeCategory] : [];
  let filtered = filterArticles(list);
  if (filtered.length === 0) {
    area.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📰</div><h3>No articles found.</h3><p style="margin-top:8px;">Try different keywords or switch categories.</p></div>';
    return;
  }
  renderArticlesList(area, filtered);
}

function filterArticles(articles) {
  if (searchQuery === "") return articles;
  let filtered = [];
  let query = searchQuery.toLowerCase();
  articles.forEach(function(item) {
    let titleMatch = item.title.toLowerCase().indexOf(query) !== -1;
    let descMatch = item.description.toLowerCase().indexOf(query) !== -1;
    if (titleMatch || descMatch) {
      filtered.push(item);
    }
  });
  return filtered;
}

function renderArticlesList(area, filtered) {
  area.innerHTML = "";
  let grid = document.createElement("div");
  grid.className = "news-grid";
  filtered.forEach(function(item) {
    grid.appendChild(showCard(item));
  });
  area.appendChild(grid);
}

function showCard(article) {
  let card = document.createElement("div");
  card.className = "news-card";
  let source = getSourceName(article);
  let date = formatDate(article.publishedAt);
  let desc = article.description ? article.description : "No description available.";
  card.innerHTML = '<div class="news-card-content"><div class="news-card-meta"><span class="news-card-source">' + source + '</span><span>' + date + '</span></div><h3 class="news-card-title">' + article.title + '</h3><p class="news-card-desc">' + desc + '</p><a class="news-card-link" href="' + article.url + '" target="_blank">Read More →</a></div>';
  return card;
}

function getSourceName(article) {
  if (article.source && article.source.name) {
    return article.source.name;
  }
  return "Web Report";
}

function formatDate(publishedAt) {
  if (!publishedAt) return "Recent";
  let date = new Date(publishedAt);
  let year = date.getFullYear();
  if (year <= 0) return "Recent";
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let month = months[date.getMonth()];
  let day = date.getDate();
  return month + " " + day + ", " + year;
}
