// console.log("sup");
//
// const welcomeUser = document.getElementById("current-user")

const currentTile = document.getElementById("current-tile")
const welcome = document.getElementById("welcome")
const loginForm = document.getElementById("login-form")

let currentUser
let currentGame
let currentRound
//let roundCounter


// 1. User Login/Signup Form
loginForm.addEventListener("submit", e => {
  e.preventDefault()
  const username = loginForm.querySelector("#username").value

  fetch("http://localhost:3000/api/v1/users")
  .then(r => r.json())
  .then(data => {
    currentUser = data.find(user => user.username === username)
    if (currentUser === undefined) {
      createUser(username)
    } else {
      welcome.classList += " ghost"
      welcome.remove()
      postLogin()
    }
  })
})

// Post login for user, play game or view stats
function postLogin() {
  currentTile.innerHTML = `
  <div id="user" class="tile">
    <h1>Welcome ${currentUser.username}</h1>
    <div class="divider"></div>
    <div class="row">
      <div class="col">
        <button type="button" class="btn btn-primary" data-id="${currentUser.id}" data-action="play">Play Game</button>
      </div>
      <div class="col">
        <button type="button" class="btn btn-primary" data-id="${currentUser.id}" data-action="stats">View Stats</button>
      </div>
    </div>
  </div>`
}

// Creates user if new user
function createUser(username) {
  fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ username: username })
  })
  .then(r => r.json())
  .then(data => {
    console.log(data)
    currentUser = data
    welcome.classList += " ghost"
    welcome.remove()
    postLogin()
  })
}

// View Stats For User
function viewStats(user) {
  currentTile.innerHTML = `
  <div id="user" class="tile">
    <h1>${currentUser.username}</h1>
    <div class="divider"></div>
    <div class="row">
      <div class="col-md-8">
        <h2>Stats</h2>
        <div class="divider"></div>
        <h4>Correct Percentage</h4>
        <p>88%</p>
        <h4>Best Category</h4>
        <p>Video Games</p>
        <h4>Worst Category</h4>
        <p>Music</p>
      </div>
      <div class="col-md-4">
        Sidebar buttons
      </div>
    </div>
  </div>`
}


// MAIN APPLICATION CLICK HANDLER
currentTile.addEventListener("click", e => {
  if (e.target.dataset.action === "play") {
    newGame()
  } else if (e.target.dataset.action === "stats") {
    viewStats()
  } else if (e.target.dataset.action === "start_game") {
    addRounds()
  } else if (e.target.dataset.action === "answer") {
    //const answer = e.target.innerText
    //answerQuestion(answer)
    console.log("answer:", e.target.innerText, "id:", e.target.dataset.id);
  }
})


// Game Process 1: Render New Game Form
function newGame() {
  createGame()

  currentTile.innerHTML = `
  <div id="new-game" class="tile">
    <form id="new-game-form" data-action="new_game" data-id="${currentUser.id}">
      <div class="form-group">
        <label for="question-amount">Question Amount</label>
        <select class="form-control" id="question-amount">
          <option>1</option>
          <option>3</option>
          <option>5</option>
          <option>10</option>
          <option>15</option>
        </select>
      </div>
      <div class="form-group">
        <label for="game-category">Category</label>
        <select class="form-control" id="game-category">
          <option value="any">Any Category</option>
          <option value="9">General Knowledge</option>
          <option value="10">Entertainment: Books</option>
          <option value="11">Entertainment: Film</option>
          <option value="12">Entertainment: Music</option>
          <option value="13">Entertainment: Musicals &amp; Theatres</option>
          <option value="14">Entertainment: Television</option>
          <option value="15">Entertainment: Video Games</option>
          <option value="16">Entertainment: Board Games</option>
          <option value="17">Science &amp; Nature</option>
          <option value="18">Science: Computers</option>
          <option value="19">Science: Mathematics</option>
          <option value="20">Mythology</option>
          <option value="21">Sports</option>
          <option value="22">Geography</option>
          <option value="23">History</option>
          <option value="24">Politics</option>
          <option value="25">Art</option>
          <option value="26">Celebrities</option>
          <option value="27">Animals</option>
          <option value="28">Vehicles</option>
          <option value="29">Entertainment: Comics</option>
          <option value="30">Science: Gadgets</option>
          <option value="31">Entertainment: Japanese Anime &amp; Manga</option>
          <option value="32">Entertainment: Cartoon &amp; Animations</option>
        </select>
      </div>
      <button type="button" data-action="start_game">Start Game</button>
    </form>
  </div>`
}

// Game Process 2: Take new game form values for create rounds for game
function addRounds() {
  const questionAmount = currentTile.querySelector("#question-amount").value
  const gameCategory = currentTile.querySelector("#game-category").value

  fetch(`https://opentdb.com/api.php?amount=${questionAmount}&category=${gameCategory}&type=multiple`)
  .then(r => r.json())
  .then(data => {
    //createRounds(data.results)
    const questionData = data.results
    questionData.forEach(question => {
      createRound(question)
    })
  })
  .then(loadGame)
}

// Create Game in AR, set currentGame variable
function createGame() {
  fetch("http://localhost:3000/api/v1/games", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ user_id: currentUser.id})
  })
  .then(r => r.json())
  .then(data => {
    currentGame = data
  })
}

function createRound(question) {
  console.log(question.question)
  fetch("http://localhost:3000/api/v1/rounds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      game_id: currentGame.id,
      category: question.category,
      difficulty: question.difficulty,
      question: question.question,
      correct_answer: question.correct_answer,
      incorrect_answer_1: question.incorrect_answers[0],
      incorrect_answer_2: question.incorrect_answers[1],
      incorrect_answer_3: question.incorrect_answers[2],
      correct: false
    })
  })
}

// Game Process 3: Load Game
function loadGame() {
  console.log("THIS WILL LOAD SERIALIZED DATA");
}

// Game Process 4: User can interact with game
function startGame() {
  currentTile.innerHTML = ""
  //roundCounter = [...currentGame.questions]
  currentGame.questions.forEach(question => {
    return currentTile.innerHTML += renderQuestion(question)
  })
}

function renderQuestion(question) {
  let questionAnswers = []
  questionAnswers.push(question.correct_answer)
  question.incorrect_answers.forEach(answer => questionAnswers.push(answer))
  shuffle(questionAnswers)
  return `
    <div class="question">
      <h3>${question.question}</h3>
      <ul>
        <button type="button" data-id="${question.id}" data-action="answer">${question.correct_answer}</button>
        <button type="button" data-id="${question.id}" data-action="answer">${question.incorrect_answers[0]}</button>
        <button type="button" data-id="${question.id}" data-action="answer">${question.incorrect_answers[1]}</button>
        <button type="button" data-id="${question.id}" data-action="answer">${question.incorrect_answers[2]}</button>
      </ul>
    </div>`
}

// Fisher-Yates Shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function answerQuestion(answer) {
  //console.log("answer:", answer, "id:")
}
