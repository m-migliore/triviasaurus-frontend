const currentTile = document.getElementById("current-tile")
const welcome = document.getElementById("welcome")
const loginForm = document.getElementById("login-form")

let currentUser
let currentGame
let gameQuestions = []
let streak = 0
let roundCounter = 1


// MAIN APPLICATION CLICK HANDLER
currentTile.addEventListener("click", e => {
  if (e.target.dataset.action === "play") {
    newGame()
  } else if (e.target.dataset.action === "stats") {
    viewStats(e.target.dataset.user_id)
  } else if (e.target.dataset.action === "start_game") {
    e.target.setAttribute("disabled", true)
    loadGame()
  } else if (e.target.dataset.action === "answer") {
    checkAnswer(e.target.dataset.id, e.target.innerText)
  } else if (e.target.dataset.action === "leaderboard") {
    viewLeaderboard("elo")
  } else if (e.target.dataset.action === "switch") {
    viewLeaderboard(e.target.dataset.leaderboard)
  }
})

// 1. User Login/Signup Form
loginForm.addEventListener("submit", e => {
  e.preventDefault()
  const username = loginForm.querySelector("#username").value
  const error = loginForm.querySelector("#error")

  if (username === "") {
    error.innerText = "Please enter a username"
  } else {
    fetch("http://localhost:3000/api/v1/users")
    .then(r => r.json())
    .then(data => {
      currentUser = data.find(user => user.username === username)
      if (currentUser === undefined) {
        createUser(username)
      } else {
        postLogin()
      }
    })
  }
})


// Post login for user, play game or view stats
function postLogin() {
  currentTile.innerHTML = `
  <div id="user" class="tile">
    <img src="img/dino.png" alt="Dino" class="dino animated jello">
    <h1>Welcome ${currentUser.username}</h1>
    <div class="divider"></div>
    <div class="row">
      <div class="col">
        <button type="button" class="btn btn-primary" data-user_id="${currentUser.id}" data-action="stats">View Stats</button>
      </div>
      <div class="col">
        <button type="button" class="btn btn-primary" data-action="play">Play Game</button>
      </div>
      <div class="col">
        <button type="button" class="btn btn-primary" data-action="leaderboard">View Leaderboard</button>
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
    currentUser = data
    postLogin()
  })
}

// View Stats For User
function viewStats(userId) {
  fetch(`http://localhost:3000/api/v1/users/${userId}/stats`)
  .then(r => r.json())
  .then(data => {
    const categoryStats = data.categoryStats
    const playedCategories = Object.keys(categoryStats)
    const categoryBreakdown = playedCategories.map(category => renderCategoryStats(category, categoryStats)).join("")

    currentTile.innerHTML = `
      <div id="user" class="tile">
        <img src="img/dino.png" alt="Dino" class="dino animated jello">
        <h1>${data.username}'s Stats</h1>
        <div class="divider"></div>
        <div class="row">
          <div class="col">
            <button type="button" class="btn btn-primary" data-action="play">Play Game</button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-primary" data-action="leaderboard">View Leaderboard</button>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="stat-box main-total">
              <h2>Total Stats</h2>
              <div class="divider"></div>
              <ul>
                <li><span>Wins:</span> ${data.totalStats.wins}</li>
                <li><span>Total:</span> ${data.totalStats.total}</li>
                <li><span>Percentage:</span> ${data.totalStats.winPercentage}%</li>
                <li><span>ELO:</span> ${data.totalStats.elo}</li>
              </ul>
            </div>

            <div class="stat-box">
              <h4>Easy Breakdown</h4>
              <ul>
                <li><span>Wins:</span> ${data.totalStats.easyWins}</li>
                <li><span>Total:</span> ${data.totalStats.easyTotal}</li>
                <li><span>Percentage:</span> ${data.totalStats.easyPercentage}%</li>
              </ul>
            </div>

            <div class="stat-box">
              <h4>Medium Breakdown</h4>
              <ul>
                <li><span>Wins:</span> ${data.totalStats.mediumWins}</li>
                <li><span>Total:</span> ${data.totalStats.mediumTotal}</li>
                <li><span>Percentage:</span> ${data.totalStats.mediumPercentage}%</li>
              </ul>
            </div>

            <div class="stat-box">
              <h4>Hard Breakdown</h4>
              <ul>
                <li><span>Wins:</span> ${data.totalStats.hardWins}</li>
                <li><span>Total:</span> ${data.totalStats.hardTotal}</li>
                <li><span>Percentage:</span> ${data.totalStats.hardPercentage}%</li>
              </ul>
            </div>

            <div>
              <h2>Category Stats</h2>
              <div class="divider"></div>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Wins</th>
                    <th scope="col">Total</th>
                    <th scope="col">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoryBreakdown}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`
  })

}

//takes a category from playedCategories, gets values from categoryStats
// function renderCategoryStats(category, categoryStats) {
//   return `
//     <div class="stat-box">
//       <h4>${category}</h4>
//       <ul>
//         <li><span>Wins:</span> ${categoryStats[category].wins}</li>
//         <li><span>Total:</span> ${categoryStats[category].total}</li>
//         <li><span>Percentage:</span> ${categoryStats[category].winPercentage}%</li>
//       </ul>
//     </div>`
// }

function renderCategoryStats(category, categoryStats) {
  return `
    <tr>
      <td>${category}</td>
      <td>${categoryStats[category].wins}</td>
      <td>${categoryStats[category].total}</td>
      <td>${categoryStats[category].winPercentage}%</td>
    </tr>`
}



// Game Process 1: Render New Game Form
function newGame() {
  roundCounter = 1
  streak = 0
  currentTile.innerHTML = `
  <div id="new-game" class="tile">
    <img src="img/dino.png" alt="Dino" class="dino animated jello">
    <h1>New Game</h1>
    <div class="divider"></div>
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
        <label for="game-difficulty">Difficulty</label>
        <select class="form-control" id="game-difficulty">
          <option value="any">Any Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
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
      <button type="button" data-action="start_game" class="btn btn-primary">Start Game</button>
    </form>
  </div>`
}

function loadGame() {
  createGame()
  addRounds()
}

// Game Process 2: Take new game form values for create rounds for game
function addRounds() {
  const questionAmount = currentTile.querySelector("#question-amount").value
  const gameDifficultyValue = currentTile.querySelector("#game-difficulty").value
  let gameDifficulty
  const gameCategoryValue = currentTile.querySelector("#game-category").value
  let gameCategory

  if (gameDifficultyValue === "any") {
    gameDifficulty = ""
  } else {
    gameDifficulty = `&difficulty=${gameDifficultyValue}`
  }

  if (gameCategoryValue === "any") {
    gameCategory = ""
  } else {
    gameCategory = `&category=${gameCategoryValue}`
  }

  fetch(`https://opentdb.com/api.php?amount=${questionAmount}&type=multiple${gameDifficulty}${gameCategory}`)
  .then(r => r.json())
  .then(data => {
    const questionData = data.results
    currentTile.innerHTML = ""
    questionData.forEach(question => {
      gameQuestions.push(question)
    })
    return gameQuestions
  })
  .then(gameQuestions => {
    if (gameQuestions.length > 0) {
      loadRound()
    } else {
      noQuestions()
    }
  })
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
  currentTile.innerHTML = ""

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
  .then(r => r.json())
  .then(data => {
    currentTile.innerHTML += renderQuestion(data, roundCounter)
    roundCounter++
  })
}

// Game Process 3: Load next round
function loadRound() {
  currentTile.innerHTML = ""
  if (gameQuestions.length > 0) {
    createRound( gameQuestions.pop() )
  } else {
    gameResults()
  }
}


// Game Process 4: Answer Questions
function checkAnswer(roundId, answer) {
  const question = currentTile.querySelector(`.question[data-id="${roundId}"]`)
  fetch(`http://localhost:3000/api/v1/rounds/${roundId}`)
  .then(r => r.json())
  .then(data => {
    if (data.correct_answer.replace(/ /g,'') === answer.replace(/ /g,'')) {
      answerQuestion(roundId, answer, true)
      streak++
      console.log(streak)
    } else {
      answerQuestion(roundId, answer)
    }
  })
}


// Game Process 5: View results
function gameResults() {
  fetch(`http://localhost:3000/api/v1/games/${currentGame.id}`)
  .then(r => r.json())
  .then(data => {
    const correctTotal = data.rounds.filter(gameRound => gameRound.correct)
    const answeredQuestions = data.rounds.map(question => renderAnsweredQuestion(question)).join("")
    currentTile.innerHTML = `
    <div id="results" class="tile">
      <img src="img/dino.png" alt="Dino" class="dino animated jello">
      <h1>Game Results</h1>
      <div class="divider"></div>
      <h2 class="score animated jackInTheBox">${Math.round((correctTotal.length/data.rounds.length) * 100)}<span>%</span></h2>
      <div class="row">
        <div class="col">
          <button type="button" class="btn btn-primary" data-user_id="${currentUser.id}" data-action="stats">View Stats</button>
        </div>
        <div class="col">
          <button type="button" class="btn btn-primary" data-action="play">Play Game</button>
        </div>
        <div class="col">
          <button type="button" class="btn btn-primary" data-action="leaderboard">View Leaderboard</button>
        </div>
      </div>
      ${answeredQuestions}
    </div>`

  })
}

//specify true if correct when checking answer
function answerQuestion(roundId, answer, correct=false) {
  fetch(`http://localhost:3000/api/v1/rounds/${roundId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      answer: answer,
      correct: correct
    })
  })
  .then(r => r.json())
  .then(data => {
    const question = currentTile.querySelector(`.question[data-id="${data.id}"]`)
    loadRound()
  })
}

// renders question during game
function renderQuestion(question, roundCounter) {
  let questionAnswers = []
  questionAnswers.push(question.correct_answer)
  questionAnswers.push(question.incorrect_answer_1)
  questionAnswers.push(question.incorrect_answer_2)
  questionAnswers.push(question.incorrect_answer_3)
  shuffle(questionAnswers)
  return `
    <div class="question" data-id="${question.id}">
      <img src="img/dino.png" alt="Dino" class="dino animated jello">
      <h1>Question ${roundCounter}</h1>
      <div class="divider"></div>
      <h3>${question.question}</h3>
      <ul>
        <li data-game_id="${question.game_id}" data-id="${question.id}" data-action="answer">${questionAnswers[0]}</li>
        <li data-game_id="${question.game_id}" data-id="${question.id}" data-action="answer">${questionAnswers[1]}</li>
        <li data-game_id="${question.game_id}" data-id="${question.id}" data-action="answer">${questionAnswers[2]}</li>
        <li data-game_id="${question.game_id}" data-id="${question.id}" data-action="answer">${questionAnswers[3]}</li>
      </ul>
    </div>`
}

// render question for gameResults()
function renderAnsweredQuestion(question) {
  if (question.correct) {
    return `
      <div class="question correct" data-id="${question.id}">
        <h3>${question.question}</h3>
        <h4>Correct Answer</h4>
        <p>${question.correct_answer}</p>
        <h4>Difficulty</h4>
        <p>${question.difficulty}</p>
      </div>`
  } else {
    return `
      <div class="question incorrect" data-id="${question.id}">
        <h3>${question.question}</h3>
        <h4>Your Answer</h4>
        <p>${question.answer}</p>
        <h4>Correct Answer</h4>
        <p>${question.correct_answer}</p>
        <h4>Difficulty</h4>
        <p>${question.difficulty}</p>
      </div>`
  }
}

// View Leaderboard
function viewLeaderboard(stat) {
  fetch(`http://localhost:3000/api/v1/users/leaderboard/${stat}`)
  .then(r => r.json())
  .then(data => {
    const userRows = data.map(user => renderLeaderboardRow(user)).join("")

    currentTile.innerHTML = `
      <div id="leaderboard" class="tile">
        <img src="img/dino.png" alt="Dino" class="dino animated jello">
        <h1>Leaderboard</h1>
        <div class="divider"></div>

        <div class="row">
          <div class="col">
            <button type="button" class="btn btn-primary" data-user_id="${currentUser.id}" data-action="stats">View Stats</button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-primary" data-action="play">Play Game</button>
          </div>
        </div>

        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Username</th>
              <th scope="col" data-action="switch" data-leaderboard="wins">Wins</th>
              <th scope="col" data-action="switch" data-leaderboard="total">Total</th>
              <th scope="col" data-action="switch" data-leaderboard="percentage">Percentage</th>
              <th scope="col" data-action="switch" data-leaderboard="elo">ELO</th>
            </tr>
          </thead>
          <tbody>
            ${userRows}
          </tbody>
        </table>
      </div>`

      let dino = document.querySelector("dino")
      dino.classList.remove("infinite")
  })
}

function renderLeaderboardRow(user) {
  return `
    <tr>
      <td><span class="user-link" data-action="stats" data-user_id="${user.id}">${user.username}</span></td>
      <td>${user.wins}</td>
      <td>${user.total}</td>
      <td>${user.winPercentage}%</td>
      <td>${user.elo}</td>
    </tr>`
}

// If API does not return any questions for a game
function noQuestions() {
  currentTile.innerHTML = `
  <div id="extinct" class="tile">
    <img src="img/dino.png" alt="Dino" class="dino animated jello">
    <h1>Uh Oh</h1>
    <div class="divider"></div>
    <p>The questions for this game are extinct please try again.</p>
    <div class="row">
      <div class="col">
        <button type="button" class="btn btn-primary" data-user_id="${currentUser.id}" data-action="stats">View Stats</button>
      </div>
      <div class="col">
        <button type="button" class="btn btn-primary" data-action="play">Play Game</button>
      </div>
      <div class="col">
        <button type="button" class="btn btn-primary" data-action="leaderboard">View Leaderboard</button>
      </div>
    </div>
  </div>`
}

// Fisher-Yates Shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
