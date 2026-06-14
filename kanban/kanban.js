let draggedCard = null;

export function init(container) {
  loadData();
  showBoard(container);
  setupButtons(container);
  setupDragDrop(container);
}

function loadData() {
  let saved = localStorage.getItem("stackone_kanban");
  if (saved !== null) {
    window.AppState.kanban = JSON.parse(saved);
  } else {
    let mockData = {
      todo: [
        { id: 101, title: "Implement user auth", description: "Integrate Firebase Auth routines.", priority: "high" },
        { id: 102, title: "Write unit tests", description: "Create mocks for router validations.", priority: "medium" }
      ],
      inProgress: [
        { id: 103, title: "Design landing page", description: "Style Hero section using CSS mesh background.", priority: "high" }
      ],
      done: [
        { id: 104, title: "Project skeleton", description: "Commit initial directory layout details.", priority: "low" }
      ]
    };
    window.AppState.kanban = mockData;
    saveData();
  }
}

function saveData() {
  let board = window.AppState.kanban;
  let json = JSON.stringify(board);
  localStorage.setItem("stackone_kanban", json);
}

function showBoard(container) {
  showColumn(container, "todo");
  showColumn(container, "inProgress");
  showColumn(container, "done");
  updateCounts(container);
}

function updateCounts(container) {
  let board = window.AppState.kanban;
  let countTodo = container.querySelector("#count-todo");
  let countInProgress = container.querySelector("#count-inProgress");
  let countDone = container.querySelector("#count-done");

  if (countTodo) countTodo.innerText = board.todo.length;
  if (countInProgress) countInProgress.innerText = board.inProgress.length;
  if (countDone) countDone.innerText = board.done.length;
}

function showColumn(container, colId) {
  let list = container.querySelector("#cards-" + colId);
  if (list === null) return;
  list.innerHTML = "";
  
  let cards = window.AppState.kanban[colId];
  if (!cards) cards = [];

  for (let i = 0; i < cards.length; i++) {
    let cardData = cards[i];
    let cardElement = makeCardHtml(cardData, colId);
    list.appendChild(cardElement);
  }
}

function makeCardHtml(cardData, colId) {
  let el = document.createElement("div");
  el.className = "kanban-card";
  el.dataset.id = cardData.id;
  el.dataset.column = colId;

  if (cardData.isEditing === true) {
    el.removeAttribute("draggable");
    
    let lowSel = "";
    let medSel = "";
    let highSel = "";
    if (cardData.priority === "low") lowSel = "selected";
    if (cardData.priority === "medium") medSel = "selected";
    if (cardData.priority === "high") highSel = "selected";

    let htmlStr = '<div class="kanban-edit-form">';
    htmlStr = htmlStr + '<input type="text" class="form-input card-edit-title" value="' + cardData.title + '" placeholder="Task title..." style="margin-bottom: 4px;">';
    htmlStr = htmlStr + '<textarea class="form-textarea card-edit-desc" placeholder="Task description..." rows="2" style="margin-bottom: 4px;">' + cardData.description + '</textarea>';
    htmlStr = htmlStr + '<select class="form-select card-edit-priority" style="margin-bottom: 8px;">';
    htmlStr = htmlStr + '<option value="low" ' + lowSel + '>Low</option>';
    htmlStr = htmlStr + '<option value="medium" ' + medSel + '>Medium</option>';
    htmlStr = htmlStr + '<option value="high" ' + highSel + '>High</option>';
    htmlStr = htmlStr + '</select>';
    htmlStr = htmlStr + '<div style="display: flex; gap: 6px;">';
    htmlStr = htmlStr + '<button class="btn btn-primary btn-save-card" style="padding: 6px 12px; font-size: 0.8rem; flex: 1;">Save</button>';
    htmlStr = htmlStr + '<button class="btn btn-secondary btn-cancel-card" style="padding: 6px 12px; font-size: 0.8rem;">Cancel</button>';
    htmlStr = htmlStr + '</div></div>';
    
    el.innerHTML = htmlStr;
  } else {
    el.setAttribute("draggable", "true");
    
    let desc = cardData.description;
    if (desc === "") desc = "No description.";

    let htmlStr = '<h4 class="kanban-card-title">' + cardData.title + '</h4>';
    htmlStr = htmlStr + '<p class="kanban-card-desc">' + desc + '</p>';
    htmlStr = htmlStr + '<div class="kanban-card-footer">';
    htmlStr = htmlStr + '<span class="priority-badge ' + cardData.priority + '">' + cardData.priority + '</span>';
    htmlStr = htmlStr + '<div class="kanban-card-actions">';
    htmlStr = htmlStr + '<button class="btn-icon edit" title="Edit Card"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>';
    htmlStr = htmlStr + '<button class="btn-icon delete" title="Delete Card"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>';
    htmlStr = htmlStr + '</div></div>';
    
    el.innerHTML = htmlStr;
    
    el.addEventListener("dragstart", function(event) {
      draggedCard = event.target;
      event.target.style.opacity = "0.5";
    });
    
    el.addEventListener("dragend", function(event) {
      event.target.style.opacity = "1";
    });
  }
  return el;
}

function setupDragDrop(container) {
  let columns = container.querySelectorAll(".kanban-column");
  for (let i = 0; i < columns.length; i++) {
    let col = columns[i];
    
    col.addEventListener("dragover", function(event) {
      event.preventDefault();
    });
    
    col.addEventListener("drop", function(event) {
      event.preventDefault();
      let target = event.target;
      let targetCol = target.closest(".kanban-column");
      if (targetCol !== null && draggedCard !== null) {
        let list = targetCol.querySelector(".kanban-cards-list");
        list.appendChild(draggedCard);
        draggedCard.dataset.column = targetCol.dataset.column;
        updateBoardState();
      }
    });
  }
}

function updateBoardState() {
  let board = window.AppState.kanban;
  let allTasks = [];
  
  for (let i = 0; i < board.todo.length; i++) allTasks.push(board.todo[i]);
  for (let i = 0; i < board.inProgress.length; i++) allTasks.push(board.inProgress[i]);
  for (let i = 0; i < board.done.length; i++) allTasks.push(board.done[i]);

  let columns = ["todo", "inProgress", "done"];
  for (let c = 0; c < columns.length; c++) {
    let colId = columns[c];
    let listEl = document.querySelector("#cards-" + colId);
    if (listEl !== null) {
      let cardEls = listEl.querySelectorAll(".kanban-card");
      let updatedCards = [];
      for (let i = 0; i < cardEls.length; i++) {
        let cardId = parseInt(cardEls[i].dataset.id, 10);
        let task = null;
        for (let j = 0; j < allTasks.length; j++) {
          if (allTasks[j].id === cardId) {
            task = allTasks[j];
          }
        }
        if (task !== null) updatedCards.push(task);
      }
      board[colId] = updatedCards;
    }
  }
  saveData();
  updateCounts(document);
}

function setupButtons(container) {
  let addBtns = container.querySelectorAll(".btn-add-task");
  for (let i = 0; i < addBtns.length; i++) {
    let btn = addBtns[i];
    btn.addEventListener("click", function() {
      let colId = btn.dataset.column;
      let newCard = {
        id: Date.now(),
        title: "",
        description: "",
        priority: "medium",
        isEditing: true
      };
      window.AppState.kanban[colId].push(newCard);
      showBoard(container);
      
      let colEl = container.querySelector("#col-" + colId);
      if (colEl) {
        let inputs = colEl.querySelectorAll(".card-edit-title");
        let lastInput = inputs[inputs.length - 1];
        if (lastInput) lastInput.focus();
      }
    });
  }

  let boardEl = container.querySelector(".kanban-board");
  if (boardEl !== null) {
    boardEl.addEventListener("click", function(e) {
      let card = e.target.closest(".kanban-card");
      if (card === null) return;
      
      let cardId = parseInt(card.dataset.id, 10);
      let colId = card.dataset.column;
      
      if (e.target.classList.contains("btn-save-card")) {
        let titleVal = card.querySelector(".card-edit-title").value.trim();
        let descVal = card.querySelector(".card-edit-desc").value.trim();
        let priorityVal = card.querySelector(".card-edit-priority").value;
        
        if (titleVal === "") {
          card.querySelector(".card-edit-title").classList.add("input-invalid");
          return;
        }
        
        let list = window.AppState.kanban[colId];
        for (let j = 0; j < list.length; j++) {
          if (list[j].id === cardId) {
            list[j].title = titleVal;
            list[j].description = descVal;
            list[j].priority = priorityVal;
            delete list[j].isEditing;
          }
        }
        saveData();
        showBoard(container);
      } 
      else if (e.target.classList.contains("btn-cancel-card")) {
        let list = window.AppState.kanban[colId];
        let updatedList = [];
        for (let j = 0; j < list.length; j++) {
          let task = list[j];
          if (task.id !== cardId) {
            updatedList.push(task);
          } else if (task.title !== "") {
            delete task.isEditing;
            updatedList.push(task);
          }
        }
        window.AppState.kanban[colId] = updatedList;
        showBoard(container);
      }
      else if (e.target.closest(".btn-icon.edit")) {
        let board = window.AppState.kanban;
        let columns = ["todo", "inProgress", "done"];
        for (let c = 0; c < columns.length; c++) {
          let list = board[columns[c]];
          let cleanList = [];
          for (let i = 0; i < list.length; i++) {
            let task = list[i];
            if (task.isEditing && task.title !== "") {
              delete task.isEditing;
              cleanList.push(task);
            } else if (!task.isEditing) {
              cleanList.push(task);
            }
          }
          board[columns[c]] = cleanList;
        }
        
        let currentList = window.AppState.kanban[colId];
        for (let j = 0; j < currentList.length; j++) {
          if (currentList[j].id === cardId) {
            currentList[j].isEditing = true;
          }
        }
        showBoard(container);
      }
      else if (e.target.closest(".btn-icon.delete")) {
        let list = window.AppState.kanban[colId];
        let updatedList = [];
        for (let j = 0; j < list.length; j++) {
          if (list[j].id !== cardId) {
            updatedList.push(list[j]);
          }
        }
        window.AppState.kanban[colId] = updatedList;
        saveData();
        showBoard(container);
      }
    });
  }
}
