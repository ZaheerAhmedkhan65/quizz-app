// Generic function to handle all status changes
async function handleStatusChange(action, id, row, newStatus, successMessage) {
    try {
        const response = await fetch(`/api/users/${id}/${action}`, {
            method: "POST",
        });
        
        if (!response.ok) throw new Error(`${action} failed`);
        
        // Update UI
        updateUserStatusUI(row, newStatus, id);
        
    } catch (error) {
        console.error('Error:', error);
        alert(`Failed to ${action} user`);
    }
}

// Update UI based on new status
function updateUserStatusUI(row, newStatus, userId) {
    const badge = row.querySelector('.badge');
    const dropdown = row.querySelector('.dropdown-menu');
    
    // Update badge
    badge.className = 'badge ' + (
        newStatus === 'approved' ? 'badge-outline-success' :
        (newStatus === 'blocked' || newStatus === 'deleted') ? 'badge-outline-danger' :
        'badge-outline-warning'
    );
    badge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    
    // Update dropdown menu
    dropdown.innerHTML = `
        <a href="#" class="dropdown-item"><i class="mdi mdi-account-outline text-primary me-2"></i> View Profile</a>
        <a href="#" class="dropdown-item"><i class="mdi mdi-onepassword text-primary me-2"></i> Change Password</a>
        ${newStatus !== 'deleted' ? `<a href="#" data-id="${userId}" class="dropdown-item delete-user"><i class="mdi mdi-delete-outline text-primary me-2"></i> Delete User</a>` : ''}
        ${newStatus !== 'approved' ? `<a href="#" data-id="${userId}" class="dropdown-item approve-user"><i class="mdi mdi-check text-primary me-2"></i> Approve User</a>` : ''}
        ${newStatus !== 'blocked' && newStatus !== 'deleted' ? `<a href="#" data-id="${userId}" class="dropdown-item block-user"><i class="mdi mdi-close text-primary me-2"></i> Block User</a>` : ''}
    `;
    
    // Reattach event listeners to new buttons
    attachStatusHandlers();
}

// Attach event listeners
function attachStatusHandlers() {
    // Delete user
    document.querySelectorAll(".delete-user").forEach(link => {
        link.addEventListener("click", async (e) => {
            e.preventDefault();
            const id = link.getAttribute("data-id");
            const row = link.closest('tr');
            const userName = row.querySelector('td:nth-child(2)').textContent.trim();
            
            if (confirm(`Are you sure you want to delete user ${userName}?`)) {
                await handleStatusChange('delete', id, row, 'deleted', 'User deleted successfully');
            }
        });
    });
    
    // Block user
    document.querySelectorAll(".block-user").forEach(link => {
        link.addEventListener("click", async (e) => {
            e.preventDefault();
            const id = link.getAttribute("data-id");
            const row = link.closest('tr');
            const userName = row.querySelector('td:nth-child(2)').textContent.trim();
            
            if (confirm(`Are you sure you want to block user ${userName}?`)) {
                await handleStatusChange('block', id, row, 'blocked', 'User blocked successfully');
            }
        });
    });
    
    // Approve user
    document.querySelectorAll(".approve-user").forEach(link => {
        link.addEventListener("click", async (e) => {
            e.preventDefault();
            const id = link.getAttribute("data-id");
            const row = link.closest('tr');
            const userName = row.querySelector('td:nth-child(2)').textContent.trim();
            
            if (confirm(`Are you sure you want to approve user ${userName}?`)) {
                await handleStatusChange('approve', id, row, 'approved', 'User approved successfully');
            }
        });
    });
}

// Initialize handlers when page loads
document.addEventListener('DOMContentLoaded', attachStatusHandlers);