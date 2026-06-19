var teamMembers = [
  { name: "Gauravi Roy", role: "UI/UX Designer & Frontend Developer", skills: ["HTML", "CSS", "Responsive Design", "DOM Manipulation"], github: "https://github.com/gauravir39", linkedin: "https://www.linkedin.com/in/gauravi-roy-680104381/" },
  { name: "Ayush Mishra", role: "Lead Developer & Architect", skills: ["JavaScript", "SPA Routing", "LocalStorage", "Git Workflow"], github: "https://github.com/CodeNova-Ayush", linkedin: "https://www.linkedin.com/in/ayush-mishra-5b8874381/" },
  { name: "Saransh Yadav", role: "API Integration Developer", skills: ["Async/Await", "Fetch API", "JSON Parsing", "Error Handling"], github: "https://github.com/Inexpert-trifler", linkedin: "https://www.linkedin.com/in/saransh-yadav-b72643336/" },
  { name: "Vijay Kumar", role: "State & Storage Developer", skills: ["CRUD Operations", "localStorage", "Array Methods", "Data Binding"], github: "https://github.com/vijaycoder01", linkedin: "https://www.linkedin.com/in/vijay-769105381/" },
  { name: "Shoaib Khan", role: "Testing & Deployment Lead", skills: ["Cross-browser Testing", "Bug Fixing", "Deployment", "Version Control"], github: "https://github.com/shoaibgmkhan", linkedin: "https://www.linkedin.com/in/shoaib-khan-80a105381/" }
];

var avatarColors = ["purple", "blue", "green", "orange", "red"];

export function init(container) {
  var grid = container.querySelector("#portfolio-grid");
  showCards(grid);
  setupForm(container);
}

function showCards(grid) {
  grid.innerHTML = "";
  for (var i = 0; i < teamMembers.length; i++) {
    var member = teamMembers[i];
    var card = createCard(member, i);
    grid.appendChild(card);
  }
}

function createCard(member, index) {
  var card = document.createElement("div");
  card.className = "portfolio-card";
  appendCardHeader(card, member, index);
  var skillsDiv = createSkills(member.skills);
  card.appendChild(skillsDiv);
  var linksDiv = createLinks(member.github, member.linkedin);
  card.appendChild(linksDiv);
  return card;
}

function appendCardHeader(card, member, index) {
  var avatar = createAvatar(member.name, index);
  card.appendChild(avatar);
  var nameEl = createName(member.name);
  card.appendChild(nameEl);
  var roleEl = createRole(member.role);
  card.appendChild(roleEl);
}

function createAvatar(name, index) {
  var avatar = document.createElement("div");
  avatar.className = "portfolio-avatar-placeholder " + avatarColors[index];
  var parts = name.split(" ");
  avatar.innerText = parts[0][0] + parts[1][0];
  return avatar;
}

function createName(name) {
  var nameEl = document.createElement("h3");
  nameEl.className = "portfolio-name";
  nameEl.innerText = name;
  return nameEl;
}

function createRole(role) {
  var roleEl = document.createElement("p");
  roleEl.className = "portfolio-role";
  roleEl.innerText = role;
  return roleEl;
}

function createSkills(skills) {
  var skillsDiv = document.createElement("div");
  skillsDiv.className = "portfolio-skills";
  for (var j = 0; j < skills.length; j++) {
    var tag = document.createElement("span");
    tag.className = "skill-tag";
    tag.innerText = skills[j];
    skillsDiv.appendChild(tag);
  }
  return skillsDiv;
}

function createLinks(github, linkedin) {
  var linksDiv = document.createElement("div");
  linksDiv.className = "portfolio-links";
  if (github !== "") {
    var ghLink = createLink(github, "portfolio-github-link", "GitHub Profile");
    linksDiv.appendChild(ghLink);
  }
  if (linkedin !== "") {
    var liLink = createLink(linkedin, "portfolio-linkedin-link", "LinkedIn Profile");
    linksDiv.appendChild(liLink);
  }
  return linksDiv;
}

function createLink(url, className, text) {
  var link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.className = className;
  link.innerText = text;
  return link;
}

function setupForm(container) {
  var form = container.querySelector("#contact-form");
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    validateForm(container, form);
  });
}

function validateForm(container, form) {
  clearErrors(container);
  var nameOk = checkNameInput(container);
  var emailOk = checkEmailInput(container);
  var bodyOk = checkBodyInput(container);
  if (nameOk && emailOk && bodyOk) {
    showSuccessMessage(container, form);
  }
}

function clearErrors(container) {
  var nameInput = container.querySelector("#contact-name");
  var emailInput = container.querySelector("#contact-email");
  var bodyInput = container.querySelector("#contact-body");
  nameInput.classList.remove("input-invalid");
  emailInput.classList.remove("input-invalid");
  bodyInput.classList.remove("input-invalid");
  container.querySelector("#error-name").style.display = "none";
  container.querySelector("#error-email").style.display = "none";
  container.querySelector("#error-body").style.display = "none";
  container.querySelector("#form-message-container").innerHTML = "";
}

function checkNameInput(container) {
  var nameInput = container.querySelector("#contact-name");
  if (nameInput.value.trim() === "") {
    nameInput.classList.add("input-invalid");
    container.querySelector("#error-name").style.display = "block";
    return false;
  }
  return true;
}

function checkEmailInput(container) {
  var emailInput = container.querySelector("#contact-email");
  var emailVal = emailInput.value.trim();
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailVal === "" || emailRegex.test(emailVal) === false) {
    emailInput.classList.add("input-invalid");
    container.querySelector("#error-email").style.display = "block";
    return false;
  }
  return true;
}

function checkBodyInput(container) {
  var bodyInput = container.querySelector("#contact-body");
  if (bodyInput.value.trim().length < 10) {
    bodyInput.classList.add("input-invalid");
    container.querySelector("#error-body").style.display = "block";
    return false;
  }
  return true;
}

function showSuccessMessage(container, form) {
  var alertDiv = document.createElement("div");
  alertDiv.className = "form-success-alert";
  alertDiv.innerText = "Message sent successfully!";
  container.querySelector("#form-message-container").appendChild(alertDiv);
  form.reset();
}
