document.addEventListener("DOMContentLoaded", function () {
    let currentQuestionIndex = 0;
    let selectedAnswers = {};
    let nextBtn = document.getElementById("next-btn");
    let questionIndexContainer = document.getElementById("question-index");
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
            console.log(currentQuestionIndex)
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

    function loadQuestion() {
        let question = questions[currentQuestionIndex];
        document.getElementById("question-text").innerHTML = `${question.question_text}`;

        let optionsContainer = document.getElementById("options-container");
        optionsContainer.innerHTML = "";

        questionIndexContainer.innerText =
            "Question " + (currentQuestionIndex + 1) + " of " + questions.length;

        // Default disable Next until user selects
        nextBtn.disabled = true;

        // If last question, change Next to Submit
        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.textContent = "Submit";
        } else {
            nextBtn.textContent = "Save & Load Next Question";
        }

       question.options.forEach((option) => {
    let listItem = document.createElement("li");
    listItem.classList.add(
        "list-group-item",
        "p-3",
        "rounded-0",
        "d-flex",
        "align-items-start",
        "gap-2"
    );

    let radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = `question_${question.id}`;
    radioInput.id = "option_" + option.id;
    radioInput.value = option.id;
    radioInput.style.width = "25px";
    radioInput.style.height = "25px";
    radioInput.classList.add("form-check-input", "mt-2");

    // 🔹 Restore checked state if previously selected
    if (selectedAnswers[question.id] == option.id) {
        radioInput.checked = true;
        nextBtn.disabled = false; // allow Next if already answered
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
        nextBtn.disabled = false; // enable Next after selection
    });

    // ✅ Use a textarea only for option text (resizable, readonly)
    let optionTextArea = document.createElement("textarea");
    optionTextArea.rows = 1;
    optionTextArea.readOnly = true;
    optionTextArea.value = option.option_text;
    optionTextArea.classList.add("form-control", "flex-grow-1");

    listItem.appendChild(radioInput);
    listItem.appendChild(optionTextArea);
    optionsContainer.appendChild(listItem);
});

    }

    nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
            saveState();
        } else {
            if (confirm("Are you sure you want to submit the quiz?")) {
                submitQuiz();
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
    document.getElementById("timer").textContent = calculateTime();
    startTimer();
});
