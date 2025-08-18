
document.addEventListener("DOMContentLoaded", () => {
    const questionForm = document.getElementById("question-form");

    questionForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const questionText = document.getElementById("question-text").value;
        const lectureId = document.getElementById("lecture-id").value;
        const question = { question_text: questionText, lecture_id: lectureId };

        try {
            const response = await fetch(questionForm.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(question),
            });

            const text = await response.text();

            const data = JSON.parse(text);
            if (data.success && data.question) {
                let li = document.createElement("li");
                li.classList.add("list-group-item", "bg-primary-subtle", "rounded-0", "mb-2");
                li.innerHTML = `
          <div id="question_${data.question.id}" class="border border-1 border-dark p-3 d-flex align-items-center justify-content-between">
              <strong>${data.question.index} : ${data.question.question_text}</strong>
          </div> 
          <h5 class="mt-3">Options</h5>
          <ul class="list-group" id="options-container-${data.question.id}" data-option-count="0"></ul>
          
          <!-- Form to create an option -->
          <form class="option-form" action="/api/courses/${data.courseId}/quizzes/${data.quizzId}/questions/${data.question.id}/options" method="post">
              <input type="text" name="option_text" class="form-control mt-3" placeholder="Enter Option text" required>
              <select name="is_correct" class="form-select mt-3">
                  <option value="0">Incorrect</option>
                  <option value="1">Correct</option>
              </select>
              <div class="text-end mb-2">
                  <button type="submit" class="btn btn-sm btn-primary mt-3">Add Option</button>
              </div>
          </form>
      `;

                document.getElementById("questions-container").appendChild(li);
                document.getElementById("questions-container").scrollTop = document.getElementById("questions-container").scrollHeight;

                document.getElementById("question-text").value = "";

                // Attach event listener for options dynamically
                attachOptionFormListener(li.querySelector(".option-form"));
            } else {
                console.error("Invalid response format", data);
            }
        } catch (error) {
            console.error(error);
        }
    });

    // Attach event listener for existing forms
    document.querySelectorAll(".option-form").forEach(attachOptionFormListener);
});

// Function to handle option form submission dynamically
function attachOptionFormListener(form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const optionText = form.querySelector(`input[name="option_text"]`).value;
        const isCorrect = form.querySelector(`select[name="is_correct"]`).value;
        const questionId = form.action.split('/').slice(-3, -1)[0]; // Extract question ID
        const option = { option_text: optionText, is_correct: isCorrect };

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(option),
            });

            const text = await response.text();
            const data = JSON.parse(text);

            if (data.success && data.option) {
                let optionsContainer = document.getElementById(`options-container-${questionId}`);
                let optionCount = parseInt(optionsContainer.getAttribute("data-option-count")) || 0;

                let li = document.createElement("li");
                li.classList.add("list-group-item", "rounded-0", "d-flex", "align-items-center", "gap-1");
                li.innerHTML = `
          <input type="radio" name="question_${questionId}" id="option_${data.option.id}" value="${data.option.id}" class="form-check-input">
          <label for="option_${data.option.id}" class="form-check-label">${data.option.option_text} ${data.option.is_correct ? '(Correct)' : ''}</label>
      `;

                optionsContainer.appendChild(li);
                optionCount++;

                // Update option count in data attribute
                optionsContainer.setAttribute("data-option-count", optionCount);

                // Reset form fields
                form.querySelector(`input[name="option_text"]`).value = "";
                form.querySelector(`select[name="is_correct"]`).value = "0";

                // Remove form if 4 options are added
                if (optionCount >= 4) {
                    form.remove();
                }
            } else {
                console.error("Invalid response format", data);
            }
        } catch (error) {
            console.error(error);
        }
    });
}
