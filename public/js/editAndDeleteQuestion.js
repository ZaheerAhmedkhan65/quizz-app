document.querySelectorAll(".delete-question").forEach(form => {
    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent full-page reload

        const questionId = this.getAttribute("data-question-id");
        const actionUrl = this.getAttribute("action"); // Get API endpoint
        
        const response = await fetch(actionUrl, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: questionId })
        });

        if (response.ok) {
            document.getElementById(`question_${questionId}`).closest("li").remove(); // Correct selector
        } else {
            const result = await response.json();
            alert("Error: " + result.message); // Show error if deletion fails
        }
    });
});


document.querySelectorAll(".edit-question-btn").forEach(button => {
    button.addEventListener("click", function () {
        const questionId = this.getAttribute("data-question-id");
        const questionTextElement = document.getElementById(`question-text-${questionId}`);
        const questionIndexContainer = document.querySelector(`#question-index-container-${questionId}`);
        // Check if an input field already exists
        if (questionTextElement.querySelector("input")) return;

        questionTextElement.classList.add("d-flex","align-itms-center","gap-1","justify-content-between");
        questionTextElement.style.width =  `calc(100% - ${questionIndexContainer.clientWidth*2}px )`
 
        // Get the current text
        const currentText = questionTextElement.textContent.trim();
        
        // Replace text with an input field
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.value = currentText;
        inputField.classList.add("form-control", "form-control-sm");
        
        // Add save button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Update";
        saveButton.classList.add("btn", "btn-success", "btn-sm", "ms-2");
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("btn", "btn-secondary", "btn-sm", "ms-2");
        
        // Replace span content with input and button
        questionTextElement.innerHTML = "";
        questionTextElement.appendChild(inputField);
        questionTextElement.appendChild(saveButton);
        questionTextElement.appendChild(cancelButton);

        // Focus on input field
        inputField.focus();

        // Handle Save Click
        saveButton.addEventListener("click", async () => {
            const newText = inputField.value.trim();
            if (!newText) return alert("Question text cannot be empty!");

            // Send update request
            const response = await fetch(`/api/courses/questions/${questionId}/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question_text: newText, question_id: questionId })
            });

            if (response.ok) {
                // Update UI
                questionTextElement.innerHTML = `${newText}`;
            } else {
                alert("Error updating question.");
            }
        });

        cancelButton.addEventListener("click",()=>{
            questionTextElement.innerHTML = `${currentText}`;
        });

        // Handle Enter Key
        inputField.addEventListener("keypress", async (event) => {
            if (event.key === "Enter") {
                saveButton.click(); // Trigger Save
            }
        });
    });
});

