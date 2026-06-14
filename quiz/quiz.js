let questions = [
  { question: "What is the return type of 'typeof null' in JavaScript?", options: ["'null'", "'object'", "'undefined'", "'string'"], answer: 1, explanation: "In JavaScript, 'typeof null' returns 'object'. This is a historical bug in the language." },
  { question: "Which of the following is NOT a primitive data type in JavaScript?", options: ["Boolean", "String", "Symbol", "Float"], answer: 3, explanation: "JavaScript has primitives like Boolean, String, Symbol, Number, and BigInt. 'Float' is not a separate primitive; numbers are all double-precision floats." },
  { question: "What is the result of the expression: 0.1 + 0.2 === 0.3?", options: ["true", "false", "NaN", "TypeError"], answer: 1, explanation: "Due to binary floating-point arithmetic precision issues, 0.1 + 0.2 equals 0.30000000000000004, which is not strictly equal to 0.3." },
  { question: "Which keyword declares a variable that is block-scoped but remains uninitialized in the 'Temporal Dead Zone' until declared?", options: ["var", "let", "global", "unlet"], answer: 1, explanation: "Variables declared with 'let' and 'const' are block-scoped and hoisted, but they cannot be accessed before their declaration due to the Temporal Dead Zone." },
  { question: "What is the output of the expression: [] + []?", options: ["[]", "undefined", "NaN", "'' (empty string)"], answer: 3, explanation: "When adding two arrays, JavaScript converts both to strings. Empty arrays convert to empty strings, resulting in an empty string concatenation." },
  { question: "Which array method removes the LAST element of an array and returns it?", options: ["shift()", "pop()", "slice()", "splice()"], answer: 1, explanation: "'pop()' removes and returns the last element. 'shift()' removes and returns the first element." },
  { question: "Which of the following creates a shallow copy of an object named 'user'?", options: ["Object.assign({}, user)", "{ ...user }", "Both of the above", "None of the above"], answer: 2, explanation: "Both the spread operator '{ ...user }' and 'Object.assign({}, user)' create a shallow copy of the object." },
  { question: "What is the primary difference between double equals (==) and triple equals (===)?", options: ["== compares values, === compares memory references", "== performs type coercion before comparing, === does not", "== is faster than ===", "=== is only used for objects"], answer: 1, explanation: "== compares for equality after performing implicit type conversions (coercion). === compares both value and type without coercion." },
  { question: "What does Promise.all() do when passed an array of Promises?", options: ["Resolves when all promises resolve, or rejects immediately if any promise rejects", "Resolves as soon as any one promise resolves", "Executes all promises sequentially one after the other", "Rejects only if all promises reject"], answer: 0, explanation: "Promise.all() is all-or-nothing: it resolves with an array of values if all resolve, and rejects immediately if any promise fails." },
  { question: "How do you check if a property exists inside an object in JavaScript?", options: ["'prop' in obj", "obj.hasOwnProperty('prop')", "Both of the above", "None of the above"], answer: 2, explanation: "Both the 'in' operator and the 'hasOwnProperty()' method check for properties, though 'in' checks prototype chain and 'hasOwnProperty' checks direct keys." }
];

let currentQuestion = 0;
let score = 0;
let answered = false;
let selectedOption = null;
let answersLog = [];
let timerId = null;

export function init(container) {
  let state = window.AppState.quiz;
  currentQuestion = state.currentIndex;
  score = state.score;
  answered = state.answered;
  selectedOption = state.selectedOption;
  answersLog = state.answersLog;

  if (currentQuestion >= 10) {
    currentQuestion = 0;
    score = 0;
    answered = false;
    selectedOption = null;
    answersLog = [];
    syncState();
  }
  renderQuiz(container);
}

function syncState() {
  let state = window.AppState.quiz;
  state.currentIndex = currentQuestion;
  state.score = score;
  state.answered = answered;
  state.selectedOption = selectedOption;
  state.answersLog = answersLog;
}

function stopTimer() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}

function renderQuiz(container) {
  if (currentQuestion >= 10) {
    showResult(container);
  } else {
    loadQuestion(container);
  }
}

function loadQuestion(container) {
  stopTimer();
  let q = questions[currentQuestion];
  let progress = (currentQuestion / 10) * 100;
  let workspace = container.querySelector("#quiz-workspace");

  let optionsHtml = "";
  for (let i = 0; i < q.options.length; i++) {
    optionsHtml = optionsHtml + '<button class="quiz-option" data-index="' + i + '"><span>' + q.options[i] + '</span><span class="quiz-option-status-icon"></span></button>';
  }

  let questionNum = currentQuestion + 1;
  workspace.innerHTML = '<div class="quiz-header"><span>Question <strong>' + questionNum + '</strong> of 10</span><div id="quiz-timer-display" class="quiz-timer">⏱️ 30s</div></div><div class="quiz-progress-bar-container" style="margin-bottom: 24px;"><div class="quiz-progress-bar" style="width: ' + progress + '%;"></div></div><div class="quiz-question-card"><h3 class="question-text">' + q.question + '</h3><div class="quiz-options-list" id="quiz-options">' + optionsHtml + '</div></div><div class="quiz-actions"><button id="quiz-next-btn" class="btn btn-primary" style="display: none;"></button></div>';

  let nextBtn = container.querySelector("#quiz-next-btn");
  if (currentQuestion === 9) {
    nextBtn.innerText = "Finish Quiz";
  } else {
    nextBtn.innerText = "Next Question →";
  }

  nextBtn.addEventListener("click", function() {
    nextQuestion(container);
  });

  let optionsList = container.querySelector("#quiz-options");
  optionsList.addEventListener("click", function(e) {
    let optionBtn = e.target.closest(".quiz-option");
    if (optionBtn && !answered) {
      let idx = parseInt(optionBtn.dataset.index, 10);
      checkAnswer(container, idx);
    }
  });

  startTimer(container, 30);
}

function nextQuestion(container) {
  currentQuestion = currentQuestion + 1;
  answered = false;
  selectedOption = null;
  syncState();
  renderQuiz(container);
}

function startTimer(container, secondsLeft) {
  if (!container.isConnected) {
    stopTimer();
    return;
  }
  let timerDisplay = container.querySelector("#quiz-timer-display");
  if (!timerDisplay) {
    return;
  }

  timerDisplay.innerText = "⏱️ " + secondsLeft + "s";

  if (secondsLeft <= 5) {
    timerDisplay.classList.add("danger");
  } else {
    timerDisplay.classList.remove("danger");
  }

  if (secondsLeft <= 0) {
    checkAnswer(container, -1);
    return;
  }

  timerId = setTimeout(function() {
    startTimer(container, secondsLeft - 1);
  }, 1000);
}

function checkAnswer(container, selectedIndex) {
  stopTimer();
  answered = true;
  selectedOption = selectedIndex;

  let q = questions[currentQuestion];
  let isCorrect = (selectedIndex === q.answer);

  if (isCorrect) {
    score = score + 1;
    answersLog.push(true);
  } else {
    answersLog.push(false);
  }
  syncState();

  let allOptions = container.querySelectorAll(".quiz-option");
  for (let i = 0; i < allOptions.length; i++) {
    allOptions[i].disabled = true;
    let optIdx = parseInt(allOptions[i].dataset.index, 10);
    let statusIcon = allOptions[i].querySelector(".quiz-option-status-icon");
    if (optIdx === q.answer) {
      allOptions[i].classList.add("correct");
      statusIcon.innerText = "✓";
    } else if (optIdx === selectedIndex) {
      allOptions[i].classList.add("incorrect");
      statusIcon.innerText = "✗";
    }
  }

  let card = container.querySelector(".quiz-question-card");
  let explanationDiv = document.createElement("div");
  explanationDiv.className = "explanation-box";

  let statusText = document.createElement("p");
  if (isCorrect) {
    statusText.className = "explanation-status correct";
    statusText.innerText = "Correct Answer!";
  } else if (selectedIndex === -1) {
    statusText.className = "explanation-status incorrect";
    statusText.innerText = "Time's up! Incorrect";
  } else {
    statusText.className = "explanation-status incorrect";
    statusText.innerText = "Incorrect Answer";
  }
  explanationDiv.appendChild(statusText);

  let explanationText = document.createElement("p");
  explanationText.className = "explanation-text";
  explanationText.innerText = q.explanation;
  explanationDiv.appendChild(explanationText);

  card.appendChild(explanationDiv);

  let nextBtn = container.querySelector("#quiz-next-btn");
  if (nextBtn) {
    nextBtn.style.display = "block";
    nextBtn.focus();
  }
}

function showResult(container) {
  stopTimer();
  let percent = Math.round((score / 10) * 100);
  let verdict = "";
  if (percent < 50) {
    verdict = "Keep learning! JavaScript has some tricky quirks. Try again to improve your score.";
  } else if (percent < 80) {
    verdict = "Good effort! You know the basics, but review the explanations to master the language.";
  } else {
    verdict = "Excellent job! You have a solid grasp of JavaScript.";
  }

  let workspace = container.querySelector("#quiz-workspace");
  workspace.innerHTML = '<div class="quiz-summary-card"><h2>Quiz Completed!</h2><div class="quiz-summary-score-badge">' + percent + '%</div><h3>You scored ' + score + ' / 10</h3><p class="quiz-summary-text">' + verdict + '</p><button id="quiz-retry-btn" class="btn btn-primary" style="margin-top: 12px; padding: 12px 32px;">Play Again</button></div>';

  let retryBtn = container.querySelector("#quiz-retry-btn");
  retryBtn.addEventListener("click", function() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    selectedOption = null;
    answersLog = [];
    syncState();
    renderQuiz(container);
  });
}
