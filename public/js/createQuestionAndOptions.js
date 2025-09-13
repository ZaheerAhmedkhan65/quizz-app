document.addEventListener("DOMContentLoaded", () => {
  const questionForm = document.getElementById("question-form");
  const newQuestionModel = new bootstrap.Modal(document.getElementById("newquestion"));
  // --- CREATE QUESTION ---
  questionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(questionForm);

    try {
      const response = await fetch(questionForm.action, {
        method: questionForm.method,
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      questionForm.reset();
      if (data.success && data.question) {
        const question = data.question;
        newQuestionModel.hide();

        // Build HTML same as in show.ejs
        let li = document.createElement("li");
        li.classList.add("card", "list-group-item", "mb-4", "bg-transparent", "border-0", "px-0");
        li.innerHTML = `
          <div class="card-title py-3 m-0">
            <div class="d-flex align-items-center justify-content-between">
              <div class="w-100 d-flex align-items-center gap-1">
                <strong id="question-index-container-${question.id}">${question.index} :</strong>
                <span data-text="question-text" id="question-text-${question.id}">${question.question_text}</span>
              </div>
              <div class="btn-group dropup">
                <button type="button" class="bg-transparent border-0" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="mdi mdi-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                  <li class="dropdown-item edit-question-btn" data-question-id="${question.id}">Edit</li>
                  <li class="dropdown-item text-danger">
                    <form class="delete-question" data-question-id="${question.id}" 
                      action="https://pdf-files-production.up.railway.app/admin/questions/${question.id}/delete" 
                      method="delete">
                      <button type="submit" class="dropdown-item text-danger p-0">Delete</button>
                    </form>
                  </li>
                </ul>
              </div>
            </div>

            ${question.question_image 
              ? `<div class="mt-2"><img id="question-${question.id}-image" src="${question.question_image}" class="img-fluid rounded" style="max-height:150px;"></div>`
              : ""}
          </div>

          <ul class="list-group" id="options-container-${question.id}"></ul>

          <form class="option-form mt-3"
            action="https://pdf-files-production.up.railway.app/admin/questions/${question.id}/options/create"
            method="post" enctype="multipart/form-data">
            
            <input type="text" name="option_text" class="form-control mt-3" placeholder="Enter Option text" required>
            <select name="is_correct" class="form-select mt-3">
              <option value="0">Incorrect</option>
              <option value="1">Correct</option>
            </select>
            <div class="mt-3">
              <label for="option_image_${question.id}" class="form-label">Upload Option Image</label>
              <input type="file" name="option_image" id="option_image_${question.id}" class="form-control option-image-input" accept="image/*">
            </div>
            <div class="mt-2">
              <img id="option-image-preview-${question.id}" class="img-fluid rounded d-none" style="max-height:80px;" alt="Option Preview">
            </div>
            <div class="text-end mb-2">
              <button type="submit" class="btn btn-sm btn-primary mt-3">Add Option</button>
            </div>
          </form>
        `;

        document.getElementById("questions-container").appendChild(li);
        document.getElementById("questions-container").scrollTop = document.getElementById("questions-container").scrollHeight;

        // Reset form + preview
        questionForm.reset();
        const preview = document.getElementById("image-preview");
        if (preview) preview.remove();

        // Attach option form listener for the new question
        attachOptionFormListener(li.querySelector(".option-form"));
      } else {
        console.error("Invalid response format", data);
      }
    } catch (error) {
      console.error("Error submitting question:", error);
    }
  });

  // Attach listeners for already rendered option forms
  document.querySelectorAll(".option-form").forEach(attachOptionFormListener);
});


// --- CREATE OPTION ---
function attachOptionFormListener(form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const questionId = form.action.split("/").slice(-3, -2)[0]; // extract question ID

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (data.success && data.option) {
        const option = data.option;
        let optionsContainer = document.getElementById(`options-container-${questionId}`);
        let optionCount = optionsContainer.children.length;

        let li = document.createElement("li");
        li.classList.add("list-group-item", "border-0", "px-0", "bg-transparent");
        li.innerHTML = `
          <div class="d-flex align-items-center justify-content-between">
            <div class="w-100 d-flex align-items-center gap-1">
              <input type="radio" name="question_${questionId}" id="option_${option.id}" value="${option.option_text}" class="form-check-input">
              <label for="option_${option.id}" class="w-100">
                ${option.option_text} ${option.is_correct ? "(Correct)" : ""}
              </label>
            </div>
            <div class="btn-group dropup">
              <button type="button" class="bg-transparent border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="mdi mdi-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu">
                <li class="dropdown-item edit-option-btn" data-option-id="${option.id}">Edit</li>
                <li class="dropdown-item text-danger">
                  <form class="delete-option" data-option-id="${option.id}" 
                    action="https://pdf-files-production.up.railway.app/admin/options/${option.id}/delete"
                    method="delete">
                    <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                  </form>
                </li>
              </ul>
            </div>
          </div>

          ${option.option_image 
            ? `<div class="mt-2"><img src="${option.option_image}" class="img-fluid rounded" style="max-height:120px;"></div>` 
            : ""}
        `;

        optionsContainer.appendChild(li);

        // Reset option form
        form.reset();
        const preview = form.querySelector("img[id^='option-image-preview']");
        if (preview) {
          preview.src = "";
          preview.classList.add("d-none");
        }

        // Remove form if 4 options reached
        if (optionsContainer.children.length >= 4) {
          form.remove();
        }
      } else {
        console.error("Invalid response format", data);
      }
    } catch (error) {
      console.error("Error submitting option:", error);
    }
  });
}
