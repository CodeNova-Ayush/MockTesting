let board = {
  todo: [],
  inProgress: [],
  done: []
};

let draggedCardId = null;
let draggedFromColumn = null;

let editingCardId = null;
let editingColumn = null;

// Modal elements (DOM references)
let modalOverlay = null;
let modalTitle = null;
let titleInput = null;
let descInput = null;
let priorityInput = null;
let errorText = null;
let saveCardBtn = null;
let cancelCardBtn = null;

export function init(container) {
  // Query elements inside current view container
  modalOverlay = container.querySelector("#modalOverlay");
  modalTitle = container.querySelector("#modalTitle");
  titleInput = container.querySelector("#cardTitleInput");
  descInput = container.querySelector("#cardDescInput");
  priorityInput = container.querySelector("#cardPriorityInput");
  errorText = container.querySelector("#errorText");
  saveCardBtn = container.querySelector("#saveCardBtn");
  cancelCardBtn = container.querySelector("#cancelCardBtn");

  loadBoard();
  renderBoard(container);
  setupEventListeners(container);
}

function loadBoard() {
  const savedData = localStorage.getItem("myKanbanBoard");

  if (savedData !== null) {
    board = JSON.parse(savedData);
  } else {
    board.todo = [
      { id: 1, title: "Learn HTML basics", description: "Practice tags and structure", priority: "low" },
      { id: 2, title: "Learn CSS Flexbox", description: "Build a simple layout", priority: "medium" }
    ];
    board.inProgress = [
      { id: 3, title: "Build Kanban Board", description: "Using HTML, CSS, JS", priority: "high" }
    ];
    board.done = [
      { id: 4, title: "Setup Project Folder", description: "Created index.html, style.css, app.js", priority: "low" }
    ];
  }
  
  if (window.AppState) {
    window.AppState.kanban = board;
  }
}

function saveBoard() {
  const dataAsText = JSON.stringify(board);
  localStorage.setItem("myKanbanBoard", dataAsText);
  
  if (window.AppState) {
    window.AppState.kanban = board;
  }
}

function renderBoard(container = document) {
  const columnNames = ["todo", "inProgress", "done"];

  for (let i = 0; i < columnNames.length; i++) {
    const columnName = columnNames[i];
    const listContainer = container.querySelector("#cards-" + columnName);
    if (!listContainer) continue;

    listContainer.innerHTML = "";

    const tasks = board[columnName] || [];

    for (let j = 0; j < tasks.length; j++) {
      const task = tasks[j];
      const cardElement = createCardElement(task, columnName, container);
      listContainer.appendChild(cardElement);
    }

    const countElement = container.querySelector("#count-" + columnName);
    if (countElement) {
      countElement.innerText = tasks.length;
    }
  }
}

function createCardElement(task, columnName, container) {
  const card = document.createElement("div");
  card.className = "card priority-" + task.priority;
  card.setAttribute("draggable", "true");
  card.setAttribute("data-id", task.id);
  card.setAttribute("data-column", columnName);

  card.innerHTML =
    "<h4>" + task.title + "</h4>" +
    "<p>" + task.description + "</p>" +
    "<div class='card-footer'>" +
      "<span class='priority-tag'>" + task.priority + "</span>" +
      "<div class='card-buttons'>" +
        "<button class='edit-btn'>Edit</button>" +
        "<button class='delete-btn'>Delete</button>" +
      "</div>" +
    "</div>";

  card.addEventListener("dragstart", function () {
    draggedCardId = task.id;
    draggedFromColumn = columnName;
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", function () {
    card.classList.remove("dragging");
  });

  const editButton = card.querySelector(".edit-btn");
  editButton.addEventListener("click", function () {
    openEditModal(task, columnName);
  });

  const deleteButton = card.querySelector(".delete-btn");
  deleteButton.addEventListener("click", function () {
    deleteCard(task.id, columnName, container);
  });

  return card;
}

function deleteCard(id, columnName, container) {
  const confirmDelete = confirm("Are you sure you want to delete this card?");

  if (confirmDelete === true) {
    const tasks = board[columnName];
    const newTasks = [];

    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id !== id) {
        newTasks.push(tasks[i]);
      }
    }

    board[columnName] = newTasks;
    saveBoard();
    renderBoard(container);
  }
}

function openAddModal(columnName) {
  editingCardId = null;
  editingColumn = columnName;

  modalTitle.innerText = "Add Card";
  titleInput.value = "";
  descInput.value = "";
  priorityInput.value = "medium";
  errorText.innerText = "";

  modalOverlay.classList.add("show");
}

function openEditModal(task, columnName) {
  editingCardId = task.id;
  editingColumn = columnName;

  modalTitle.innerText = "Edit Card";
  titleInput.value = task.title;
  descInput.value = task.description;
  priorityInput.value = task.priority;
  errorText.innerText = "";

  modalOverlay.classList.add("show");
}

function closeModal() {
  modalOverlay.classList.remove("show");
}

function setupEventListeners(container) {
  // Bind save buttons
  saveCardBtn.replaceWith(saveCardBtn.cloneNode(true));
  saveCardBtn = container.querySelector("#saveCardBtn");
  saveCardBtn.addEventListener("click", function () {
    const titleValue = titleInput.value.trim();
    const descValue = descInput.value.trim();
    const priorityValue = priorityInput.value;

    if (titleValue === "") {
      errorText.innerText = "Title is required.";
      return;
    }

    if (editingCardId === null) {
      const newCard = {
        id: Date.now(),
        title: titleValue,
        description: descValue,
        priority: priorityValue
      };
      board[editingColumn].push(newCard);
    } else {
      const tasks = board[editingColumn];

      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === editingCardId) {
          tasks[i].title = titleValue;
          tasks[i].description = descValue;
          tasks[i].priority = priorityValue;
        }
      }
    }

    saveBoard();
    renderBoard(container);
    closeModal();
  });

  // Bind cancel button
  cancelCardBtn.replaceWith(cancelCardBtn.cloneNode(true));
  cancelCardBtn = container.querySelector("#cancelCardBtn");
  cancelCardBtn.addEventListener("click", function () {
    closeModal();
  });

  // Add click listeners to all "+ Add Card" buttons
  const addButtons = container.querySelectorAll(".add-btn");
  for (let k = 0; k < addButtons.length; k++) {
    addButtons[k].addEventListener("click", function (event) {
      const columnName = event.target.getAttribute("data-column");
      openAddModal(columnName);
    });
  }

  // Bind drop zones drag & drop handlers
  const dropZones = container.querySelectorAll(".cards-list");
  for (let m = 0; m < dropZones.length; m++) {
    const zone = dropZones[m];

    zone.addEventListener("dragover", function (event) {
      event.preventDefault();
    });

    zone.addEventListener("dragenter", function (event) {
      event.preventDefault();
      const targetZone = event.target.closest(".cards-list");
      if (targetZone) {
        targetZone.classList.add("drag-over");
      }
    });

    zone.addEventListener("dragleave", function (event) {
      event.preventDefault();
      const targetZone = event.target.closest(".cards-list");
      if (targetZone) {
        targetZone.classList.remove("drag-over");
      }
    });

    zone.addEventListener("drop", function (event) {
      event.preventDefault();
      const targetZone = event.target.closest(".cards-list");
      if (targetZone) {
        targetZone.classList.remove("drag-over");
        const targetColumn = targetZone.id.replace("cards-", "");
        moveCard(draggedCardId, draggedFromColumn, targetColumn, container);
      }
    });
  }
}

function moveCard(id, fromColumn, toColumn, container) {
  if (fromColumn === toColumn) {
    return;
  }

  const fromTasks = board[fromColumn];
  let movedTask = null;
  const remainingTasks = [];

  for (let i = 0; i < fromTasks.length; i++) {
    if (fromTasks[i].id === id) {
      movedTask = fromTasks[i];
    } else {
      remainingTasks.push(fromTasks[i]);
    }
  }

  board[fromColumn] = remainingTasks;

  if (movedTask !== null) {
    board[toColumn].push(movedTask);
  }

  saveBoard();
  renderBoard(container);
}
