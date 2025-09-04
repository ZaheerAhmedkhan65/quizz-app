document.addEventListener('click', function (e) {
    if (e.target.closest('.download-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.download-btn');
        
        if (btn.classList.contains('loading')) return;

        const pdfUrl = btn.dataset.href;
        if (!pdfUrl) return;
        
        downloadWithProgress(btn, pdfUrl);
    }
});

function downloadWithProgress(button, pdfUrl) {
    const btnText = button.querySelector('.btn-text');
    const progressCircle = button.querySelector('.progress-circle');
    const circularProgress = button.querySelector('.circular-progress');
    const icon = button.querySelector('.download-icon');
    const originalIcon = icon.innerHTML;
    const originalText = btnText.textContent;

    // Reset
    progressCircle.style.transition = 'none';
    progressCircle.style.strokeDasharray = 100;
    progressCircle.style.strokeDashoffset = 100;
    circularProgress.style.opacity = '1';
    progressCircle.getBoundingClientRect();
    progressCircle.style.transition = 'stroke-dashoffset 0.2s linear';

    button.classList.add('loading');
    btnText.textContent = 'Downloading...';

    fetch(pdfUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            // Extract filename from Content-Disposition header
            let fileName = 'document.pdf';
            const contentDisposition = response.headers.get('content-disposition');
            if (contentDisposition && contentDisposition.includes('filename=')) {
                fileName = contentDisposition
                    .split('filename=')[1]
                    .replace(/["']/g, '')   // remove quotes
                    .trim();
            }

            const contentLength = response.headers.get('content-length');

            // Case 1: content-length available (real progress)
            if (contentLength) {
                const total = parseInt(contentLength, 10);
                let loaded = 0;
                const reader = response.body.getReader();
                const chunks = [];

                function read() {
                    return reader.read().then(({ done, value }) => {
                        if (done) return;
                        loaded += value.length;
                        chunks.push(value);

                        // Update progress
                        const percent = Math.round((loaded / total) * 100);
                        progressCircle.style.strokeDashoffset = 100 - percent;

                        return read();
                    });
                }

                return read().then(() => ({
                    blob: new Blob(chunks),
                    fileName
                }));
            }

            // Case 2: no content-length (fake smooth progress until blob ready)
            let progress = 0;
            const fakeInterval = setInterval(() => {
                progress = Math.min(progress + 5, 90); // cap at 90%
                progressCircle.style.strokeDashoffset = 100 - progress;
            }, 200);

            return response.blob().then(blob => {
                clearInterval(fakeInterval);
                progressCircle.style.strokeDashoffset = 0; // finish at 100%
                return { blob, fileName };
            });
        })
        .then(({ blob, fileName }) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;  // ✅ use filename from server
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Success state
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

            setTimeout(() => {
                if (button.classList.contains('success')) {
                    button.classList.remove('success');
                    btnText.textContent = originalText;
                    icon.innerHTML = originalIcon;
                    progressCircle.style.strokeDashoffset = 100;
                    circularProgress.style.opacity = '0';
                }
            }, 2000);
        })
        .catch(error => {
            console.error(error);
            button.classList.remove('loading');
            btnText.textContent = 'Error!';
        });
}
