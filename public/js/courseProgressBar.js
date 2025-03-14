document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.querySelector('.progress-bar-fill');
    const targetPercentage = parseInt(progressBar.getAttribute('data-progress'), 10);
    let currentProgress = 0;

    const interval = setInterval(() => {
        if (currentProgress >= targetPercentage) {
            clearInterval(interval);
        } else {
            currentProgress++;
            progressBar.style.width = `${currentProgress}%`;
            progressBar.textContent = `${currentProgress}%`; // Show percentage inside bar
        }
    }, 100 - targetPercentage); // Adjust speed of animation
});