//aiChat.js
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
let isTyping = false;
let currentTypingInterval = null;

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
    chatSendBtn.style.color = "gray";
})

chatInput.addEventListener("input", () => {
    if (chatInput.value) {
        chatSendBtn.disabled = false;
        chatSendBtn.style.color = "black";
    } else {
        chatSendBtn.disabled = true;
        chatSendBtn.style.color = "gray";
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
    shrinkChatBtn.classList.remove("d-none");
    expandChatBtn.classList.add("d-none");
});

shrinkChatBtn.addEventListener("click", () => {
    shrinkChat();
    expandChatBtn.classList.remove("d-none");
    shrinkChatBtn.classList.add("d-none");
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

async function sendMessage(message) {
    appendMessage("user", message);
    chatInput.value = "";
    chatSendBtn.disabled = true;
    
    // Show stop button and hide send button
    chatSendBtn.classList.add('d-none');
    chatStopBtn.classList.remove('d-none');
    chatStopBtn.style.color = "black";

    const typingDiv = document.createElement("div");
    typingDiv.classList.add("ai-message");
    typingDiv.innerHTML = `<div class="message-content">
        <div class="getting-response">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>
    </div>`;
    chatMessages.appendChild(typingDiv);
    

    try {
        abortController = new AbortController();
        const res = await fetch("/api/gemini/generate-response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: abortController.signal,
            body: JSON.stringify({
                prompt: message,
                userId,
                sessionId,
                currentPdfId,
            }),
        });

        const data = await res.json();
        typingDiv.remove();
        await typeMessage("ai", data.response, data.chatHistory);
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('Request was aborted');
            typingDiv.remove();
            appendMessage("ai", "❌ Response generation stopped.");
        } else {
            typingDiv.remove();
            appendMessage("ai", "⚠️ Error: Unable to get a response.");
        }
    } finally {
        // Reset buttons
        chatSendBtn.classList.remove('d-none');
        chatStopBtn.classList.add('d-none');
        chatStopBtn.style.color = "gray";
        abortController = null;
    }
}

async function typeMessage(sender, text, chatHistory, speed = 20) {
    const msgContainer = document.createElement("div");
    msgContainer.classList.add(sender === "user" ? "sent" : "ai-message");

    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    msgContainer.appendChild(messageContent);

    chatMessages.appendChild(msgContainer);
    

    isTyping = true;
    let i = 0;
    
    // Function to process and highlight code blocks in current content
    const processCodeBlocks = () => {
        messageContent.querySelectorAll("pre code").forEach((block) => {
            // Remove existing copy buttons to avoid duplicates
            const pre = block.parentElement;
            const existingCopyBtn = pre.querySelector(".copy-btn");
            if (existingCopyBtn) {
                existingCopyBtn.remove();
            }
            
            // Apply syntax highlighting
            hljs.highlightElement(block);
            
            // Add copy button
            const button = document.createElement("button");
            button.classList.add("copy-btn");
            button.textContent = "Copy";
            button.onclick = () => {
                navigator.clipboard.writeText(block.textContent);
                button.textContent = "Copied!";
                setTimeout(() => (button.textContent = "Copy"), 1500);
            };
            pre.appendChild(button);
        });
    };

    while (i < text.length && isTyping) {
        messageContent.innerHTML = marked.parse(text.slice(0, i + 1));
        
        // Process code blocks in real-time
        processCodeBlocks();
        
        i++;
        
        await new Promise((resolve) => setTimeout(resolve, speed));
    }

    // Final processing after typing is complete or stopped
    if (i >= text.length) {
        processCodeBlocks();
        
        // Add feedback buttons for AI messages
        if (sender === "ai" && chatHistory) {
            const feedbackContainer = document.createElement("div");
            feedbackContainer.classList.add("feedback-container", "mt-2");
            feedbackContainer.innerHTML = `
                <div class="d-flex align-items-center justify-content-end gap-2">
                    <button type="button" data-id="${chatHistory.id}_like" 
                            class="feedback-btn btn btn-sm ${chatHistory.liked ? 'selected' : ''}">
                        <i class="bi bi-hand-thumbs-up${chatHistory.liked ? '-fill' : ''}"></i>
                    </button>
                    <button type="button" data-id="${chatHistory.id}_dislike" 
                            class="feedback-btn btn btn-sm ${chatHistory.disliked ? 'selected' : ''}">
                        <i class="bi bi-hand-thumbs-down${chatHistory.disliked ? '-fill' : ''}"></i>
                    </button>
                </div>
            `;
            msgContainer.appendChild(feedbackContainer);
        }
    }

    isTyping = false;
}

function appendMessage(sender, message) {
    const msgContainer = document.createElement("div");
    msgContainer.classList.add(sender === "user" ? "sent" : "ai-message");

    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    messageContent.innerHTML = marked.parse(message);
    msgContainer.appendChild(messageContent);

    chatMessages.appendChild(msgContainer);
    

    // Apply syntax highlighting and add copy buttons for code blocks
    messageContent.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
        const pre = block.parentElement;
        if (!pre.querySelector(".copy-btn")) {
            const button = document.createElement("button");
            button.classList.add("copy-btn");
            button.textContent = "Copy";
            button.onclick = () => {
                navigator.clipboard.writeText(block.textContent);
                button.textContent = "Copied!";
                setTimeout(() => (button.textContent = "Copy"), 1500);
            };
            pre.appendChild(button);
        }
    });
}

function stopMessage() {
    // Stop the typing animation immediately
    isTyping = false;
    
    // Hide stop button and show send button
    chatSendBtn.classList.remove('d-none');
    chatStopBtn.classList.add('d-none');
    chatStopBtn.style.color = "gray";

    // Abort the fetch request if it exists
    if (abortController) {
        abortController.abort();
        abortController = null;
    }

    // Remove the "getting response" indicator
    const typingIndicator = document.querySelector('.ai-message .getting-response');
    if (typingIndicator) {
        typingIndicator.closest('.ai-message').remove();
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
    chatModal.classList.remove("expanded");
}

// Handle feedback clicks
async function handleFeedback(event) {
    const feedbackBtn = event.target.closest('[data-id$="_like"], [data-id$="_dislike"]');

    if (!feedbackBtn) {
        console.log('No feedback button found - exiting');
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const dataId = feedbackBtn.getAttribute("data-id");
    if (!dataId) {
        console.log('No data-id found - exiting');
        return;
    }

    const [chatHistoryId, action] = dataId.split("_");

    const liked = action === "like" ? 1 : 0;
    const disliked = action === "dislike" ? 1 : 0;
    
    try {
        const response = await fetch("/api/gemini/save-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chatHistoryId: parseInt(chatHistoryId),
                liked,
                disliked
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error("Feedback submission failed");
        }

        const responseData = await response.json();
        const feedbackContainer = feedbackBtn.closest('.feedback-container');

        if (feedbackContainer) {
            // Get all buttons and their icons
            const likeBtn = feedbackContainer.querySelector('[data-id$="_like"]');
            const dislikeBtn = feedbackContainer.querySelector('[data-id$="_dislike"]');
            const likeIcon = likeBtn.querySelector('i');
            const dislikeIcon = dislikeBtn.querySelector('i');

            // Reset all buttons and icons
            likeBtn.classList.remove('selected', 'active-feedback');
            dislikeBtn.classList.remove('selected', 'active-feedback');
            likeIcon.classList.remove('bi-hand-thumbs-up-fill');
            likeIcon.classList.add('bi-hand-thumbs-up');
            dislikeIcon.classList.remove('bi-hand-thumbs-down-fill');
            dislikeIcon.classList.add('bi-hand-thumbs-down');

            // Update the clicked button and icon
            if (action === "like") {
                likeBtn.classList.add('selected');
                likeIcon.classList.remove('bi-hand-thumbs-up');
                likeIcon.classList.add('bi-hand-thumbs-up-fill');
            } else {
                dislikeBtn.classList.add('selected');
                dislikeIcon.classList.remove('bi-hand-thumbs-down');
                dislikeIcon.classList.add('bi-hand-thumbs-down-fill');
            }

            // Add temporary active feedback effect
            feedbackBtn.classList.add('active-feedback');
            setTimeout(() => {
                feedbackBtn.classList.remove('active-feedback');
            }, 1000);
        }
    } catch (error) {
        console.error("Failed to send feedback:", error);
    }
}

let sideBarMenuBtn = document.querySelectorAll(".side-bar-menu-btn");
sideBarMenuBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        let sideBar = document.querySelector("#side-bar");
        sideBar.classList.toggle("open");
    })
})

// Add event delegation for feedback buttons
document.addEventListener('click', async (event) => {
    const feedbackButton = event.target.closest('[data-id$="_like"], [data-id$="_dislike"]');
    if (feedbackButton) {
        await handleFeedback(event);
    }
});