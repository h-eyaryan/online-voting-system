// Global variables
let currentUser = null;
let selectedCandidate = null;
let candidates = [
    { id: 1, name: 'John Doe', party: 'Democratic Party', votes: 0, img: 'JD' },
    { id: 2, name: 'Jane Smith', party: 'Republican Party', votes: 0, img: 'JS' },
    { id: 3, name: 'Mike Johnson', party: 'Independent', votes: 0, img: 'MJ' }
];

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    showSection('auth');
    updateResults();
    
    // Demo users (remove in production)
    console.log('Demo Users:\ndemo/1234\nadmin/admin');
});

// Load data from LocalStorage
function loadData() {
    const savedUsers = localStorage.getItem('votingUsers');
    const savedVotes = localStorage.getItem('votingData');
    
    if (savedUsers) window.votingUsers = JSON.parse(savedUsers);
    else window.votingUsers = {};
    
    if (savedVotes) {
        const data = JSON.parse(savedVotes);
        candidates = data.candidates || candidates;
    }
}

// Save data to LocalStorage
function saveData() {
    localStorage.setItem('votingUsers', JSON.stringify(window.votingUsers));
    localStorage.setItem('votingData', JSON.stringify({ candidates }));
}

// Show alert message
function showAlert(message, type = 'error') {
    const alertDiv = document.getElementById('alert');
    alertDiv.innerHTML = `<div class="alert ${type}">${message}</div>`;
    setTimeout(() => alertDiv.innerHTML = '', 5000);
}

// Toggle auth forms
function showForm(formType) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    if (formType === 'login') {
        document.getElementById('login-form').classList.add('active');
        event.target.classList.add('active');
    } else {
        document.getElementById('register-form').classList.add('active');
        event.target.classList.add('active');
    }
}

// Register new user
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    // Validation
    if (!username || !email || !password) {
        showAlert('Please fill all fields!');
        return;
    }

    if (password.length < 4) {
        showAlert('Password must be at least 4 characters!');
        return;
    }

    if (window.votingUsers[username]) {
        showAlert('Username already exists!');
        return;
    }

    // Save user
    window.votingUsers[username] = {
        password: btoa(password), // Simple base64 encoding
        email: email,
        hasVoted: false
    };
    
    saveData();
    showAlert('Registration successful! Please login.', 'success');
    this.reset();
});

// Login user
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showAlert('Please enter username and password!');
        return;
    }

    if (!window.votingUsers[username]) {
        showAlert('User not found!');
        return;
    }

    if (window.votingUsers[username].password !== btoa(password)) {
        showAlert('Invalid password!');
        return;
    }

    currentUser = username;
    loginSuccess(username);
    
    if (window.votingUsers[username].hasVoted) {
        showWelcome();
    } else {
        showVoting();
    }
    
    this.reset();
});

// Login success handler
function loginSuccess(username) {
    document.getElementById('current-user').textContent = username;
    document.getElementById('welcome-name').textContent = username;
}

// Show/hide sections
function showSection(sectionId) {
    document.querySelectorAll('[id$="-section"]').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId + '-section').classList.add('active');
}

function showVoting() {
    showSection('voting');
    document.getElementById('submit-vote').disabled = true;
    selectedCandidate = null;
}

function showWelcome() {
    showSection('welcome');
}

function showResults() {
    updateResults();
    showSection('results');
}

// Select candidate for voting
function selectCandidate(id, event) {
    selectedCandidate = id;
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    document.getElementById('submit-vote').disabled = false;
}

// Submit vote
document.getElementById('voting-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!selectedCandidate) {
        showAlert('Please select a candidate!');
        return;
    }

    // Update candidate votes
    const candidate = candidates.find(c => c.id === selectedCandidate);
    candidate.votes++;

    // Mark user as voted
    window.votingUsers[currentUser].hasVoted = true;

    saveData();
    showAlert('🎉 Vote cast successfully! Thank you for voting! ✅', 'success');
    
    setTimeout(() => {
        showWelcome();
    }, 2000);
});

// Update live results
function updateResults() {
    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
    document.getElementById('total-votes').textContent = totalVotes;

    const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
    
    const resultsGrid = document.getElementById('results-grid');
    resultsGrid.innerHTML = sortedCandidates.map((candidate, index) => {
        const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
        const rankSuffix = getRankSuffix(index + 1);
        
        return `
            <div class="result-card">
                <div class="rank">${rankSuffix}</div>
                <div class="candidate-info">
                    <h3>${candidate.name}</h3>
                    <p>${candidate.party}</p>
                </div>
                <div class="vote-count">
                    <span class="votes">${candidate.votes} votes</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%"></div>
                    </div>
                    <span class="percentage">${percentage}%</span>
                </div>
            </div>
        `;
    }).join('');
}

// Helper function for rank suffix
function getRankSuffix(index) {
    if (index === 1) return '🥇 1st';
    if (index === 2) return '🥈 2nd';
    if (index === 3) return '🥉 3rd';
    return ` ${index}th`;
}

// Logout function
function logout() {
    currentUser = null;
    selectedCandidate = null;
    
    // Reset forms
    document.querySelectorAll('input').forEach(input => input.value = '');
    document.querySelectorAll('.candidate-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('submit-vote').disabled = true;
    
    showSection('auth');
}

// Clear all data (for testing)
window.clearVotingData = function() {
    localStorage.removeItem('votingUsers');
    localStorage.removeItem('votingData');
    location.reload();
};