StackOne - Ultimate Developer Workspace
StackOne is a unified developer workspace and team dashboard that aggregates core engineering utilities into a single integrated tab. By combining project tracking, code analytics, expense ledgering, portfolios, and quizzes, it serves as a central hub for individual developer workflows.

JS Quiz Engine
A timed, interactive JavaScript quiz built with vanilla HTML, CSS, and JS. Test your knowledge of JavaScript fundamentals with 10 carefully curated questions.

Features
10 Multiple-Choice Questions — Covers topics like type coercion, scope, arrays, promises, and more.
30-Second Timer — Each question has a countdown timer. If time runs out, the answer is marked incorrect.
Instant Feedback — Correct and incorrect answers are highlighted with visual icons and color coding.
Explanations — After answering, a detailed explanation is shown for every question.
Progress Bar — A visual progress bar tracks your position through the quiz.
Score Summary — At the end, a summary card shows your percentage score with a personalized verdict.
Play Again — Restart the quiz anytime to improve your score.
Team Portfolios
A directory of engineering team profiles showcasing their roles, specific skill tags, and social profiles.

Features
Dynamic Avatars — Programmatically extracts letters from team member names to create initial-based profile avatars.
Color Coding — Alternating profile color themes for each member card.
Contact Forms — Built-in message board form with input validation (checks empty names, valid email formats, and minimum message length rules) to ensure messages are delivered successfully.
Expense Tracker
A ledger system that computes finances, classifies transactions, and monitors business expenses in real-time.

Features
Summary Cards — Dynamically calculates your Net Balance, Total Income, and Total Expenses using vanilla looping structures.
Ledger Logger — Shows individual entries with custom indicators (green rising charts for incomes, red falling charts for expenses) along with descriptions, dates, and amounts.
Categorical Filtering — Tabs to filter the ledger logs by transaction categories ("All", "Income", "Expenses").
Persistence & Zero State - Integrates with browser LocalStorage to save your data permanently, starting from $0.00 on clean load.
GitHub Explorer
An integration interface that communicates with the official GitHub REST API to perform lookup operations on developers' public profiles and codebases.

Features
Live Profile Search — Fetch profile avatars, names, usernames, follower counts, following counts, repositories, bios, and locations.
Language Charts — Computes repository languages and displays a visual bar graph detailing the percentage layout of code languages.
Star & Fork Sorter — List public repositories and sort them dynamically by their popularity (stars) or fork counts.
Offline Fallback — Programmed with local cached files to display mock search profiles (such as Google or Octocat) in case GitHub API limits are exceeded.
Kanban Task Board
A workflow management dashboard designed to organize tasks, adjust sprints, and track progress using category boards.

Features
Drag-and-Drop Categories — Move cards between "To Do", "In Progress", and "Done" columns smoothly. Highlight borders alert target drop zones during drags.
Card Creator Modal — Launch a dedicated modal window to create or edit cards, configure custom fields (Title, Description), and choose priority levels.
Priority Indicators — Color-coded left borders and tags (green for Low, orange for Medium, red for High) allow fast visually-scanned boards.
Dynamic Task Counts — Automatically updates the task number counters on each column header upon creation, edit, movement, or deletion.
Tech Stack
Tech Stack
HTML5 — Semantic, clean page layout structures
CSS3 — Responsive layouts, customizable variables, glassmorphic popups, animations, and dark/light themes
JavaScript — Plain vanilla JS, dynamic API requests, LocalStorage syncing, and custom drag-and-drop systems
File Structure
├── index.html              # Landing splash page for the dashboard
├── dashboard.html          # SPA shell loading modular view templates
├── css/
│   └── global.css          # Main layout stylesheet and navigation elements
├── expense/
│   ├── expense.html        # Ledger ledger list html interface
│   └── expense.js          # Simple, comment-free ledger calculator logic
├── github-explorer/
│   ├── index.html          # Profile search interface markup
│   ├── script.js           # API search routines and language chart statistics
│   └── styles.css          # Styles for layout grids and sorter control tabs
├── portfolio/
│   ├── index.html          # Team grid profile card layout
│   └── script.js           # Programmatic names parsing and forms checking
├── kanban/
│   ├── index.html          # Flat Kanban board containers and modal overlays
│   ├── style.css           # Board grid, drag highlight, and card indicator colors
│   └── app.js              # Standalone vanilla JS task controller
├── quiz.js                 # Timed JS trivia engine modules
└── README.md               # Main repository documentation
How to Run
Clone the repository.
Serve the directory using any static web server (such as python3 -m http.server or npx http-server).
Open index.html in your web browser and click Get Started to access the dashboard workspace hubs!

