

let chatModal = document.querySelector(".ask-ai-chat-modal");
let openChatBtn = document.querySelector(".open-chat-btn");
let closeChatBtn = document.querySelector(".close-chat-btn");
let chatHeader = document.querySelector(".ask-ai-chat-header");
let chatBody = document.querySelector(".ask-ai-chat-body");
let chatFooter = document.querySelector(".ask-ai-chat-footer");
let chatInput = document.querySelector("#chat-input");
let chatSendBtn = document.querySelector(".chat-send-btn");
let chatStopBtn = document.querySelector(".chat-stop-btn");
let expandChatBtn = document.querySelector(".expand-chat-btn");
let shrinkChatBtn = document.querySelector(".shrink-chat-btn");
let clearChatBtn = document.querySelector(".clear-chat-btn");
let chatMessages = document.querySelector(".chat-messages");
let chatInputForm = document.querySelector("#chat-input-form");
let gettingResponse = document.createElement('div');
let fileInfoContainer = document.querySelector(".file-info-container");
let fileNameElement = document.querySelector(".file-name");
let fileSizeElement = document.querySelector(".file-size");
let removeFileBtn = document.querySelector(".remove-file-btn");

let abortController = null;
let currentPdfId = null;

const fileInput = document.getElementById("file-input");
const fileUploadButton = document.getElementById("file-upload-button");
fileUploadButton.addEventListener("click", () => {
    fileInput.click();
});

// Update the file input event listener
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        // Display file info
        fileNameElement.textContent = file.name;
        fileSizeElement.textContent = formatFileSize(file.size);
        fileInfoContainer.classList.remove("d-none");
    }
});

// Add click handler for remove file button
removeFileBtn.addEventListener("click", () => {
    fileInput.value = "";
    fileInfoContainer.classList.add("d-none");
    currentPdfId = null;
});

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

document.addEventListener("DOMContentLoaded", (event) => {
    chatInput.value = "";
    chatSendBtn.disabled = true;
})

chatInput.addEventListener("input", () => {
    if (chatInput.value) {
        chatSendBtn.disabled = false;
    } else {
        chatSendBtn.disabled = true;
    }
})

chatInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        let message = chatInput.value;
        const file = fileInput.files[0];
        // If a file is selected, upload it and get the image URL
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            try {
                const uploadResponse = await fetch("/api/gemini/upload", {
                    method: "POST",
                    body: formData
                });
                const { id } = await uploadResponse.json();
                currentPdfId = id;
            } catch (error) {
                console.error("Error uploading pdf:", error);
                return;
            }
        }
        if (message) {
            sendMessage(message);
            chatInput.value = "";
            fileInfoContainer.classList.add("d-none");
        } else {
            return
        }
    }
});

chatSendBtn.addEventListener("click", () => {
    event.preventDefault();
    let message = chatInput.value;
    if (message) {
        sendMessage(message);
        chatInput.value = "";
    } else {
        return;
    }
});

chatStopBtn.addEventListener("click", () => {
    stopMessage();
});

clearChatBtn.addEventListener("click", () => {
    clearChat();
});

expandChatBtn.addEventListener("click", () => {
    expandChat();
});

shrinkChatBtn.addEventListener("click", () => {
    shrinkChat();
});



openChatBtn.addEventListener("click", () => {
    chatModal.classList.add("open");
    chatModal.style.transform = "translateX(0)";
    chatModal.style.opacity = "1";
    chatModal.style.visibility = "visible";
});

closeChatBtn.addEventListener("click", () => {
    chatModal.classList.remove("open");
    chatModal.style.transform = `translateX(calc(${chatModal.offsetWidth}px + 3rem))`;
    chatModal.style.opacity = "0";
    chatModal.style.visibility = "hidden";
});


function sendMessage(message) {
    message = message.trim();
    if (message) {
        // Show stop button and hide send button
        chatSendBtn.classList.add('d-none');
        chatStopBtn.classList.remove('d-none');

        writeUserMessage(message);
        scrollToBottom();
      

        // Create a new AbortController for this request
        abortController = new AbortController();

        setTimeout(() => {
            gettingResponse.innerHTML = `
              <div class="getting-response">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            `;
            chatMessages.appendChild(gettingResponse);
            fetchGeminiResponse(message, abortController);
        }, 100);
    }
}

function writeUserMessage(message){
    let messageElement = document.createElement("div");
    messageElement.classList.add("sent");
    messageElement.innerHTML = `<div class="message-content">${message}</div>`;
    chatMessages.appendChild(messageElement);
}

function stopMessage() {
    // Hide stop button and show send button
    chatSendBtn.classList.remove('d-none');
    chatStopBtn.classList.add('d-none');

    // Abort the fetch request if it exists
    if (abortController) {
        abortController.abort();
        abortController = null;
    }

    // Remove the "getting response" indicator
    if (gettingResponse.parentNode) {
        gettingResponse.remove();
    }
}

function clearChat() {
    // clear chat
    chatMessages.innerHTML = "";
}

function expandChat() {
    // expand chat
    chatModal.classList.add("expanded");
}

function shrinkChat() {
    // shrink chat
}

// Modify the fetchGeminiResponse function
async function fetchGeminiResponse(prompt, controller) {
    try {
        const res = await fetch("/api/gemini/generate-response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                prompt,
                userId,
                currentPdfId,
                sessionId
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'API request failed');
        }

        const data = await res.json();
        const aiMessage = document.createElement('div');

        // Hide stop button and show send button when done
        chatSendBtn.classList.remove('d-none');
        chatStopBtn.classList.add('d-none');

        if (!data.response) {
            aiMessage.classList.add("ai-message");
            gettingResponse.remove();
            aiMessage.innerHTML = `<div class="message-content">Server is busy. Please try again later.</div>`;
            chatMessages.appendChild(aiMessage);
            return;
        }
        setTimeout(() => {
            gettingResponse.remove();
            const formattedResponse = generateFormattedResponse(data.response);
            addMessageToChat(formattedResponse, aiMessage);
            chatMessages.appendChild(aiMessage);
        }, 3000);
    } catch (error) {
        // Hide stop button and show send button on error
        chatSendBtn.classList.remove('d-none');
        chatStopBtn.classList.add('d-none');

        if (error.name === 'AbortError') {
            console.log('Fetch aborted by user');
            return;
        }

        // Show error message to user
        let errorMessage = document.createElement('div');
        errorMessage.classList.add('ai-message');

        let errorText = error.message;
        if (errorText.includes('rate limit') || errorText.includes('quota')) {
            errorText = "⚠️ " + errorText + "<br><br>Please try again later or consider upgrading your API plan.";
        }

        errorMessage.innerHTML = `<div class="message-content error-message">${errorText}</div>`;
        chatMessages.appendChild(errorMessage);
        scrollToBottom();

        // Remove the "getting response" indicator
        if (gettingResponse.parentNode) {
            gettingResponse.remove();
        }
    } finally {
        abortController = null;
    }
}


function addMessageToChat(message, aiMessage) {
    // Set the appropriate classes for the AI message
    aiMessage.classList.add('ai-message');

    // Create message wrapper and content elements
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('ai-message-wrapper');

    const messageContent = document.createElement('div');
    messageContent.classList.add('chat-message-text');

    // Directly use the formatted HTML from generateFormattedResponse
    messageContent.innerHTML = message;

    // Append elements to build the proper structure
    messageWrapper.appendChild(messageContent);
    aiMessage.appendChild(messageWrapper);

    // Add the message to the chat container
    chatMessages.appendChild(aiMessage);

    // Scroll to the bottom smoothly
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}


function generateFormattedResponse(response) {
    // If response is empty or undefined
    if (!response) return;

    // First, handle code blocks to prevent them from being modified by other formatting
    let formattedResponse = response.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    }).replace(/`([^`]+)`/g, (match, code) => {
        return `<code>${code}</code>`;
    });

    // Handle links
    formattedResponse = formattedResponse.replace(/(https?:\/\/[^\s]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // Handle different types of content
    if (isMCQResponse(formattedResponse)) {
        formattedResponse = formatMCQResponse(formattedResponse);
    } else if (isNumberedList(formattedResponse)) {
        formattedResponse = formatNumberedList(formattedResponse);
    } else if (isBulletList(formattedResponse)) {
        formattedResponse = formatBulletList(formattedResponse);
    } else {
        // Default formatting for plain text
        formattedResponse = formatPlainText(formattedResponse);
    }

    return formattedResponse;
}

// Helper functions for different content types
function isMCQResponse(text) {
    // Checks for question patterns like "1. Question text" followed by options (a), (b) etc.
    return /\d+\.\s.+?\n(\([a-d]\)\s.+?\n)+/g.test(text);
}

function formatMCQResponse(text) {
    const questionRegex = /(\d+\.\s.*?)(?=(?:\d+\.\s)|$)/gs;
    const questions = text.match(questionRegex);
    let result = '';

    if (questions) {
        questions.forEach((qBlock, index) => {
            const lines = qBlock.trim().split('\n').filter(line => line.trim() !== '');
            const questionText = lines[0].replace(/\d+\.\s/, '').trim();
            const optionsText = lines.slice(1).join('\n');

            // Extract options, handling (correct) marker
            const options = optionsText.match(/\([a-d]\)\s[^()]+(\(correct\))?/g) || [];

            result += `
        <div class="question-block"">
          <p><strong>${index + 1}. ${cleanFormatting(questionText)}</strong></p>
          <ul class="mcq-options">
            ${options.map(option => {
                const isCorrect = option.includes('(correct)');
                const cleanOption = cleanFormatting(option.replace('(correct)', '').trim());
                return `<li class="${isCorrect ? 'correct-option' : ''}">${cleanOption}</li>`;
            }).join('')}
          </ul>
        </div>
      `;
        });
    }

    return result || `<div class="question-block">${text}</div>`;
}

function isNumberedList(text) {
    // Checks for numbered items (1., 2., etc.) with more than 1 item
    return (text.match(/\d+\.\s/g) || []).length > 1;
}

function formatNumberedList(text) {
    const items = text.split(/\d+\.\s/).filter(item => item.trim() !== '');
    let result = '';

    items.forEach((item, index) => {
        const content = item.trim();
        const [heading, ...details] = content.split('\n');

        result += `
      <div class="numbered-item">
        <p><strong>${index + 1}. ${cleanFormatting(heading)}</strong></p>
        ${details.filter(d => d.trim()).map(d => `<p>${cleanFormatting(d)}</p>`).join('')}
      </div>
    `;
    });

    return result;
}

function isBulletList(text) {
    // Checks for bullet points (-, *, •)
    return /^(\s*[-*•]\s+.+(\n|$))+/gm.test(text);
}

function formatBulletList(text) {
    const items = text.split(/^[-*•]\s+/gm).filter(item => item.trim() !== '');
    let result = '<ul class="bullet-list">';

    items.forEach(item => {
        result += `<li>${cleanFormatting(item.trim())}</li>`;
    });

    result += '</ul>';
    return result;
}

function formatPlainText(text) {
    // Handle paragraphs separated by double newlines
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');
    return paragraphs.map(p => `<p>${cleanFormatting(p)}</p>`).join('');
}

function cleanFormatting(text) {
    // Clean markdown-style formatting
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
        .replace(/\*(.*?)\*/g, '<em>$1</em>')                // *italic*
        .replace(/_(.*?)_/g, '<em>$1</em>')                  // _italic_
        .replace(/~~(.*?)~~/g, '<del>$1</del>')              // ~~strikethrough~~
        .replace(/`(.*?)`/g, '<code>$1</code>');             // `code`
}



let sideBarMenuBtn = document.querySelectorAll(".side-bar-menu-btn");
sideBarMenuBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        let sideBar = document.querySelector("#side-bar");
        sideBar.classList.toggle("open");
    })
})

let chatHistoryContainer = document.querySelector(".chat-history-container");

let chatItems = chatHistoryContainer.querySelectorAll(".chat-history-item");
chatItems.forEach(item => {
    item.addEventListener("click", async () => {
        let chatId = item.getAttribute("data-id");

        try {
            console.log("Clicked chat with session ID:", chatId);

            const response = await fetch(`/api/gemini/get-chat?id=${encodeURIComponent(chatId)}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            const aiMessage = document.createElement('div');
            writeUserMessage(data.chat.prompt)
            const formattedResponse = generateFormattedResponse(data.chat.response);
            addMessageToChat(formattedResponse, aiMessage);
            chatMessages.appendChild(aiMessage);

            // You can now render this data in your chat view
        } catch (err) {
            console.error("Fetch error:", err);
        }
    });
});
