document.querySelectorAll('.dropdown-item[data-id]').forEach(editBtn => {
    editBtn.addEventListener('click', () => {
        let id = editBtn.getAttribute('data-id');
        let courseContainer = document.getElementById(`course_${id}_`);
        let courseTitle = courseContainer.querySelector('strong[data-title="course-title"]');
        // Prevent duplicate form insertion
        if (courseContainer.querySelector('form')) return;

        // Collect all existing course titles
        let existingTitles = Array.from(document.querySelectorAll('strong[data-title="course-title"]'))
                                  .map(title => title.textContent.trim().toLowerCase());

        courseContainer.innerHTML = `
            <form action="/api/courses/${id}" method="post" class="d-flex flex-column w-100">
                <div class="d-flex align-items-center gap-1 justify-content-between w-100">
                    <input type="text" name="title" value="${courseTitle.textContent}" class="form-control" placeholder="Enter course title" required id="editTitle">
                    <button type="submit" class="btn btn-sm btn-primary">Update</button>
                    <button type="button" class="btn btn-sm btn-danger" id="cancelBtn_${id}"><i class="bi bi-x-lg"></i></button>
                </div>
                <div id="error-message" class="text-danger mt-1 error-message"></div>
            </form>
        `;

        let titleInput = document.getElementById('editTitle');
        let errorMessage = document.getElementById('error-message');
        let form = courseContainer.querySelector('form');

        // Check for duplicate titles on input change
        titleInput.addEventListener('input', () => {
            let newTitle = titleInput.value.trim();
            if (existingTitles.includes(newTitle) && newTitle !== courseTitle.textContent.trim()) {
                errorMessage.textContent = "A course with this title already exists!";
            } else {
                errorMessage.textContent = "";
            }
        });

        // Prevent form submission if duplicate exists
        form.addEventListener('submit', (event) => {
            let newTitle = titleInput.value.trim();
            if (existingTitles.includes(newTitle) && newTitle !== courseTitle.textContent.trim()) {
                event.preventDefault();
                errorMessage.textContent = "A course with this title already exists!";
            }
        });

        // Handle cancel button click
        document.getElementById(`cancelBtn_${id}`).addEventListener('click', () => {
            courseContainer.innerHTML = `
                    <a href="/api/courses/${id}" class="text-decoration-none text-dark">
                        <strong style="width: 65%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" data-title ="course-title">${courseTitle.textContent}</strong>
                    </a>
            `;
        });

    });
});


document.querySelectorAll('.delete-course-btn').forEach(form => {
    form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const isConfirmed = confirm("Are you sure to delete this course?");
            if (!isConfirmed) return; // Stop execution if user cancels

            const courseId = this.getAttribute("data-course-id");
            const actionUrl = this.getAttribute("action"); // Get API endpoint
            console.log(actionUrl);
            console.log(courseId)
            const response = await fetch(actionUrl, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: courseId })
            });
        
            if (response.ok) {
                console.log("Course deleted successfully");
                document.getElementById(`course_${courseId}`).closest("li").remove(); // Correct selector
            } else {
                const result = await response.json();
                alert("Error: " + result.message); // Show error if deletion fails
            }
    });
});
