function setUpActions(){
    const deleteCourseForms = document.querySelectorAll('.delete-course-form');
    if(deleteCourseForms.length == 0) return;
    deleteCourseForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
    
            fetch(form.action, {
                method: form.method,
                 headers: {
                        "Authorization": `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.ok) {
                    // Remove card from UI
                    const card = form.closest('.card');
                    card.closest('.col-lg-4').remove();
    
                    // Show success message
                    showAlert(response.message);
                } else {
                    const result = response.json();
                    showAlert('Error: ' + result.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred while deleting the course.', 'danger');
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setUpActions, 5000);
});