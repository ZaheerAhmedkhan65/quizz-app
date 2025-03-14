document.addEventListener("DOMContentLoaded", function () {
    let quizData = JSON.parse(document.getElementById("quiz-data").textContent);
    let currentQuestionIndex = 0;
    let selectedAnswers = {};
    let backBtn = document.getElementById("back-btn");
    let nextBtn = document.getElementById("next-btn");
    let questionIndexContainer = document.getElementById("question-index");
    let questionsNavigationContainer = document.querySelector("#questions-navigation-container");
    let totalTime = quizData.length * 60;
    let timerInterval;
    console.log(courseId);
    console.log(quizzId);
    console.log(userId);
    function calculateTime() {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;
        return `${minutes} : ${seconds} s`;
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            if (totalTime <= 0) {
                clearInterval(timerInterval);
                alert("Time is up! Submitting the quiz...");
                submitQuiz();
                return;
            }
            totalTime--;
            document.getElementById("timer").textContent = calculateTime();
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function calculateResults() {
        let correctAnswers = 0;
        let totalQuestions = quizData.length;

        quizData.forEach((question) => {
            let selectedOptionId = selectedAnswers[question.id];

            if (selectedOptionId) {
                let selectedOption = question.options.find(option => option.id == selectedOptionId);
                if (selectedOption && selectedOption.is_correct) {
                    correctAnswers++;
                }
            }
        });

        return {
            correctAnswers,
            totalQuestions,
            score: ((correctAnswers / totalQuestions) * 100).toFixed(2) + "%"
        };
    }

    function submitQuiz() {
        stopTimer();
        let results = calculateResults();
        alert(`Quiz Completed!\nCorrect Answers: ${results.correctAnswers}/${results.totalQuestions}\nScore: ${results.score}`);
    
        let quizResultsData = {
            user_id: userId,   // Make sure userId, courseId, quizzId are defined globally
            course_id: courseId,
            quiz_id: quizzId,
            total_marks: quizData.length, // Assuming each question is 1 mark
            score: results.correctAnswers, // Number of correct answers
            answers: selectedAnswers // Object { question_id: selected_option_id }
        };
    
        console.log("Sending quiz results:", quizResultsData); // Debugging log
    
        // Send data to the server
        fetch("/api/courses/" + courseId + "/quizzes/" + quizzId + "/quiz_results", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(quizResultsData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert(`Quiz results saved successfully!\nCorrect Answers: ${results.correctAnswers}/${results.totalQuestions}\nScore: ${results.score}`);
                window.location.href = "/api/courses/"+courseId+"/quizzes/"+quizzId;
            } else {
                alert("Error saving results. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("An error occurred while submitting the quiz. Please try again.");
        });
    }

    startTimer();

    function loadQuestion() {
        let question = quizData[currentQuestionIndex];
        document.getElementById("question-text").innerText = question.question_text;

        let optionsContainer = document.getElementById("options-container");
        optionsContainer.innerHTML = "";

        questionIndexContainer.innerText = "Question " + (currentQuestionIndex + 1) + " of " + quizData.length;

        backBtn.disabled = currentQuestionIndex === 0;
        nextBtn.textContent = currentQuestionIndex < quizData.length - 1 ? "Next" : "Submit";

        question.options.forEach(option => {
            let listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "p-3", "rounded-0", "d-flex","align-items-center", "gap-1",);

            let radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = "question_" + question.id;
            radioInput.id = "option_" + option.id;
            radioInput.value = option.id;

            if (selectedAnswers[question.id] == option.id) {
                radioInput.checked = true;
            }

            radioInput.addEventListener("change", () => {
                selectedAnswers[question.id] = option.id;
            });

            let label = document.createElement("label");
            label.setAttribute("for", "option_" + option.id);
            label.innerText = option.option_text;

            listItem.appendChild(radioInput);
            listItem.appendChild(label);
            optionsContainer.appendChild(listItem);
        });
    }

    nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            submitQuiz();
        }
    });

    backBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    });

    loadQuestion();

    questionsNavigationContainer.innerHTML = "";
    quizData.forEach((question, index) => {
        let questionLink = document.createElement("div");
        questionLink.classList.add("btn", "rounded-circle", "btn-primary");
        questionLink.innerText = (index + 1);
        questionLink.addEventListener("click", () => {
            currentQuestionIndex = index;
            loadQuestion();
        });
        questionsNavigationContainer.appendChild(questionLink);
    });
});
