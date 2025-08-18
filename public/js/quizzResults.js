document.addEventListener("DOMContentLoaded", function () {
    fetchQuizzResults();
});

function fetchQuizzResults() {
    fetch(`/courses/${courseId}/quizzes/${quizzId}/get-quizz-results`)
        .then(response => response.json())
        .then(data => {
            displayQuizzResults(data);
        })
        .catch(error => console.error('Error fetching quizz results:', error));
}

function displayQuizzResults(data) {
    const { quizResults, questions, answers } = data;
    const quizResultsContainer = document.getElementById('quiz-results-container');
    const resultsContainer = document.getElementById('results-container');
    const resultsTableBody = document.getElementById('results-table-body');
    const graphContainer = document.getElementById('graph-container');

    if (!quizResults || quizResults.length === 0) {
        quizResultsContainer.innerHTML = '<p class="text-center py-4">No quiz results available yet.</p>';
        if (graphContainer) graphContainer.remove();
        return;
    }
     // Update results table
     resultsTableBody.innerHTML = '';
    if (quizResults && quizResults.length > 0) {
        renderQuizResultsGraph(quizResults);
    }
   
    quizResults.forEach((result, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.total_marks}</td>
            <td>${result.score}</td>
            <td>${((result.score / result.total_marks) * 100).toFixed(2)}%</td>
        `;
        resultsTableBody.appendChild(row);
    });

    // Update detailed results
    resultsContainer.innerHTML = '';
    quizResults.forEach((result, attemptIndex) => {
        const attemptCard = document.createElement('div');
        attemptCard.className = 'card mb-4';

        attemptCard.innerHTML = `
            <div class="card-header">
                <h5 class="mt-3">Attempt ${attemptIndex + 1}</h5>
            </div>
            <div class="card-body">
                ${Object.entries(result.answers).map(([questionId, answerId], index) => {
            const questionObj = questions.find(q => q.id == questionId);
            const answerObj = answers.find(a => a.id == answerId);

            return `
                        <li class="list-group-item bg-transparent">
                            <strong>#${index + 1} : ${questionObj ? questionObj.question_text : "Question not found"}</strong><br>
                            ${answerObj ?
                    `<span class="${answerObj.is_correct ? 'text-success' : 'text-danger'}">
                                    ${answerObj.is_correct ? '✔️' : '❌'}${answerObj.option_text}
                                </span>`
                    :
                    '<strong>Selected Answer:</strong> Not Answered'
                }
                        </li>
                    `;
        }).join('')}
            </div>
        `;

        resultsContainer.appendChild(attemptCard);
    });

    // Adjust container height if needed
    const resultsTable = document.getElementById('results-table');
    if (quizResults.length > 0) {
        resultsContainer.style.height = `calc(80vh - ${resultsTable.offsetHeight}px)`;
    }
}