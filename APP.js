const API_KEY = "https://aistudio.google.com/api-keys";
let quizData = [];
let currentIdx = 0;
let score = 0;
let timer;
let timeLeft;

const setupScreen = document.getElementById('setup-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

document.getElementById('startBtn').addEventListener('click', initQuiz);

async function initQuiz() {
    const topic = document.getElementById('topic').value || "General Knowledge";
    const amount = document.getElementById('numQ').value;
    const diff = document.getElementById('diff').value;

    setupScreen.innerHTML = "<h3>Generating Questions with AI...</h3>";

    [span_9](start_span)
    const prompt = `Generate a ${amount} question quiz about ${topic} at ${diff} level.
    Return ONLY a raw JSON array of objects. Each object must have:
    "question", "options" (array of 4), "answer" (index 0-3), and "explanation".`;

    try {
        const response = await fetch(`https:
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        quizData = JSON.parse(text.replace(/```json|```/g, ""));

        setupScreen.style.display = 'none';
        quizScreen.style.display = 'block';
        startTimer(30); [span_10](start_span)
        showQuestion();
    } catch (error) {
        alert("Error fetching AI questions. Check your API key or connection.");
        location.reload();
    }
}

function showQuestion() {
    if (currentIdx >= quizData.length) return endQuiz();

    const q = quizData[currentIdx];
    document.getElementById('question-text').innerText = q.question;
    const grid = document.getElementById('options-grid');
    grid.innerHTML = "";

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = "control-btn";
        btn.style.width = "100%";
        btn.onclick = () => handleAnswer(index);
        grid.appendChild(btn);
    });
}

function handleAnswer(choice) {
    if (choice === quizData[currentIdx].answer) score++;
    document.getElementById('currentScore').innerText = score;
    currentIdx++;
    showQuestion();
}

function startTimer(seconds) {
    timeLeft = seconds;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            [span_11](start_span)endQuiz();
        }
    }, 1000);
}

function endQuiz() {
    clearInterval(timer);
    quizScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    document.getElementById('final-score').innerText = `You scored ${score} out of ${quizData.length}`;

    saveToHistory();
}

[span_12](start_span)[span_13](start_span)
function saveToHistory() {
    const history = JSON.parse(localStorage.getItem('quiz_history')) || [];
    const entry = {
        topic: document.getElementById('topic').value,
        score: score,
        total: quizData.length,
        date: new Date().toLocaleDateString()
    };
    history.push(entry);
    localStorage.setItem('quiz_history', JSON.stringify(history));
    displayHistory(history);
}

function displayHistory(history) {
    const log = document.getElementById('history-log');
    log.innerHTML = "<h4>Past Attempts:</h4>";
    history.reverse().slice(0, 5).forEach(item => {
        log.innerHTML += `<p><strong>${item.date}</strong>: ${item.topic} - ${item.score}/${item.total}</p>`;
    });
}