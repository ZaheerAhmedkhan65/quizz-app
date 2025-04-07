document.querySelectorAll('.edit-quizz-btn').forEach(editBtn => {
    editBtn.addEventListener('click', () => {
        let id = editBtn.getAttribute('data-id');
        let quizzContainer = document.getElementById(`quizz_${id}_`);
        let quizzTitle = quizzContainer.querySelector('strong[data-title="quizz-title"]');
        let courseId = quizzContainer.getAttribute('course-id');
        console.log(courseId);    
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
            let newTitle = titleInput.value.trim();
            if (existingTitles.includes(newTitle) && newTitle !== quizzTitle.textContent.trim()) {
                errorMessage.textContent = "A quiz with this title already exists!";
            } else {
                errorMessage.textContent = "";
            }
        });

        // Prevent form submission if duplicate exists
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            let newTitle = titleInput.value.trim();
            const actionUrl = form.getAttribute('action');
        
            if (existingTitles.includes(newTitle) && newTitle !== quizzTitle.textContent.trim()) {
                errorMessage.textContent = "A quiz with this title already exists!";
                return; // Stop execution
            }
        
            errorMessage.textContent = "";
            
            try {
                const response = await fetch(actionUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: newTitle })
                });
        
                if (response.ok) {
                    console.log("Quizz updated successfully");
                    quizzContainer.innerHTML = `
                        <a href="${actionUrl}" class="text-decoration-none text-dark">
                            <strong data-title="quizz-title" style="width: 65%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${newTitle}</strong>
                        </a>
                    `;
                } else {
                    const result = await response.json();
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error("Error updating quizz:", error);
            }
        });
        
        // Handle cancel button click
        document.getElementById(`cancelBtn_${id}`).addEventListener('click', () => {
            window.location.reload();
        });
    });
});



document.querySelectorAll(".delete-quizz-btn").forEach(form => {
    form.addEventListener("submit",async function(event){
        event.preventDefault();


        const isConfirmed = confirm("Are you sure to delete this quizz?");
        if (!isConfirmed) return;

        const quizzId = this.getAttribute("data-quizz-id");
        const actionUrl = this.getAttribute("action"); // Get API endpoint
        console.log(actionUrl);
        const response = await fetch(actionUrl, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: quizzId })
        });
        
        if (response.ok) {
            console.log("Quizz deleted successfully");
            document.getElementById(`quizz_${quizzId}`).closest("li").remove(); // Correct selector
        } else {
            const result = await response.json();
            alert("Error: " + result.message); // Show error if deletion fails
        }

    })
})