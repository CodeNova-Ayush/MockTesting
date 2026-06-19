let entriesList = []; 
let activeFilter = "all";
let editingEntryId = null;

function init(container) {
  loadData();
  calculateTotals(container);
  renderLedger(container);

  setupFormListeners(container);
  setupFilterListeners(container);
  setupDefaultDate(container);
}

window.initExpense = init;

function loadData() {
  const savedData = localStorage.getItem("stackone_expenses");

  if (savedData !== null) {
    entriesList = JSON.parse(savedData);
    if (entriesList.length > 0 && (entriesList[0].id === 1 || entriesList[0].description === "Client Project Payment")) {
      entriesList = [];
      localStorage.setItem("stackone_expenses", JSON.stringify(entriesList));
    }
  } else {
    entriesList = [];
  }
  
  if (window.AppState && window.AppState.expense) {
    window.AppState.expense.entries = entriesList;
  }
}

function saveData() {
  const dataString = JSON.stringify(entriesList);
  localStorage.setItem("stackone_expenses", dataString);
  
  if (window.AppState && window.AppState.expense) {
    window.AppState.expense.entries = entriesList;
  }
}

function calculateTotals(container) {
  let totalIncome = 0;
  let totalExpense = 0;

  for (let i = 0; i < entriesList.length; i++) {
    const entry = entriesList[i];
    const entryAmount = parseFloat(entry.amount);

    if (entry.type === "income") {
      totalIncome = totalIncome + entryAmount;
    } else {
      totalExpense = totalExpense + entryAmount;
    }
  }

  const netBalance = totalIncome - totalExpense;

  const balanceText = container.querySelector("#exp-total-balance");
  const incomeText = container.querySelector("#exp-total-income");
  const expenseText = container.querySelector("#exp-total-expense");

  if (balanceText !== null) {
    balanceText.innerText = "$" + netBalance.toFixed(2);
    
    if (netBalance > 0) {
      balanceText.className = "summary-val positive";
    } else if (netBalance < 0) {
      balanceText.className = "summary-val negative";
    } else {
      balanceText.className = "summary-val neutral";
    }
  }

  if (incomeText !== null) {
    incomeText.innerText = "$" + totalIncome.toFixed(2);
  }

  if (expenseText !== null) {
    expenseText.innerText = "$" + totalExpense.toFixed(2);
  }
}

function renderLedger(container) {
  const ledgerList = container.querySelector("#ledger-items");
  if (ledgerList === null) {
    return;
  }

  const filteredList = [];
  for (let i = 0; i < entriesList.length; i++) {
    const entry = entriesList[i];
    if (activeFilter === "all" || entry.type === activeFilter) {
      filteredList.push(entry);
    }
  }

  if (filteredList.length === 0) {
    ledgerList.innerHTML = 
      '<div class="empty-state">' +
        '<div class="empty-state-icon">💰</div>' +
        '<p>No transactions found.</p>' +
      '</div>';
    return;
  }

  ledgerList.innerHTML = "";

  for (let j = 0; j < filteredList.length; j++) {
    const entry = filteredList[j];
    const itemRow = createLedgerRow(container, entry);
    ledgerList.appendChild(itemRow);
  }
}

function createLedgerRow(container, entry) {
  const row = document.createElement("div");
  row.className = "ledger-item";

  const leftSide = document.createElement("div");
  leftSide.className = "ledger-item-left";

  const iconBox = document.createElement("div");
  iconBox.className = "ledger-item-icon " + entry.type;
  if (entry.type === "income") {
    iconBox.innerText = "📈";
  } else {
    iconBox.innerText = "📉";
  }

  const infoBox = document.createElement("div");
  infoBox.className = "ledger-item-info";

  const descriptionSpan = document.createElement("span");
  descriptionSpan.className = "ledger-item-desc";
  descriptionSpan.innerText = entry.description;

  const dateSpan = document.createElement("span");
  dateSpan.className = "ledger-item-date";
  dateSpan.innerText = entry.date;

  infoBox.appendChild(descriptionSpan);
  infoBox.appendChild(dateSpan);
  leftSide.appendChild(iconBox);
  leftSide.appendChild(infoBox);

  const rightSide = document.createElement("div");
  rightSide.className = "ledger-item-right";

  const amountSpan = document.createElement("span");
  amountSpan.className = "ledger-item-amount " + entry.type;
  
  const formattedVal = parseFloat(entry.amount).toFixed(2);
  if (entry.type === "income") {
    amountSpan.innerText = "+$" + formattedVal;
  } else {
    amountSpan.innerText = "-$" + formattedVal;
  }

  const actionButtons = document.createElement("div");
  actionButtons.className = "ledger-item-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn-icon edit";
  editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';
  editBtn.addEventListener("click", function () {
    startEditing(container, entry);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn-icon delete";
  deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
  deleteBtn.addEventListener("click", function () {
    deleteEntry(container, entry.id);
  });

  actionButtons.appendChild(editBtn);
  actionButtons.appendChild(deleteBtn);

  rightSide.appendChild(amountSpan);
  rightSide.appendChild(actionButtons);

  row.appendChild(leftSide);
  row.appendChild(rightSide);

  return row;
}

function startEditing(container, entry) {
  editingEntryId = entry.id;

  container.querySelector("#exp-desc").value = entry.description;
  container.querySelector("#exp-amount").value = entry.amount;
  container.querySelector("#exp-type").value = entry.type;
  container.querySelector("#exp-date").value = entry.date;

  container.querySelector("#exp-submit-btn").innerText = "Save Changes";
  container.querySelector("#exp-cancel-btn").style.display = "block";
  container.querySelector("#form-heading").innerText = "Edit Transaction";
}

function deleteEntry(container, id) {
  const confirmed = confirm("Are you sure you want to delete this transaction?");
  
  if (confirmed === true) {
    const listAfterDelete = [];
    
    for (let i = 0; i < entriesList.length; i++) {
      if (entriesList[i].id !== id) {
        listAfterDelete.push(entriesList[i]);
      }
    }
    
    entriesList = listAfterDelete;

    if (editingEntryId === id) {
      resetForm(container);
    }

    saveData();
    calculateTotals(container);
    renderLedger(container);
  }
}

function resetForm(container) {
  const formElement = container.querySelector("#expense-form");
  if (formElement !== null) {
    formElement.reset();
  }
  
  editingEntryId = null;

  container.querySelector("#exp-submit-btn").innerText = "Add Entry";
  container.querySelector("#exp-cancel-btn").style.display = "none";
  container.querySelector("#form-heading").innerText = "Add Transaction";

  setupDefaultDate(container);
}

function setupDefaultDate(container) {
  const dateInput = container.querySelector("#exp-date");
  if (dateInput !== null) {
    const dateToday = new Date();
    const yearVal = dateToday.getFullYear();
    let monthVal = dateToday.getMonth() + 1;
    let dayVal = dateToday.getDate();

    if (monthVal < 10) {
      monthVal = "0" + monthVal;
    }
    if (dayVal < 10) {
      dayVal = "0" + dayVal;
    }

    dateInput.value = yearVal + "-" + monthVal + "-" + dayVal;
  }
}

function setupFormListeners(container) {
  const transactionForm = container.querySelector("#expense-form");
  const cancelBtn = container.querySelector("#exp-cancel-btn");

  transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    clearErrors(container);

    const descField = container.querySelector("#exp-desc");
    const amountField = container.querySelector("#exp-amount");
    const dateField = container.querySelector("#exp-date");

    const description = descField.value.trim();
    const amount = parseFloat(amountField.value);
    const date = dateField.value;

    let isFormValid = true;

    if (description === "") {
      descField.classList.add("input-invalid");
      container.querySelector("#exp-error-desc").style.display = "block";
      isFormValid = false;
    }

    if (isNaN(amount) || amount <= 0) {
      amountField.classList.add("input-invalid");
      container.querySelector("#exp-error-amount").style.display = "block";
      isFormValid = false;
    }

    if (date === "") {
      dateField.classList.add("input-invalid");
      container.querySelector("#exp-error-date").style.display = "block";
      isFormValid = false;
    }

    if (isFormValid === false) {
      return;
    }

    const type = container.querySelector("#exp-type").value;

    if (editingEntryId !== null) {
      for (let i = 0; i < entriesList.length; i++) {
        if (entriesList[i].id === editingEntryId) {
          entriesList[i].description = description;
          entriesList[i].amount = amount;
          entriesList[i].type = type;
          entriesList[i].date = date;
        }
      }
    } else {
      const newRecord = {
        id: Date.now(),
        description: description,
        amount: amount,
        type: type,
        date: date
      };
      entriesList.push(newRecord);
    }

    saveData();
    calculateTotals(container);
    renderLedger(container);
    resetForm(container);
  });

  cancelBtn.addEventListener("click", function () {
    clearErrors(container);
    resetForm(container);
  });
}

function clearErrors(container) {
  const desc = container.querySelector("#exp-desc");
  const amount = container.querySelector("#exp-amount");
  const date = container.querySelector("#exp-date");

  desc.classList.remove("input-invalid");
  amount.classList.remove("input-invalid");
  date.classList.remove("input-invalid");

  container.querySelector("#exp-error-desc").style.display = "none";
  container.querySelector("#exp-error-amount").style.display = "none";
  container.querySelector("#exp-error-date").style.display = "none";
}

function setupFilterListeners(container) {
  const filterTabsContainer = container.querySelector("#ledger-filters");
  if (filterTabsContainer === null) {
    return;
  }

  const buttonsList = filterTabsContainer.querySelectorAll(".filter-tab");
  for (let i = 0; i < buttonsList.length; i++) {
    const filterBtn = buttonsList[i];
    
    filterBtn.addEventListener("click", function () {
      for (let j = 0; j < buttonsList.length; j++) {
        buttonsList[j].classList.remove("active");
      }
      
      filterBtn.classList.add("active");

      activeFilter = filterBtn.getAttribute("data-filter");
      renderLedger(container);
    });
  }
}
