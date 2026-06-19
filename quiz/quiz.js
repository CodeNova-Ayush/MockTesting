let questions = [
  {
    question: "What is typeof null?",
    options: ["'null'", "'object'", "'undefined'", "'string'"],
    answer: 1,
    explanation: "In JavaScript, 'typeof null' returns 'object'. This is a historical bug in the language."
  },
  {
    question: "Which is NOT primitive?",
    options: ["Boolean", "String", "Symbol", "Float"],
    answer: 3,
    explanation: "JavaScript has primitives like Boolean, String, Symbol, Number, and BigInt. 'Float' is not a separate primitive."
  },
  {
    question: "What is 0.1 + 0.2 === 0.3?",
    options: ["true", "false", "NaN", "TypeError"],
    answer: 1,
    explanation: "Due to binary precision issues, 0.1 + 0.2 equals 0.30000000000000004, which is not strictly equal to 0.3."
  },
  {
    question: "Which declares block scope?",
    options: ["var", "let", "global", "unlet"],
    answer: 1,
    explanation: "Variables declared with 'let' and 'const' are block-scoped and hoisted, but remain in the Temporal Dead Zone."
  },
  {
    question: "What is [] + []?",
    options: ["[]", "undefined", "NaN", "''"],
    answer: 3,
    explanation: "When adding two arrays, JavaScript converts both to empty strings, resulting in an empty string concatenation."
  },
  {
    question: "Which method removes the last element?",
    options: ["shift()", "pop()", "slice()", "splice()"],
    answer: 1,
    explanation: "'pop()' removes and returns the last element. 'shift()' removes and returns the first element."
  },
  {
    question: "Which creates a shallow copy?",
    options: ["Object.assign()", "Spread operator", "Both of these", "None of these"],
    answer: 2,
    explanation: "Both the spread operator '{ ...user }' and 'Object.assign({}, user)' create a shallow copy of the object."
  },
  {
    question: "What is the difference between == and ===?",
    options: ["Reference vs Value", "Coercion vs Strict", "Speed", "Object only"],
    answer: 1,
    explanation: "== compares for equality after type coercion. === compares both value and type without coercion."
  },
  {
    question: "What does Promise.all() do?",
    options: ["All-or-nothing", "Resolves any", "Runs sequentially", "Fails only if all fail"],
    answer: 0,
    explanation: "Promise.all() resolves when all promises resolve, or rejects immediately if any promise rejects."
  },
  {
    question: "How to check property existence?",
    options: ["'prop' in obj", "hasOwnProperty()", "Both of these", "None of these"],
    answer: 2,
    explanation: "Both the 'in' operator and the 'hasOwnProperty()' method check for properties inside an object."
  }
];

let index = 0;
let score = 0;
let answered = false;
let selected = null;
let log = [];
let timer = null;

export function init(container) {
  let state = window.AppState.quiz;
  index = state.currentIndex;
  score = state.score;
  answered = state.answered;
  selected = state.selectedOption;
  log = state.answersLog;
  if (index >= 10) {
    resetState();
  }
  renderQuiz(container);
}

function resetState() {
  index = 0;
  score = 0;
  answered = false;
  selected = null;
  log = [];
  syncState();
}

function syncState() {
  let state = window.AppState.quiz;
  state.currentIndex = index;
  state.score = score;
  state.answered = answered;
  state.selectedOption = selected;
  state.answersLog = log;
}

function stopTimer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

function renderQuiz(container) {
  if (index >= 10) {
    showResult(container);
  } else {
    loadQuestion(container);
  }
}

function getOptionsHtml(options) {
  let html = "";
  for (let i = 0; i < options.length; i++) {
    html = html + '<button class="quiz-option" data-index="' + i + '"><span>' + options[i] + '</span><span class="quiz-option-status-icon"></span></button>';
  }
  return html;
}

function loadQuestion(container) {
  stopTimer();
  let data = questions[index];
  let progress = (index / 10) * 100;
  let space = container.querySelector("#quiz-workspace");
  let html = getOptionsHtml(data.options);
  let num = index + 1;
  space.innerHTML = '<div class="quiz-header"><span>Question <strong>' + num + '</strong> of 10</span><div id="quiz-timer-display" class="quiz-timer">⏱️ 30s</div></div><div class="quiz-progress-bar-container" style="margin-bottom: 24px;"><div class="quiz-progress-bar" style="width: ' + progress + '%;"></div></div><div class="quiz-question-card"><h3 class="question-text">' + data.question + '</h3><div class="quiz-options-list" id="quiz-options">' + html + '</div></div><div class="quiz-actions"><button id="quiz-next-btn" class="btn btn-primary" style="display: none;"></button></div>';
  setupQuestionEvents(container);
  startTimer(container, 30);
}

function setupQuestionEvents(container) {
  let btn = container.querySelector("#quiz-next-btn");
  btn.innerText = index === 9 ? "Finish Quiz" : "Next Question →";
  btn.addEventListener("click", function() {
    nextQuestion(container);
  });
  bindOptionClicks(container);
}

function bindOptionClicks(container) {
  let list = container.querySelector("#quiz-options");
  let btns = list.querySelectorAll(".quiz-option");
  btns.forEach(function(item) {
    item.addEventListener("click", function() {
      if (!answered) {
        let idx = parseInt(item.getAttribute("data-index"), 10);
        checkAnswer(container, idx);
      }
    });
  });
}

function nextQuestion(container) {
  index = index + 1;
  answered = false;
  selected = null;
  syncState();
  renderQuiz(container);
}

function startTimer(container, secondsLeft) {
  if (!container.isConnected) return stopTimer();
  let display = container.querySelector("#quiz-timer-display");
  if (display === null) return;
  display.innerText = "⏱️ " + secondsLeft + "s";
  updateTimerColor(display, secondsLeft);
  if (secondsLeft <= 0) {
    checkAnswer(container, -1);
  } else {
    timer = setTimeout(function() {
      startTimer(container, secondsLeft - 1);
    }, 1000);
  }
}

function updateTimerColor(display, secondsLeft) {
  if (secondsLeft <= 5) {
    display.classList.add("danger");
  } else {
    display.classList.remove("danger");
  }
}

function checkAnswer(container, selectedIndex) {
  stopTimer();
  answered = true;
  selected = selectedIndex;
  let data = questions[index];
  let isCorrect = selectedIndex === data.answer;
  updateScoreAndLog(isCorrect);
  syncState();
  disableOptions(container, data.answer, selectedIndex);
  appendExplanation(container, data.explanation, isCorrect, selectedIndex);
  showNextButton(container);
}

function updateScoreAndLog(isCorrect) {
  if (isCorrect) {
    score = score + 1;
    log.push(true);
  } else {
    log.push(false);
  }
}

function disableOptions(container, answerIndex, selectedIndex) {
  let all = container.querySelectorAll(".quiz-option");
  all.forEach(function(btn) {
    btn.disabled = true;
    let optIdx = parseInt(btn.getAttribute("data-index"), 10);
    let icon = btn.querySelector(".quiz-option-status-icon");
    if (optIdx === answerIndex) {
      btn.classList.add("correct");
      icon.innerText = "✓";
    } else if (optIdx === selectedIndex) {
      btn.classList.add("incorrect");
      icon.innerText = "✗";
    }
  });
}

function appendExplanation(container, explanation, isCorrect, selectedIndex) {
  let card = container.querySelector(".quiz-question-card");
  let box = document.createElement("div");
  box.className = "explanation-box";
  let status = createStatusText(isCorrect, selectedIndex);
  box.appendChild(status);
  let text = document.createElement("p");
  text.className = "explanation-text";
  text.innerText = explanation;
  box.appendChild(text);
  card.appendChild(box);
}

function createStatusText(isCorrect, selectedIndex) {
  let text = document.createElement("p");
  if (isCorrect) {
    text.className = "explanation-status correct";
    text.innerText = "Correct Answer!";
  } else if (selectedIndex === -1) {
    text.className = "explanation-status incorrect";
    text.innerText = "Time's up! Incorrect";
  } else {
    text.className = "explanation-status incorrect";
    text.innerText = "Incorrect Answer";
  }
  return text;
}

function showNextButton(container) {
  let btn = container.querySelector("#quiz-next-btn");
  if (btn !== null) {
    btn.style.display = "block";
    btn.focus();
  }
}

function showResult(container) {
  stopTimer();
  let pct = Math.round((score / 10) * 100);
  let text = getVerdict(pct);
  let space = container.querySelector("#quiz-workspace");
  space.innerHTML = '<div class="quiz-summary-card"><h2>Quiz Completed!</h2><div class="quiz-summary-score-badge">' + pct + '%</div><h3>You scored ' + score + ' / 10</h3><p class="quiz-summary-text">' + text + '</p><button id="quiz-retry-btn" class="btn btn-primary" style="margin-top: 12px; padding: 12px 32px;">Play Again</button></div>';
  let retryBtn = container.querySelector("#quiz-retry-btn");
  retryBtn.addEventListener("click", function() {
    resetState();
    renderQuiz(container);
  });
}

function getVerdict(percent) {
  if (percent < 50) {
    return "Keep learning! JavaScript has some tricky quirks. Try again to improve your score.";
  }
  if (percent < 80) {
    return "Good effort! You know the basics, but review the explanations to master the language.";
  }
  return "Excellent job! You have a solid grasp of JavaScript.";
}
