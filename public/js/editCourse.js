// Edit Course Functionality
// Edit Course Functionality
document.querySelectorAll('.edit-course').forEach(editBtn => {
    editBtn.addEventListener('click', handleEditClick);
});

function handleEditClick(e) {
    e.preventDefault();
    const editBtn = e.currentTarget;
    const id = editBtn.getAttribute('data-id');
    const card = editBtn.closest('.card-body');
    const courseTitle = card.querySelector('.card-title');
    
    // Prevent duplicate form insertion
    if (card.querySelector('.edit-course-form')) return;

    // Collect all existing course titles
    const existingTitles = Array.from(document.querySelectorAll('.card-title'))
        .map(title => title.textContent.trim().toLowerCase());

    // Store original elements (not just HTML) so we can restore event listeners
    const originalElements = {
        card: card.cloneNode(true),
        editBtn: editBtn.cloneNode(true)
    };
    
    // Create edit form
    card.innerHTML = `
        <form class="edit-course-form" action="/api/courses/${id}" method="post">
            <div class="mb-3">
                <label for="editTitle_${id}" class="form-label">Course Title</label>
                <input type="text" class="form-control" id="editTitle_${id}" 
                       name="title" value="${courseTitle.textContent.trim()}" required>
                <div class="invalid-feedback" id="error-message_${id}"></div>
            </div>
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary btn-sm flex-grow-1">
                    <i class="bi bi-check-lg me-1"></i> Save
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm cancel-edit" 
                        data-id="${id}">
                    <i class="bi bi-x-lg me-1"></i> Cancel
                </button>
            </div>
        </form>
    `;

    const titleInput = document.getElementById(`editTitle_${id}`);
    const errorMessage = document.getElementById(`error-message_${id}`);
    const form = card.querySelector('.edit-course-form');

    // Focus on input field
    titleInput.focus();

    // Check for duplicate titles on input change
    titleInput.addEventListener('input', () => {
        const newTitle = titleInput.value.trim().toLowerCase();
        if (existingTitles.includes(newTitle) && newTitle !== courseTitle.textContent.trim().toLowerCase()) {
            titleInput.classList.add('is-invalid');
            errorMessage.textContent = "A course with this title already exists!";
        } else {
            titleInput.classList.remove('is-invalid');
            errorMessage.textContent = "";
        }
    });

    // Prevent form submission if duplicate exists
    form.addEventListener('submit', (event) => {
        const newTitle = titleInput.value.trim().toLowerCase();
        if (existingTitles.includes(newTitle) && newTitle !== courseTitle.textContent.trim().toLowerCase()) {
            event.preventDefault();
            titleInput.classList.add('is-invalid');
            errorMessage.textContent = "A course with this title already exists!";
            titleInput.focus();
        }
    });

    // Handle cancel button click
    card.querySelector('.cancel-edit').addEventListener('click', () => {
        // Restore original elements
        card.innerHTML = originalElements.card.innerHTML;
        
        // Re-attach event listener to the edit button
        const restoredEditBtn = card.querySelector('.edit-course');
        if (restoredEditBtn) {
            restoredEditBtn.addEventListener('click', handleEditClick);
        }
    });
}

// Delete Course Functionality remains the same...

// Delete Course Functionality
document.querySelectorAll('.delete-course-btn').forEach(form => {
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get course details for confirmation message
        const card = this.closest('.dropdown-menu').previousElementSibling.closest('.card');
        const courseTitle = card.querySelector('.card-title').textContent.trim();

        const isConfirmed = confirm(`Are you sure you want to delete "${courseTitle}"?`);
        if (!isConfirmed) return;

        const courseId = this.getAttribute('data-course-id');
        const actionUrl = this.getAttribute('action');

        fetch(actionUrl, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (response.ok) {
                // Remove card from UI
                card.closest('.col-xl-4').remove();
                
                // Show success message
                alert('Course deleted successfully!');
                
                // Optionally refresh the page if needed
                if (document.querySelectorAll('.course-card').length === 0) {
                    window.location.reload();
                }
            } else {
                return response.json().then(err => { throw err; });
            }
        })
        .catch(error => {
            alert('Error: ' + (error.message || 'Failed to delete course'));
        });
    });
});