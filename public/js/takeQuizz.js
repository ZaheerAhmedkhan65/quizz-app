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
            if (totalTime <= 0 ) {
                clearInterval(timerInterval);
                showNotification("Time is up! Submitting the quiz...");
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
            user_id: userId,
            course_id: courseId,
            quiz_id: quizzId,
            total_marks: quizData.length,
            score: results.correctAnswers,
            answers: selectedAnswers
        };
    
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
    
    if(quizData.length == 0) {
        document.body.innerHTML = "";
        document.body.classList.add("d-flex","align-items-center","justify-content-center","vh-100");
        document.body.innerHTML = `
        <div class="border border-2 border-dark" style="height: 50vh;">
            <div class="p-2">
                <h1 class="text-center">No questions found for this quiz.</h1>
                <p class="text-center">Please create some questions first and try again.</p>
            </div>
            <div class="d-flex justify-content-center">
                <a href="/api/courses/${courseId}/quizzes/${quizzId}" class="btn btn-primary">Go Back</a>
            </div>
        </div>
        `;
        // window.location.href = "/api/courses/"+courseId+"/quizzes/"+quizzId;
    }else{
        startTimer();
    }
    

    function updateQuestionNavigation() {
        questionsNavigationContainer.innerHTML = "";
        quizData.forEach((question, index) => {
            let questionLink = document.createElement("div");
            questionLink.classList.add("btn", "rounded-circle", "btn-primary");
    
            // Add 'btn-warning' to the current question
            if (index === currentQuestionIndex) {
                questionLink.classList.add("btn-warning");
            }
    
            // Add 'btn-success' if the question has a selected answer
            if (selectedAnswers[question.id]) {
                questionLink.classList.add("btn-success");
            }
    
            questionLink.innerText = index + 1;
            questionLink.addEventListener("click", () => {
                currentQuestionIndex = index;
                loadQuestion();
            });
    
            questionsNavigationContainer.appendChild(questionLink);
        });
    }
    
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
            listItem.classList.add("list-group-item", "p-3", "rounded-0", "d-flex", "align-items-center", "gap-1");
    
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
                updateQuestionNavigation(); // Update navigation buttons when an answer is selected
            });
    
            let label = document.createElement("label");
            label.setAttribute("for", "option_" + option.id);
            label.innerText = option.option_text;
    
            listItem.appendChild(radioInput);
            listItem.appendChild(label);
            optionsContainer.appendChild(listItem);
        });
    
        updateQuestionNavigation(); // Update navigation UI after loading question
    }
    

    nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            if (confirm("Are you sure you want to submit the quiz?")) {
                submitQuiz();
            };
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
