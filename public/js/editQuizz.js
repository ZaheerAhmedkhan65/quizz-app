document.querySelectorAll('.dropdown-item[data-id]').forEach(editBtn => {
    editBtn.addEventListener('click', () => {
        let id = editBtn.getAttribute('data-id');
        let quizzContainer = document.getElementById(`quizz_${id}`);
        let quizzTitle = quizzContainer.querySelector('strong[data-title="quizz-title"]');
        let courseId = quizzContainer.getAttribute('course-id');

        // Prevent duplicate form insertion
        if (quizzContainer.querySelector('form')) return;

        // Collect all existing quiz titles
        let existingTitles = Array.from(document.querySelectorAll('strong[data-title="quizz-title"]'))
            .map(title => title.textContent.trim().toLowerCase());

        quizzContainer.innerHTML = `
            <form action="/api/courses/${courseId}/quizzes/${id}" method="post" class="d-flex flex-column w-100">
                <div class="d-flex align-items-center gap-1 justify-content-between w-100">
                    <input type="text" name="title" value="${quizzTitle.textContent}" class="form-control" placeholder="Enter quiz title" required id="editTitle_${id}">
                    <button type="submit" class="btn btn-sm btn-primary">Update</button>
                    <button type="submit" id="cancelBtn_${id}" class="btn btn-sm btn-danger"><i class="bi bi-x-lg"></i></button>
                </div>
                <div id="error-message_${id}" class="text-danger mt-1 error-message"></div>
            </form>
        `;

        let titleInput = document.getElementById(`editTitle_${id}`);
        let errorMessage = document.getElementById(`error-message_${id}`);
        let form = quizzContainer.querySelector('form');

        // Check for duplicate titles on input change
        titleInput.addEventListener('input', () => {
            let newTitle = titleInput.value.trim().toLowerCase();
            if (existingTitles.includes(newTitle) && newTitle !== quizzTitle.textContent.trim().toLowerCase()) {
                errorMessage.textContent = "A quiz with this title already exists!";
            } else {
                errorMessage.textContent = "";
            }
        });

        // Prevent form submission if duplicate exists
        form.addEventListener('submit', (event) => {
            let newTitle = titleInput.value.trim().toLowerCase();
            if (existingTitles.includes(newTitle) && newTitle !== quizzTitle.textContent.trim().toLowerCase()) {
                event.preventDefault();
                errorMessage.textContent = "A quiz with this title already exists!";
            }
        });

        // Handle cancel button click
        document.getElementById(`cancelBtn_${id}`).addEventListener('click', () => {
            window.location.reload();
        });
    });
});
