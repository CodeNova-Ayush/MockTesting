let mockProfiles = {
  octocat: {
    profile: {
      avatar_url: "https://avatars.githubusercontent.com/u/5832347?v=4",
      name: "The Octocat",
      login: "octocat",
      bio: "Testing merges since 2011.",
      followers: 9400,
      following: 9,
      public_repos: 8,
      location: "San Francisco, CA",
      html_url: "https://github.com/octocat"
    },
    repos: [
      { name: "boysenberry-repo-1", description: "Testing workflows.", stargazers_count: 120, forks_count: 32, language: "JavaScript", html_url: "https://github.com/octocat" },
      { name: "git-consortium", description: "Training demo repo.", stargazers_count: 85, forks_count: 14, language: "HTML", html_url: "https://github.com/octocat" }
    ]
  },
  google: {
    profile: {
      avatar_url: "https://avatars.githubusercontent.com/u/1342004?v=4",
      name: "Google",
      login: "google",
      bio: "Google Open Source.",
      followers: 34500,
      following: 0,
      public_repos: 2500,
      location: "Mountain View, CA",
      html_url: "https://github.com/google"
    },
    repos: [
      { name: "gson", description: "Java library.", stargazers_count: 23500, forks_count: 4200, language: "Java", html_url: "https://github.com/google" },
      { name: "zx", description: "Scripting tool.", stargazers_count: 39000, forks_count: 1100, language: "JavaScript", html_url: "https://github.com/google" }
    ]
  }
};

let langColors = {
  javascript: "gold",
  typescript: "steelblue",
  html: "coral",
  css: "purple",
  java: "crimson",
  python: "steelblue",
  ruby: "crimson",
  cpp: "crimson",
  c: "gray",
  go: "steelblue"
};

let activeUser = "octocat";
let sortKey = "stars";
let userData = null;
let repoData = null;

export function init(container) {
  let btn = container.querySelector("#git-search-btn");
  let input = container.querySelector("#git-search-input");
  let action = function() {
    let val = input.value.trim();
    if (val !== "") {
      activeUser = val;
      searchUser(container, val);
    }
  };
  btn.addEventListener("click", action);
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") action();
  });
  searchUser(container, activeUser);
}

async function searchUser(container, username) {
  clearStatus(container);
  showSpinner(container, username);
  try {
    let pRes = await fetch("https://api.github.com/users/" + username);
    let rRes = await fetch("https://api.github.com/users/" + username + "/repos?per_page=100");
    if (!pRes.ok || !rRes.ok) throw new Error();
    userData = await pRes.json();
    repoData = await rRes.json();
    showProfile(container);
  } catch (err) {
    loadFallback(container, username);
  }
}

function clearStatus(container) {
  let banner = container.querySelector("#git-status-banner");
  if (banner !== null) banner.innerHTML = "";
}

function showSpinner(container, username) {
  let area = container.querySelector("#git-workspace-area");
  if (area !== null) {
    area.innerHTML = '<div class="spinner-wrapper"><div class="spinner"></div><p>Connecting for <strong>@' + username + '</strong>...</p></div>';
  }
}

function loadFallback(container, username) {
  let banner = container.querySelector("#git-status-banner");
  if (banner !== null) {
    banner.innerHTML = '<div class="news-banner" style="border-color:crimson;color:crimson;margin-bottom:20px;"><span>⚠️</span><span>Failed to load profile. Using mock data.</span></div>';
  }
  let backup = mockProfiles[username.toLowerCase()];
  if (!backup) backup = mockProfiles["octocat"];
  userData = backup.profile;
  repoData = backup.repos;
  showProfile(container);
}

function formatNumber(num) {
  if (num >= 1000) {
    let res = (num / 1000).toFixed(1);
    return res + "k";
  }
  return num.toString();
}

function showProfile(container) {
  let area = container.querySelector("#git-workspace-area");
  if (area === null) return;
  area.className = "github-workspace";
  setProfileHtml(area);
  setupLocation(container);
  showChart(container);
  showRepos(container);
  setupSort(container);
}

function setProfileHtml(area) {
  let fol = formatNumber(userData.followers);
  let flg = formatNumber(userData.following);
  let rep = formatNumber(userData.public_repos);
  let name = userData.name ? userData.name : userData.login;
  let bio = userData.bio ? userData.bio : "No bio.";
  area.innerHTML = '<div class="github-profile-col"><div class="github-profile-card"><img class="github-avatar" src="' + userData.avatar_url + '"><div><h3 class="github-profile-name">' + name + '</h3><span class="github-profile-login">@' + userData.login + '</span></div><p class="github-profile-bio">' + bio + '</p><div class="github-stats-row"><div class="github-stat-col"><span class="github-stat-val">' + fol + '</span><span class="github-stat-lbl">Followers</span></div><div class="github-stat-col"><span class="github-stat-val">' + flg + '</span><span class="github-stat-lbl">Following</span></div><div class="github-stat-col"><span class="github-stat-val">' + rep + '</span><span class="github-stat-lbl">Repos</span></div></div><div class="github-details-list"><div id="git-profile-location" class="github-detail-item" style="display: none;"><span>📍</span><span id="git-location-text"></span></div><div class="github-detail-item"><span>🔗</span><a href="' + userData.html_url + '" target="_blank" style="font-weight: bold; color: purple;">Visit Profile</a></div></div></div><div class="github-chart-card"><h4 class="chart-title">Languages</h4><div class="chart-bar-list" id="git-chart-bars"></div></div></div><div class="github-repos-card"><div class="repos-header"><h3>Repositories</h3><div class="repos-sort-controls" id="repo-sorters"><button class="filter-tab active" id="btn-sort-stars" data-sort="stars">Sort by Stars</button><button class="filter-tab" id="btn-sort-forks" data-sort="forks">Sort by Forks</button></div></div><div class="repos-list" id="git-repos-items"></div></div>';
}

function setupLocation(container) {
  let loc = userData.location;
  if (loc !== null && loc !== undefined && loc !== "") {
    let el = container.querySelector("#git-profile-location");
    let text = container.querySelector("#git-location-text");
    if (el !== null && text !== null) {
      el.style.display = "flex";
      text.innerText = loc;
    }
  }
}

function setupSort(container) {
  let starBtn = container.querySelector("#btn-sort-stars");
  let forkBtn = container.querySelector("#btn-sort-forks");
  if (starBtn !== null && forkBtn !== null) {
    bindSort(container, starBtn, forkBtn, "stars");
    bindSort(container, forkBtn, starBtn, "forks");
  }
}

function bindSort(container, btn, otherBtn, key) {
  btn.addEventListener("click", function() {
    sortKey = key;
    btn.classList.add("active");
    otherBtn.classList.remove("active");
    showRepos(container);
  });
}

function showChart(container) {
  let chart = container.querySelector("#git-chart-bars");
  if (chart === null) return;
  let counts = getCounts(repoData ? repoData : []);
  let total = getTotal(counts);
  if (total === 0) {
    chart.innerHTML = '<p style="font-size:0.85rem;color:gray;text-align:center;padding:12px 0;">No language statistics available.</p>';
    return;
  }
  renderBars(chart, counts, total);
}

function getCounts(repos) {
  let counts = {};
  repos.forEach(function(repo) {
    if (repo.language) {
      let lang = repo.language;
      if (counts[lang] === undefined) counts[lang] = 0;
      counts[lang] = counts[lang] + 1;
    }
  });
  return counts;
}

function getTotal(counts) {
  let total = 0;
  for (let lang in counts) {
    total = total + counts[lang];
  }
  return total;
}

function renderBars(chart, counts, total) {
  let list = [];
  for (let lang in counts) {
    let pct = Math.round((counts[lang] / total) * 100);
    list.push({ name: lang, count: counts[lang], percentage: pct });
  }
  list.sort(function(a, b) { return b.count - a.count; });
  chart.innerHTML = "";
  for (let i = 0; i < list.length && i < 5; i++) {
    chart.appendChild(createBar(list[i]));
  }
}

function createBar(lang) {
  let lower = lang.name.toLowerCase();
  let color = langColors[lower] ? langColors[lower] : "gray";
  let bar = document.createElement("div");
  bar.className = "chart-bar-item";
  bar.innerHTML = '<div class="chart-bar-meta"><span style="display:flex;align-items:center;gap:6px;"><span class="lang-dot ' + lower + '"></span>' + lang.name + '</span><span>' + lang.percentage + '%</span></div><div class="chart-bar-track"><div class="chart-bar-fill" style="width:' + lang.percentage + '%;background-color:' + color + ';"></div></div>';
  return bar;
}

function showRepos(container) {
  let list = container.querySelector("#git-repos-items");
  if (list === null) return;
  let sorted = sortRepos(repoData);
  if (sorted.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🐙</div><p>No repositories.</p></div>';
    return;
  }
  list.innerHTML = "";
  sorted.forEach(function(repo) {
    list.appendChild(createRepoItem(repo));
  });
}

function createRepoItem(repo) {
  let item = document.createElement("div");
  item.className = "repo-item";
  let lang = "";
  if (repo.language) {
    lang = '<div class="repo-footer-item"><span class="lang-dot ' + repo.language.toLowerCase() + '"></span><span>' + repo.language + '</span></div>';
  }
  let desc = repo.description ? repo.description : "No description provided.";
  item.innerHTML = '<div class="repo-item-top"><a class="repo-name" href="' + repo.html_url + '" target="_blank">' + repo.name + '</a></div><p class="repo-desc">' + desc + '</p><div class="repo-footer">' + lang + '<div class="repo-footer-item"><span>⭐</span><span>' + repo.stargazers_count + '</span></div><div class="repo-footer-item"><span>🍴</span><span>' + repo.forks_count + '</span></div></div>';
  return item;
}

function sortRepos(repos) {
  if (!repos) return [];
  let copy = [];
  repos.forEach(function(item) { copy.push(item); });
  copy.sort(compareRepos);
  let res = [];
  for (let i = 0; i < copy.length && i < 10; i++) {
    res.push(copy[i]);
  }
  return res;
}

function compareRepos(a, b) {
  let valA = sortKey === "stars" ? a.stargazers_count : a.forks_count;
  let valB = sortKey === "stars" ? b.stargazers_count : b.forks_count;
  if (!valA) valA = 0;
  if (!valB) valB = 0;
  return valB - valA;
}
