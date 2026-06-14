let entries = [];
let activeFilter = "all";
let editingId = null;

export function init(container) {
  loadFromStorage();
  calculateTotals(container);
  showEntries(container);
  setupForm(container);
  setupFilters(container);
  setupDefaultDate(container);
}

function saveToStorage() {
  let json = JSON.stringify(entries);
  localStorage.setItem("stackone_expenses", json);
}

function loadFromStorage() {
  let saved = localStorage.getItem("stackone_expenses");
  if (saved !== null) {
    entries = JSON.parse(saved);
    window.AppState.expense.entries = entries;
  } else {
    entries = [
      { id: 1, description: "Client Project Payment", amount: 3200, type: "income", date: "2026-06-01" },
      { id: 2, description: "Office Rent", amount: 1200, type: "expense", date: "2026-06-03" },
      { id: 3, description: "SaaS Cloud Subscriptions", amount: 150, type: "expense", date: "2026-06-05" }
    ];
    window.AppState.expense.entries = entries;
    saveToStorage();
  }
}

function calculateTotals(container) {
  let totalIncome = 0;
  let totalExpense = 0;
  for (let i = 0; i < entries.length; i++) {
    let entry = entries[i];
    let amountValue = parseFloat(entry.amount);
    if (entry.type === "income") {
      totalIncome = totalIncome + amountValue;
    } else {
      totalExpense = totalExpense + amountValue;
    }
  }
  let balance = totalIncome - totalExpense;

  let balEl = container.querySelector("#exp-total-balance");
  let incEl = container.querySelector("#exp-total-income");
  let expEl = container.querySelector("#exp-total-expense");

  if (balEl) {
    balEl.innerText = "$" + balance.toFixed(2);
    if (balance > 0) {
      balEl.className = "summary-val positive";
    } else if (balance < 0) {
      balEl.className = "summary-val negative";
    } else {
      balEl.className = "summary-val neutral";
    }
  }
  if (incEl) {
    incEl.innerText = "$" + totalIncome.toFixed(2);
  }
  if (expEl) {
    expEl.innerText = "$" + totalExpense.toFixed(2);
  }
}

function showEntries(container) {
  let listContainer = container.querySelector("#ledger-items");
  if (listContainer === null) return;

  let filtered = [];
  for (let i = 0; i < entries.length; i++) {
    if (activeFilter === "all" || entries[i].type === activeFilter) {
      filtered.push(entries[i]);
    }
  }

  if (filtered.length === 0) {
    listContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💰</div><p>No transactions found in this view.</p></div>';
    return;
  }

  listContainer.innerHTML = "";
  for (let i = 0; i < filtered.length; i++) {
    let entry = filtered[i];
    let item = document.createElement("div");
    item.className = "ledger-item";

    let left = document.createElement("div");
    left.className = "ledger-item-left";

    let icon = document.createElement("div");
    icon.className = "ledger-item-icon " + entry.type;
    if (entry.type === "income") {
      icon.innerText = "📈";
    } else {
      icon.innerText = "📉";
    }

    let info = document.createElement("div");
    info.className = "ledger-item-info";
    info.innerHTML = '<span class="ledger-item-desc">' + entry.description + '</span><span class="ledger-item-date">' + entry.date + '</span>';

    left.appendChild(icon);
    left.appendChild(info);

    let right = document.createElement("div");
    right.className = "ledger-item-right";

    let amount = document.createElement("span");
    amount.className = "ledger-item-amount " + entry.type;
    let sign = "+";
    if (entry.type === "expense") {
      sign = "-";
    }
    amount.innerText = sign + "$" + parseFloat(entry.amount).toFixed(2);

    let actions = document.createElement("div");
    actions.className = "ledger-item-actions";

    let editBtn = document.createElement("button");
    editBtn.className = "btn-icon edit";
    editBtn.dataset.id = entry.id;
    editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';

    let deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-icon delete";
    deleteBtn.dataset.id = entry.id;
    deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    right.appendChild(amount);
    right.appendChild(actions);
    item.appendChild(left);
    item.appendChild(right);
    listContainer.appendChild(item);
  }
}

function setupForm(container) {
  let form = container.querySelector("#expense-form");
  let cancelBtn = container.querySelector("#exp-cancel-btn");

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    handleSubmit(container, form);
  });

  cancelBtn.addEventListener("click", function() {
    resetForm(container, form);
  });

  let listContainer = container.querySelector("#ledger-items");
  listContainer.addEventListener("click", function(e) {
    let editTarget = e.target.closest(".btn-icon.edit");
    let deleteTarget = e.target.closest(".btn-icon.delete");

    if (editTarget) {
      let id = parseInt(editTarget.dataset.id, 10);
      editEntry(container, id);
    }
    if (deleteTarget) {
      let id = parseInt(deleteTarget.dataset.id, 10);
      deleteEntry(container, id, form);
    }
  });
}

function handleSubmit(container, form) {
  let desc = container.querySelector("#exp-desc");
  let amt = container.querySelector("#exp-amount");
  let type = container.querySelector("#exp-type");
  let date = container.querySelector("#exp-date");

  desc.classList.remove("input-invalid");
  amt.classList.remove("input-invalid");
  date.classList.remove("input-invalid");
  container.querySelector("#exp-error-desc").style.display = "none";
  container.querySelector("#exp-error-amount").style.display = "none";
  container.querySelector("#exp-error-date").style.display = "none";

  let descOk = true;
  let amtOk = true;
  let dateOk = true;

  if (desc.value.trim() === "") {
    desc.classList.add("input-invalid");
    container.querySelector("#exp-error-desc").style.display = "block";
    descOk = false;
  }

  let amtVal = parseFloat(amt.value);
  if (isNaN(amtVal) || amtVal <= 0) {
    amt.classList.add("input-invalid");
    container.querySelector("#exp-error-amount").style.display = "block";
    amtOk = false;
  }

  if (date.value === "") {
    date.classList.add("input-invalid");
    container.querySelector("#exp-error-date").style.display = "block";
    dateOk = false;
  }

  if (descOk === false || amtOk === false || dateOk === false) {
    return;
  }

  if (editingId !== null) {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].id === editingId) {
        entries[i].description = desc.value.trim();
        entries[i].amount = parseFloat(amt.value);
        entries[i].type = type.value;
        entries[i].date = date.value;
      }
    }
  } else {
    let newEntry = {
      id: Date.now(),
      description: desc.value.trim(),
      amount: parseFloat(amt.value),
      type: type.value,
      date: date.value
    };
    entries.push(newEntry);
  }

  window.AppState.expense.entries = entries;
  saveToStorage();
  calculateTotals(container);
  showEntries(container);
  resetForm(container, form);
}

function editEntry(container, id) {
  editingId = id;
  let entry = null;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].id === id) {
      entry = entries[i];
    }
  }
  if (entry !== null) {
    container.querySelector("#exp-desc").value = entry.description;
    container.querySelector("#exp-amount").value = entry.amount;
    container.querySelector("#exp-type").value = entry.type;
    container.querySelector("#exp-date").value = entry.date;
    container.querySelector("#exp-submit-btn").innerText = "Save Changes";
    container.querySelector("#exp-cancel-btn").style.display = "block";
    container.querySelector("#form-heading").innerText = "Edit Transaction";
  }
}

function deleteEntry(container, id, form) {
  let updated = [];
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].id !== id) {
      updated.push(entries[i]);
    }
  }
  entries = updated;
  window.AppState.expense.entries = entries;

  if (editingId === id) {
    resetForm(container, form);
  }
  saveToStorage();
  calculateTotals(container);
  showEntries(container);
}

function resetForm(container, form) {
  form.reset();
  editingId = null;
  container.querySelector("#exp-submit-btn").innerText = "Add Entry";
  container.querySelector("#exp-cancel-btn").style.display = "none";
  container.querySelector("#form-heading").innerText = "Add Transaction";
  setupDefaultDate(container);
}

function setupDefaultDate(container) {
  let dateInput = container.querySelector("#exp-date");
  if (dateInput !== null) {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    dateInput.value = year + "-" + month + "-" + day;
  }
}

function setupFilters(container) {
  let filters = container.querySelector("#ledger-filters");
  if (filters) {
    filters.addEventListener("click", function(e) {
      let tab = e.target.closest(".filter-tab");
      if (tab) {
        activeFilter = tab.dataset.filter;
        let allTabs = filters.querySelectorAll(".filter-tab");
        for (let i = 0; i < allTabs.length; i++) {
          allTabs[i].classList.remove("active");
        }
        tab.classList.add("active");
        showEntries(container);
      }
    });
  }
}
