//chatHistory.js
const chatHistoryContainer = document.getElementById("chat-history-container");

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Show loading spinner immediately
    chatHistoryContainer.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 100px;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    if(userId){
        // Set up event delegation first
        setupEventDelegation();
        // Then fetch chat history after a short delay (you can reduce or remove the delay if needed)
        fetchChatHistory();
    }
});

// Fetch and display chat history
function fetchChatHistory() {
    fetch('/api/gemini/get-chat-history')
        .then(response => response.json())
        .then(groupedChats => {
            if (Object.keys(groupedChats).length === 0) {
                // Show empty state if no chats exist
                chatHistoryContainer.innerHTML = `
                    <div class="text-center py-4 text-muted">
                        No chat history found
                    </div>
                `;
                return;
            }
            
            chatHistoryContainer.innerHTML = ''; // Clear existing content

            for (const label in groupedChats) {
                // Create label header
                const labelElement = document.createElement('li');
                labelElement.classList.add(
                    'list-group-item', 'position-sticky', 'top-0',
                    'bg-secondary-subtle', 'z-1000', 'px-2', 'fw-bold'
                );
                labelElement.style.fontSize = '0.95rem';
                labelElement.textContent = label;
                chatHistoryContainer.appendChild(labelElement);

                // Create chat list for each group
                const chatList = document.createElement('ul');
                chatList.classList.add('list-group');

                groupedChats[label].forEach(chat => {
                    const chatItem = document.createElement('li');
                    chatItem.classList.add(
                        'list-group-item', 'list-group-item-secondary',
                        'list-group-item-action', 'border-0', 'mb-1',
                        'rounded', 'px-1', 'py-2', 'd-flex', 'align-items-center',
                        'justify-content-between'
                    );

                    chatItem.innerHTML = `
                    <div data-id="${chat.id}" class="chat-history-item" style="width: 160px;">
                        <div style="text-overflow: hidden; overflow: hidden; white-space: nowrap; border: 1px solid transparent;">
                            ${escapeHtml(chat.prompt)}
                        </div>
                    </div>
                    <div class="btn-group dropup">
                        <button type="button" class="btn btn-sm outline-none border-0" data-bs-toggle="dropdown" aria-expanded="false">
                           <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><button class="dropdown-item delete-chat-btn" data-id="${chat.id}">Delete</button></li>
                        </ul>
                    </div>
                `;

                    chatList.appendChild(chatItem);
                });

                chatHistoryContainer.appendChild(chatList);
            }
        })
        .catch(error => {
            console.error('Error fetching chat history:', error);
            chatHistoryContainer.innerHTML = '<li class="list-group-item text-danger">Error loading chat history</li>';
        });
}

// Set up event delegation for all dynamic elements
function setupEventDelegation() {
    // Handle chat item clicks
    chatHistoryContainer.addEventListener("click", async (event) => {
        const chatItem = event.target.closest(".chat-history-item");
        if (chatItem) {
            await loadChatHistoryItem(chatItem);
            return;
        }

        // Handle delete button clicks
        const deleteBtn = event.target.closest(".delete-chat-btn");
        if (deleteBtn) {
            event.stopPropagation();
            await deleteChatItem(deleteBtn);
            return;
        }
    });
}

// Load a specific chat history item
async function loadChatHistoryItem(chatItem) {
    const chatId = chatItem.getAttribute("data-id");

    try {
        const response = await fetch(`/api/gemini/get-chat?id=${encodeURIComponent(chatId)}`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        
        // Clear current chat
        chatMessages.innerHTML = '';
        
        // Add user message using the new appendMessage function
        appendMessage("user", data.chat.prompt);
        
        // Add AI message using the new typeMessage function (without typing animation for history)
        const msgContainer = document.createElement("div");
        msgContainer.classList.add("ai-message");

        const messageContent = document.createElement("div");
        messageContent.classList.add("message-content");
        messageContent.innerHTML = marked.parse(data.chat.response);
        msgContainer.appendChild(messageContent);

        // Add feedback buttons for AI messages
        if (data.chat) {
            const feedbackContainer = document.createElement("div");
            feedbackContainer.classList.add("feedback-container", "mt-2");
            feedbackContainer.innerHTML = `
                <div class="d-flex align-items-center justify-content-end gap-2">
                    <button type="button" data-id="${data.chat.id}_like" 
                            class="feedback-btn btn btn-sm ${data.chat.liked ? 'selected' : ''}">
                        <i class="bi bi-hand-thumbs-up${data.chat.liked ? '-fill' : ''}"></i>
                    </button>
                    <button type="button" data-id="${data.chat.id}_dislike" 
                            class="feedback-btn btn btn-sm ${data.chat.disliked ? 'selected' : ''}">
                        <i class="bi bi-hand-thumbs-down${data.chat.disliked ? '-fill' : ''}"></i>
                    </button>
                </div>
            `;
            msgContainer.appendChild(feedbackContainer);
        }

        chatMessages.appendChild(msgContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Apply syntax highlighting and add copy buttons
        messageContent.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block);
        });
        addCopyButtons();

    } catch (err) {
        console.error("Error loading chat:", err);
        appendMessage("ai", "⚠️ Error: Failed to load chat history item");
    }
}

function addCopyButtons() {
    document.querySelectorAll("pre code").forEach((block) => {
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

// Delete a chat item
async function deleteChatItem(deleteBtn) {
    const chatId = deleteBtn.getAttribute("data-id");
    const listItem = deleteBtn.closest(".list-group-item");

    try {
        const response = await fetch(`/api/gemini/delete-chat?id=${encodeURIComponent(chatId)}`, {
            method: "DELETE",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) throw new Error("Network response was not ok");

        // Remove the item with animation
        listItem.style.transition = "opacity 0.3s";
        listItem.style.opacity = "0";
        setTimeout(() => listItem.remove(), 300);
        
        // Refresh chat history after deletion
        setTimeout(() => {
            fetchChatHistory();
        }, 300);
        
    } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete chat");
    }
}

// Handle feedback clicks from chat history
async function handleFeedbackClick(event) {
    // Check if the click came from a feedback button or its icon
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

// Helper function to escape HTML (for security)
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Add event listener for feedback buttons in chat history items
document.addEventListener('click', async (event) => {
    const feedbackButton = event.target.closest('[data-id$="_like"], [data-id$="_dislike"]');
    if (feedbackButton) {
        await handleFeedbackClick(event);
    }
});