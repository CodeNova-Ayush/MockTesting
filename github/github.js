let mockProfiles = {
  octocat: {
    profile: {
      avatar_url: "https://avatars.githubusercontent.com/u/5832347?v=4",
      name: "The Octocat", login: "octocat",
      bio: "Testing branch merges and repository integrations since 2011.",
      followers: 9400, following: 9, public_repos: 8,
      location: "San Francisco, CA", html_url: "https://github.com/octocat"
    },
    repos: [
      { name: "boysenberry-repo-1", description: "Testing clone procedures and GitHub workflows.", stargazers_count: 120, forks_count: 32, language: "JavaScript", html_url: "https://github.com/octocat" },
      { name: "git-consortium", description: "This is a public consortium repo for training demonstrations.", stargazers_count: 85, forks_count: 14, language: "HTML", html_url: "https://github.com/octocat" },
      { name: "hello-worId", description: "My first repository on GitHub hosting.", stargazers_count: 450, forks_count: 198, language: "CSS", html_url: "https://github.com/octocat" },
      { name: "octo-spy", description: "Track octocat actions and events globally.", stargazers_count: 15, forks_count: 4, language: "JavaScript", html_url: "https://github.com/octocat" },
      { name: "test-repo-foo", description: "Draft experiments for index positioning.", stargazers_count: 4, forks_count: 1, language: "TypeScript", html_url: "https://github.com/octocat" }
    ]
  },
  google: {
    profile: {
      avatar_url: "https://avatars.githubusercontent.com/u/1342004?v=4",
      name: "Google", login: "google",
      bio: "Google Open Source. Real-world solutions, powered by community collaboration.",
      followers: 34500, following: 0, public_repos: 2500,
      location: "Mountain View, CA", html_url: "https://github.com/google"
    },
    repos: [
      { name: "material-design-lite", description: "Material Design components in HTML, CSS, and JS.", stargazers_count: 32000, forks_count: 5400, language: "HTML", html_url: "https://github.com/google" },
      { name: "gson", description: "A Java library that can be used to convert Java Objects into JSON.", stargazers_count: 23500, forks_count: 4200, language: "Java", html_url: "https://github.com/google" },
      { name: "zx", description: "A tool for writing better scripts in JavaScript/TypeScript.", stargazers_count: 39000, forks_count: 1100, language: "JavaScript", html_url: "https://github.com/google" },
      { name: "guava", description: "Google core libraries for Java projects.", stargazers_count: 48000, forks_count: 10500, language: "Java", html_url: "https://github.com/google" },
      { name: "diff-match-patch", description: "High-performance diffing library for text editing.", stargazers_count: 9400, forks_count: 1300, language: "C++", html_url: "https://github.com/google" }
    ]
  }
};

let langColors = {
  javascript: "gold", typescript: "steelblue", html: "coral",
  css: "purple", java: "crimson", python: "steelblue",
  ruby: "crimson", cpp: "crimson", c: "gray", go: "steelblue"
};

let activeUser = "octocat";
let repoSortKey = "stars";
let userProfileData = null;
let userReposData = null;

export function init(container) {
  let searchBtn = container.querySelector("#git-search-btn");
  let searchInput = container.querySelector("#git-search-input");

  searchBtn.addEventListener("click", function() {
    let val = searchInput.value.trim();
    if (val !== "") {
      activeUser = val;
      searchUser(container, val);
    }
  });

  searchInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      let val = searchInput.value.trim();
      if (val !== "") {
        activeUser = val;
        searchUser(container, val);
      }
    }
  });

  searchUser(container, activeUser);
}

async function searchUser(container, username) {
  let workspace = container.querySelector("#git-workspace-area");
  let banner = container.querySelector("#git-status-banner");
  if (banner) banner.innerHTML = "";

  if (workspace) {
    workspace.innerHTML = '<div class="spinner-wrapper"><div class="spinner"></div><p>Connecting to GitHub API for <strong>@' + username + '</strong>...</p></div>';
  }

  try {
    let profileRes = await fetch("https://api.github.com/users/" + username);
    let reposRes = await fetch("https://api.github.com/users/" + username + "/repos?per_page=100");

    if (profileRes.status === 403 || profileRes.status === 404) {
      throw new Error("error");
    }
    if (!profileRes.ok || !reposRes.ok) {
      throw new Error("error");
    }

    userProfileData = await profileRes.json();
    userReposData = await reposRes.json();
    showProfile(container);
  } catch (err) {
    if (banner) {
      banner.innerHTML = '<div class="news-banner" style="border-color:crimson;color:crimson;margin-bottom:20px;"><span>⚠️</span><span>Failed to load profile for @' + username + '. Loading fallback mock data.</span></div>';
    }
    let lower = username.toLowerCase();
    let backup = mockProfiles[lower];
    if (!backup) backup = mockProfiles["octocat"];
    userProfileData = backup.profile;
    userReposData = backup.repos;
    showProfile(container);
  }
}

function formatNumber(num) {
  if (num >= 1000) {
    let result = (num / 1000).toFixed(1);
    return result + "k";
  }
  return num.toString();
}

function showProfile(container) {
  let workspace = container.querySelector("#git-workspace-area");
  if (workspace === null) return;

  let followersStr = formatNumber(userProfileData.followers);
  let followingStr = formatNumber(userProfileData.following);
  let reposStr = formatNumber(userProfileData.public_repos);

  let nameText = userProfileData.name;
  if (!nameText) nameText = userProfileData.login;
  let bioText = userProfileData.bio;
  if (!bioText) bioText = "This developer has not provided a biography yet.";

  workspace.innerHTML = "";
  workspace.className = "github-workspace";

  let profileCol = document.createElement("div");
  profileCol.className = "github-profile-col";

  profileCol.innerHTML = '<div class="github-profile-card"><img class="github-avatar" src="' + userProfileData.avatar_url + '"><div><h3 class="github-profile-name">' + nameText + '</h3><span class="github-profile-login">@' + userProfileData.login + '</span></div><p class="github-profile-bio">' + bioText + '</p><div class="github-stats-row"><div class="github-stat-col"><span class="github-stat-val">' + followersStr + '</span><span class="github-stat-lbl">Followers</span></div><div class="github-stat-col"><span class="github-stat-val">' + followingStr + '</span><span class="github-stat-lbl">Following</span></div><div class="github-stat-col"><span class="github-stat-val">' + reposStr + '</span><span class="github-stat-lbl">Repos</span></div></div><div class="github-details-list"><div id="git-profile-location" class="github-detail-item" style="display: none;"><span>📍</span><span id="git-location-text"></span></div><div class="github-detail-item"><span>🔗</span><a href="' + userProfileData.html_url + '" target="_blank" style="font-weight: bold; color: purple;">Visit GitHub Profile</a></div></div></div>';

  let chartCard = document.createElement("div");
  chartCard.className = "github-chart-card";
  chartCard.innerHTML = '<h4 class="chart-title">Language breakdown</h4><div class="chart-bar-list" id="git-chart-bars"></div>';
  profileCol.appendChild(chartCard);

  let reposCard = document.createElement("div");
  reposCard.className = "github-repos-card";
  reposCard.innerHTML = '<div class="repos-header"><h3>Repositories</h3><div class="repos-sort-controls" id="repo-sorters"><button class="filter-tab active" id="btn-sort-stars" data-sort="stars">Sort by Stars</button><button class="filter-tab" id="btn-sort-forks" data-sort="forks">Sort by Forks</button></div></div><div class="repos-list" id="git-repos-items"></div>';

  workspace.appendChild(profileCol);
  workspace.appendChild(reposCard);

  let loc = userProfileData.location;
  if (loc !== null && loc !== undefined && loc !== "") {
    let locEl = container.querySelector("#git-profile-location");
    let locText = container.querySelector("#git-location-text");
    if (locEl !== null && locText !== null) {
      locEl.style.display = "flex";
      locText.innerText = loc;
    }
  }

  showLanguageChart(container);
  showRepos(container);

  let starBtn = container.querySelector("#btn-sort-stars");
  let forkBtn = container.querySelector("#btn-sort-forks");
  if (starBtn && forkBtn) {
    starBtn.addEventListener("click", function() {
      repoSortKey = "stars";
      starBtn.classList.add("active");
      forkBtn.classList.remove("active");
      showRepos(container);
    });
    forkBtn.addEventListener("click", function() {
      repoSortKey = "forks";
      forkBtn.classList.add("active");
      starBtn.classList.remove("active");
      showRepos(container);
    });
  }
}

function showLanguageChart(container) {
  let chartContainer = container.querySelector("#git-chart-bars");
  if (chartContainer === null) return;

  let repos = userReposData;
  if (!repos) repos = [];

  let counts = {};
  let total = 0;
  for (let i = 0; i < repos.length; i++) {
    let lang = repos[i].language;
    if (lang) {
      if (counts[lang] === undefined) {
        counts[lang] = 0;
      }
      counts[lang] = counts[lang] + 1;
      total = total + 1;
    }
  }

  if (total === 0) {
    chartContainer.innerHTML = '<p style="font-size:0.85rem;color:gray;text-align:center;padding:12px 0;">No language statistics available.</p>';
    return;
  }

  let list = [];
  for (let lang in counts) {
    let percent = Math.round((counts[lang] / total) * 100);
    list.push({ name: lang, count: counts[lang], percentage: percent });
  }
  list.sort(function(a, b) { return b.count - a.count; });

  let topFive = [];
  for (let i = 0; i < list.length && i < 5; i++) {
    topFive.push(list[i]);
  }

  chartContainer.innerHTML = "";
  for (let i = 0; i < topFive.length; i++) {
    let lang = topFive[i];
    let lower = lang.name.toLowerCase();
    let color = langColors[lower];
    if (!color) color = "gray";

    let bar = document.createElement("div");
    bar.className = "chart-bar-item";
    bar.innerHTML = '<div class="chart-bar-meta"><span style="display:flex;align-items:center;gap:6px;"><span class="lang-dot ' + lower + '"></span>' + lang.name + '</span><span>' + lang.percentage + '%</span></div><div class="chart-bar-track"><div class="chart-bar-fill" style="width:' + lang.percentage + '%;background-color:' + color + ';"></div></div>';
    chartContainer.appendChild(bar);
  }
}

function showRepos(container) {
  let listContainer = container.querySelector("#git-repos-items");
  if (listContainer === null) return;

  let sortedRepos = sortRepos(userReposData);

  if (sortedRepos.length === 0) {
    listContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🐙</div><p>No repositories.</p></div>';
    return;
  }

  listContainer.innerHTML = "";
  for (let i = 0; i < sortedRepos.length; i++) {
    let repo = sortedRepos[i];
    let item = document.createElement("div");
    item.className = "repo-item";

    let langSpan = "";
    if (repo.language) {
      langSpan = '<div class="repo-footer-item"><span class="lang-dot ' + repo.language.toLowerCase() + '"></span><span>' + repo.language + '</span></div>';
    }

    let desc = repo.description;
    if (!desc) desc = "No description provided.";

    item.innerHTML = '<div class="repo-item-top"><a class="repo-name" href="' + repo.html_url + '" target="_blank">' + repo.name + '</a></div><p class="repo-desc">' + desc + '</p><div class="repo-footer">' + langSpan + '<div class="repo-footer-item"><span>⭐</span><span>' + repo.stargazers_count + '</span></div><div class="repo-footer-item"><span>🍴</span><span>' + repo.forks_count + '</span></div></div>';

    listContainer.appendChild(item);
  }
}

function sortRepos(repos) {
  if (!repos) return [];
  let copy = [];
  for (let i = 0; i < repos.length; i++) {
    copy.push(repos[i]);
  }
  copy.sort(function(a, b) {
    let valA = 0;
    let valB = 0;
    if (repoSortKey === "stars") {
      valA = a.stargazers_count;
      valB = b.stargazers_count;
    } else {
      valA = a.forks_count;
      valB = b.forks_count;
    }
    if (!valA) valA = 0;
    if (!valB) valB = 0;
    return valB - valA;
  });

  let result = [];
  for (let i = 0; i < copy.length && i < 10; i++) {
    result.push(copy[i]);
  }
  return result;
}
