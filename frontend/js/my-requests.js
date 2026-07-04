    const logoutButton = document.getElementById('logoutBtn'); 
    document.addEventListener('DOMContentLoaded', () => {
    const requestsList = document.getElementById('requestsList');
    const statusFilter = document.getElementById('statusFilter');
    const refreshBtn = document.getElementById('refreshBtn');

    const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://final-dbms-backend-pavan-updated-ds.vercel.app";


    async function loadRequests() {
        try {
            requestsList.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <span>Loading your service requests...</span>
                </div>
            `;

            const residentId = localStorage.getItem('residentId');
            if (!residentId) {
                requestsList.innerHTML = '<p>Please log in first.</p>';
                return;
            }

            let url = `${API_URL}/api/resident/requests/${residentId}`;
            if (statusFilter.value) url += `?status=${statusFilter.value}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch requests');

            const requests = await res.json();

            if (!requests || requests.length === 0) {
                requestsList.innerHTML = '<p>No service requests found.</p>';
                return;
            }

            requestsList.innerHTML = requests.map(req => `
                <div class="request-card">
                    <div class="request-header">
                        <span class="request-id">#${req.request_id}</span>
                        <span class="request-status ${req.status.toLowerCase()}">${req.status}</span>
                    </div>
                    <div class="request-body">
                        <div><strong>Type:</strong> ${req.title}</div>
                        <div><strong>Description:</strong> ${req.description}</div>
                        <div><strong>Assigned Staff:</strong> ${req.staffName || '-'}</div>
                        <div><strong>Request Date:</strong> ${new Date(req.request_date).toLocaleDateString()}</div>
                    </div>
                </div>
            `).join('');

        } catch (err) {
            console.error(err);
            requestsList.innerHTML = '<p>Error loading service requests.</p>';
        }
    }

    statusFilter.addEventListener('change', loadRequests);

    refreshBtn.addEventListener('click', loadRequests);

    loadRequests();
});
if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            localStorage.removeItem('amsUser');
            localStorage.removeItem('adminId');
            localStorage.removeItem('staffId');
            localStorage.removeItem('residentId');
            
            try {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST'
                });
            } catch (err) {
                console.warn("Server logout endpoint failed, but client data is cleared.", err);
            }

            window.location.href = 'index.html'; 
        });
    }