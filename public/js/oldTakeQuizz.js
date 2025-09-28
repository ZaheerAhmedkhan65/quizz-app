document.addEventListener("DOMContentLoaded", function () {
    let currentQuestionIndex = 0;
    let selectedAnswers = {};
    let backBtn = document.getElementById("back-btn");
    let nextBtn = document.getElementById("next-btn");
    let questionIndexContainer = document.getElementById("question-index");
    let questionsNavigationContainer = document.querySelector("#questions-navigation-container");
    let quizForm = document.getElementById("quiz-form");

    let totalTime = questions.length * 60;
    let timerInterval;

    const STORAGE_KEY = `quiz_state_${courseId}_${lectureId || "course"}`;

    // 🔹 Restore state from localStorage
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        try {
            const { answers, index, timeLeft } = JSON.parse(savedState);
            selectedAnswers = answers || {};
            currentQuestionIndex = index || 0;
            totalTime = timeLeft > 0 ? timeLeft : totalTime;

            // 🔹 Recreate hidden inputs for answers so form submits correctly
            for (const qId in selectedAnswers) {
                let hiddenInput = document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.name = `answers[${qId}]`;
                hiddenInput.value = selectedAnswers[qId];
                quizForm.appendChild(hiddenInput);
            }
        } catch (e) {
            console.error("Failed to parse saved state", e);
        }
    }

    function calculateTime() {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            if (totalTime <= 0) {
                clearInterval(timerInterval);
                clearState();
                alert("Time is up! Submitting the quiz...");
                submitQuiz();
                return;
            }
            totalTime--;
            document.getElementById("timer").textContent = calculateTime();
            saveState(); // 🔹 auto-save time too
        }, 1000);
    }

    function stopTimer() { clearInterval(timerInterval); }

    function saveState() {
        const state = {
            answers: selectedAnswers,
            index: currentQuestionIndex,
            timeLeft: totalTime,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function clearState() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function updateQuestionNavigation() {
        questionsNavigationContainer.innerHTML = "";
        questions.forEach((question, index) => {
            let questionLink = document.createElement("div");
            questionLink.classList.add("btn", "rounded-circle", "btn-primary");

            if (index === currentQuestionIndex) {
                questionLink.classList.add("btn-warning");
            }
            if (selectedAnswers[question.id]) {
                questionLink.classList.add("btn-success");
            }

            questionLink.innerText = index + 1;
            questionLink.addEventListener("click", () => {
                currentQuestionIndex = index;
                loadQuestion();
                saveState(); // 🔹 save progress
            });

            questionsNavigationContainer.appendChild(questionLink);
        });
    }

    function loadQuestion() {
        let question = questions[currentQuestionIndex];
        document.getElementById("question-text").innerText = question.question_text;

        let optionsContainer = document.getElementById("options-container");
        optionsContainer.innerHTML = "";

        questionIndexContainer.innerText =
            "Question " + (currentQuestionIndex + 1) + " of " + questions.length;

        backBtn.disabled = currentQuestionIndex === 0;

        if (currentQuestionIndex < questions.length - 1) {
            nextBtn.textContent = "Next";
            nextBtn.disabled = false;
        } else {
            nextBtn.textContent = "Submit";
            nextBtn.disabled = !allQuestionsAnswered();
        }

        question.options.forEach((option) => {
            let listItem = document.createElement("li");
            listItem.classList.add(
                "list-group-item",
                "p-3",
                "rounded-0",
                "d-flex",
                "align-items-center",
                "gap-1"
            );

            let radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = `question_${question.id}`;
            radioInput.id = "option_" + option.id;
            radioInput.value = option.id;
            radioInput.classList.add("form-check-input");

            // 🔹 Restore checked state if previously selected
            if (selectedAnswers[question.id] == option.id) {
                radioInput.checked = true;
            }

            radioInput.addEventListener("change", () => {
                selectedAnswers[question.id] = option.id;

                // 🔹 update or create hidden input
                let existingHidden = quizForm.querySelector(`input[name="answers[${question.id}]"]`);
                if (existingHidden) {
                    existingHidden.value = option.id;
                } else {
                    let hiddenInput = document.createElement("input");
                    hiddenInput.type = "hidden";
                    hiddenInput.name = `answers[${question.id}]`;
                    hiddenInput.value = option.id;
                    quizForm.appendChild(hiddenInput);
                }

                saveState();
                updateQuestionNavigation();

                if (allQuestionsAnswered()) {
                    nextBtn.disabled = false;
                }
                if (currentQuestionIndex === questions.length - 1) {
                    nextBtn.disabled = !allQuestionsAnswered();
                }
            });

            let label = document.createElement("label");
            label.setAttribute("for", "option_" + option.id);
            label.innerText = option.option_text;

            listItem.appendChild(radioInput);
            listItem.appendChild(label);
            optionsContainer.appendChild(listItem);
        });

        updateQuestionNavigation();
    }

    function allQuestionsAnswered() {
        return questions.every((question) => selectedAnswers[question.id]);
    }

    nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
            saveState();
        } else {
            if (allQuestionsAnswered() && confirm("Are you sure you want to submit the quiz?")) {
                submitQuiz();
            }
        }
    });

    backBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
            saveState();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                loadQuestion();
                saveState();
            }
        } else if (event.key === "ArrowLeft") {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                loadQuestion();
                saveState();
            }
        }
    });

    function submitQuiz() {
        stopTimer();
        clearState(); // 🔹 remove saved state
        quizForm.submit(); // native form submit
    }

    // Initial load
    loadQuestion();
    updateQuestionNavigation();
    document.getElementById("timer").textContent = calculateTime();
    startTimer();
});
