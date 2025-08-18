document.addEventListener('click', function (e) {
    if (e.target.closest('.download-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.download-btn');
        
        if (btn.classList.contains('loading')) return;

        const pdfUrl = btn.dataset.href;
        if (!pdfUrl) return;
        
        simulateDownload(btn);
        
        // After animation completes, trigger the actual download
        // setTimeout(() => {
        //     // Create a hidden iframe to trigger the download
        //     const iframe = document.createElement('iframe');
        //     iframe.src = pdfUrl;
        //     iframe.style.display = 'none';
        //     document.body.appendChild(iframe);
            
        //     // Clean up after download
        //     setTimeout(() => {
        //         document.body.removeChild(iframe);
        //     }, 10000); // Remove after 10 seconds
        // }, 2500);



        // After animation completes, trigger the actual download
        setTimeout(() => {
            // Create a hidden anchor element to force download
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = pdfUrl.split('/').pop() || 'document.pdf';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, 2500);
    }
});

function generateAndDownloadLecturePDF(button) {
    const btnText = button.querySelector('.btn-text');
    const progressCircle = button.querySelector('.progress-circle');
    const circularProgress = button.querySelector('.circular-progress');
    const icon = button.querySelector('.download-icon');
    const originalIcon = icon.innerHTML;
    const originalText = btnText.textContent;

    // Reset circle properly before new download
    progressCircle.style.transition = 'none';
    progressCircle.style.strokeDashoffset = '100';
    circularProgress.style.opacity = '1';

    // Force browser reflow to apply reset instantly
    progressCircle.getBoundingClientRect();

    // Restore transition for animation
    progressCircle.style.transition = 'stroke-dashoffset 0.4s ease';

    button.classList.add('loading');
    btnText.textContent = 'Generating PDF...';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 12;
        if (progress >= 70) { // Stop at 70% to wait for server response
            progress = 70;
            clearInterval(interval);
            
            // Get the current URL and replace path for PDF endpoint
            const currentUrl = window.location.href;
            const pdfUrl = currentUrl.includes('lectures/') 
                ? currentUrl.replace('lectures/', 'lectures/pdf/')
                : currentUrl + '/pdf';

            // Fetch the PDF from server
            fetch(pdfUrl, {
                headers: {
                    'Accept': 'application/pdf'
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to generate PDF');
                return response.blob();
            })
            .then(blob => {
                // Complete the progress animation
                progressCircle.style.strokeDashoffset = '0';
                
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = document.querySelector('h1').textContent.trim() + '-questions.pdf';
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                // Show success state
                button.classList.remove('loading');
                button.classList.add('success');
                circularProgress.style.opacity = '0';

                setTimeout(() => {
                    btnText.textContent = 'Complete!';
                    icon.innerHTML = `
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    `;
                }, 150);

                // Reset state after 2s
                setTimeout(() => {
                    if (button.classList.contains('success')) {
                        button.classList.remove('success');
                        btnText.textContent = originalText;
                        icon.innerHTML = originalIcon;
                        progressCircle.style.strokeDashoffset = '100';
                        circularProgress.style.opacity = '0';
                    }
                }, 2000);
            })
            .catch(error => {
                console.error('Error:', error);
                // Show error state
                button.classList.remove('loading');
                btnText.textContent = 'Error!';
                icon.innerHTML = `
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                `;
                
                // Reset after 2s
                setTimeout(() => {
                    btnText.textContent = originalText;
                    icon.innerHTML = originalIcon;
                    progressCircle.style.strokeDashoffset = '100';
                    circularProgress.style.opacity = '0';
                }, 2000);
            });
        } else {
            progressCircle.style.strokeDashoffset = 100 - progress;
        }
    }, 200);
}




function simulateDownload(button) {
    // Check if already downloading
    if (button.classList.contains('loading')) return;

    const btnText = button.querySelector('.btn-text');
    const progressCircle = button.querySelector('.progress-circle');
    const circularProgress = button.querySelector('.circular-progress');
    const icon = button.querySelector('.download-icon');
    const originalIcon = icon.innerHTML;
    const originalText = btnText.textContent;

    // Reset circle properly before new download
    progressCircle.style.transition = 'none';
    progressCircle.style.strokeDashoffset = '100';
    circularProgress.style.opacity = '1';

    // Force browser reflow to apply reset instantly
    progressCircle.getBoundingClientRect();

    // Restore transition for animation
    progressCircle.style.transition = 'stroke-dashoffset 0.4s ease';

    button.classList.add('loading');
    btnText.textContent = 'Downloading...';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 12;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            setTimeout(() => {
                button.classList.remove('loading');
                button.classList.add('success');
                circularProgress.style.opacity = '0';

                // Change text and icon
                setTimeout(() => {
                    btnText.textContent = 'Complete!';
                    icon.innerHTML = `
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        `;
                }, 150);

                // Reset state after 2s
                setTimeout(() => {
                    // Only reset if we're still in success state
                    if (button.classList.contains('success')) {
                        button.classList.remove('success');
                        btnText.textContent = originalText;
                        icon.innerHTML = originalIcon;
                        progressCircle.style.strokeDashoffset = '100';
                        circularProgress.style.opacity = '0';
                    }
                }, 2000);
            }, 400);
        }
        progressCircle.style.strokeDashoffset = 100 - progress;
    }, 200);
}
