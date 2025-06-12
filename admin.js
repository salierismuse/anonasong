// Utility to hash a string using SHA-256 and return a hex string
async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Admin functionality
class AdminPanel {
    constructor() {
        this.isLoggedIn = this.checkLoginStatus();
        this.gardenManager = new GardenManager();
        this.init();
    }

    checkLoginStatus() {
        return sessionStorage.getItem('anonasong_admin_logged_in') === 'true';
    }

    init() {
        if (this.isLoggedIn) {
            this.showAdminPanel();
        } else {
            this.showLoginForm();
        }
    }

    showLoginForm() {
        const loginDiv = document.getElementById('adminLogin');
        const panelDiv = document.getElementById('adminPanel');
        const passwordInput = document.getElementById('adminPassword');
        const loginBtn = document.getElementById('loginBtn');

        loginDiv.classList.remove('hidden');
        panelDiv.classList.add('hidden');

        loginBtn.addEventListener('click', () => this.handleLogin());
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
    }

    async handleLogin() {
        const passwordInput = document.getElementById('adminPassword');
        const password = passwordInput.value;

        const hash = await sha256(password);
        const configHash = (window.ANONASONG_CONFIG && window.ANONASONG_CONFIG.adminPasswordHash) ||
            '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

        if (hash === configHash) {
            sessionStorage.setItem('anonasong_admin_logged_in', 'true');
            this.isLoggedIn = true;
            this.showAdminPanel();
        } else {
            alert('Incorrect password');
            passwordInput.value = '';
        }
    }

    showAdminPanel() {
        const loginDiv = document.getElementById('adminLogin');
        const panelDiv = document.getElementById('adminPanel');

        loginDiv.classList.add('hidden');
        panelDiv.classList.remove('hidden');

        this.loadStats();
        this.loadRecentFlowers();
        this.loadSpamSettings();
        this.setupEventListeners();
    }

    loadStats() {
        const stats = this.gardenManager.getTotalStats();
        document.getElementById('totalGardens').textContent = stats.totalGardens;
        document.getElementById('totalFlowers').textContent = stats.totalFlowers;
        
        // Count flagged content (simplified - in real app would track actual flags)
        document.getElementById('flaggedContent').textContent = '0';
    }

    loadRecentFlowers() {
        const recentFlowersDiv = document.getElementById('recentFlowers');
        const allFlowers = this.gardenManager.getAllFlowers();
        
        recentFlowersDiv.innerHTML = '';

        // Show last 50 flowers
        allFlowers.slice(0, 50).forEach(item => {
            const flowerDiv = document.createElement('div');
            flowerDiv.className = 'admin-item';
            
            const embed = item.flower.embed || this.createEmbed(item.flower.song);
            const displaySong = embed ? 'Embedded Song' : item.flower.song;
            
            flowerDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-name">Garden: ${item.name}</div>
                    <div class="item-song">Song: ${this.escapeHtml(displaySong)}</div>
                    ${item.flower.note ? `<div class="item-song">Note: ${this.escapeHtml(item.flower.note)}</div>` : ''}
                    <div class="item-date">${this.formatDate(item.flower.plantedAt)}</div>
                </div>
                <button class="delete-btn" data-name="${item.name}" data-garden="${item.gardenIndex}" data-flower="${item.flower.id}">Delete</button>
            `;
            
            recentFlowersDiv.appendChild(flowerDiv);
        });

        // Add delete event listeners
        recentFlowersDiv.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Are you sure you want to delete this flower?')) {
                    const name = e.target.dataset.name;
                    const gardenIndex = parseInt(e.target.dataset.garden);
                    const flowerId = parseFloat(e.target.dataset.flower);
                    
                    this.gardenManager.removeFlower(name, gardenIndex, flowerId);
                    this.loadRecentFlowers();
                    this.loadStats();
                }
            });
        });
    }

    loadSpamSettings() {
        const settings = this.gardenManager.loadSpamSettings();
        document.getElementById('enableSpamFilter').checked = settings.enabled;
        document.getElementById('bannedWords').value = settings.bannedWords.join('\n');
    }

    setupEventListeners() {
        // Spam filter toggle
        document.getElementById('enableSpamFilter').addEventListener('change', (e) => {
            const settings = this.gardenManager.loadSpamSettings();
            settings.enabled = e.target.checked;
            localStorage.setItem('anonasong_spam_settings', JSON.stringify(settings));
        });

        // Save banned words
        document.getElementById('saveBannedWords').addEventListener('click', () => {
            const settings = this.gardenManager.loadSpamSettings();
            const bannedWords = document.getElementById('bannedWords').value
                .split('\n')
                .map(word => word.trim())
                .filter(word => word.length > 0);
            
            settings.bannedWords = bannedWords;
            localStorage.setItem('anonasong_spam_settings', JSON.stringify(settings));
            alert('Spam settings saved!');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            sessionStorage.removeItem('anonasong_admin_logged_in');
            window.location.reload();
        });
    }

    createEmbed(songInput) {
        // Check if it's a Spotify embed
        if (songInput.includes('spotify.com')) {
            const match = songInput.match(/track\/([a-zA-Z0-9]+)/);
            if (match) {
                return `Spotify Track: ${match[1]}`;
            }
        }
        
        // Check if it's a YouTube embed
        if (songInput.includes('youtube.com') || songInput.includes('youtu.be')) {
            const match = songInput.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            if (match) {
                return `YouTube Video: ${match[1]}`;
            }
        }
        
        return null;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
}

// Copy GardenManager class from script.js
class GardenManager {
    constructor() {
        this.gardens = this.loadGardens();
        this.flowerTypes = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌵', '🌿', '💐', '🏵️'];
    }

    loadGardens() {
        const stored = localStorage.getItem('anonasong_gardens');
        return stored ? JSON.parse(stored) : {};
    }

    saveGardens() {
        localStorage.setItem('anonasong_gardens', JSON.stringify(this.gardens));
    }

    removeFlower(name, gardenIndex, flowerId) {
        const normalizedName = name.toLowerCase().trim();
        if (!this.gardens[normalizedName] || !this.gardens[normalizedName][gardenIndex]) return;
        
        this.gardens[normalizedName][gardenIndex].flowers = 
            this.gardens[normalizedName][gardenIndex].flowers.filter(f => f.id !== flowerId);
        
        // Remove empty gardens (except the first one)
        if (gardenIndex > 0 && this.gardens[normalizedName][gardenIndex].flowers.length === 0) {
            this.gardens[normalizedName].splice(gardenIndex, 1);
        }
        
        this.saveGardens();
    }

    getTotalStats() {
        let totalGardens = 0;
        let totalFlowers = 0;
        
        Object.values(this.gardens).forEach(gardensArray => {
            totalGardens += gardensArray.length;
            gardensArray.forEach(garden => {
                totalFlowers += garden.flowers.length;
            });
        });
        
        return { totalGardens, totalFlowers };
    }

    getAllFlowers() {
        const allFlowers = [];
        Object.entries(this.gardens).forEach(([name, gardensArray]) => {
            gardensArray.forEach((garden, gardenIndex) => {
                garden.flowers.forEach(flower => {
                    allFlowers.push({
                        name,
                        gardenIndex,
                        flower
                    });
                });
            });
        });
        return allFlowers.sort((a, b) => b.flower.plantedAt - a.flower.plantedAt);
    }

    loadSpamSettings() {
        const stored = localStorage.getItem('anonasong_spam_settings');
        return stored ? JSON.parse(stored) : {
            enabled: true,
            bannedWords: ['spam', 'viagra', 'casino', 'xxx']
        };
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});
