document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".progress-container").forEach(container => {
        const circle = container.querySelector(".progress-ring-progress");
        const text = container.querySelector(".progress-text");

        if (!circle || !text) return; // Skip if elements are missing

        let targetValue = parseFloat(circle.getAttribute("data-progress")) || 0;
        const radius = 10;
        const circumference = 2 * Math.PI * radius;
        let progress = 0;

        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;

        const step = targetValue / 50; // Controls smoothness of animation
        const interval = setInterval(() => {
            progress += step;
            if (progress >= targetValue) {
                progress = targetValue;
                clearInterval(interval);
            }

            let offset = circumference - (progress / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            text.textContent = `${Math.round(progress)}%`;

        }, 30); // Adjust speed
    });
});