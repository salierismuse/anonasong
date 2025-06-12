import GardenManager from './gardenManager.js';

// Embed handling
function sanitizeEmbed(html) {
    if (!html) return '';

    const div = document.createElement('div');
    div.innerHTML = html;
    const iframe = div.querySelector('iframe');
    if (!iframe) return '';

    const src = iframe.getAttribute('src') || '';
    const allowed = [
        'https://www.youtube.com/embed/',
        'https://open.spotify.com/embed/'
    ];

    if (!allowed.some(prefix => src.startsWith(prefix))) {
        return '';
    }

    const clean = document.createElement('iframe');
    clean.setAttribute('src', src);
    if (iframe.getAttribute('width')) clean.setAttribute('width', iframe.getAttribute('width'));
    if (iframe.getAttribute('height')) clean.setAttribute('height', iframe.getAttribute('height'));
    if (iframe.getAttribute('allow')) clean.setAttribute('allow', iframe.getAttribute('allow'));
    if (iframe.getAttribute('allowfullscreen') !== null) clean.setAttribute('allowfullscreen', '');
    if (iframe.getAttribute('allowtransparency') !== null) clean.setAttribute('allowtransparency', 'true');
    clean.setAttribute('frameborder', '0');

    return clean.outerHTML;
}

function createEmbed(songInput) {
    // Check if it's a Spotify embed
    if (songInput.includes('spotify.com')) {
        const match = songInput.match(/track\/([a-zA-Z0-9]+)/);
        if (match) {
            return sanitizeEmbed(`<iframe src="https://open.spotify.com/embed/track/${match[1]}" width="100%" height="152" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`);
        }
    }

    // Check if it's a YouTube embed
    if (songInput.includes('youtube.com') || songInput.includes('youtu.be')) {
        const match = songInput.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (match) {
            return sanitizeEmbed(`<iframe width="100%" height="200" src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
        }
    }

    // Check if it's already an iframe
    if (songInput.includes('<iframe')) {
        return sanitizeEmbed(songInput);
    }

    // Otherwise, treat as title/artist
    return null;
}

// Word count utility
function countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `planted ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        }
        return `planted ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
        return 'planted yesterday';
    } else if (diffDays < 30) {
        return `planted ${diffDays} days ago`;
    } else {
        return `planted on ${date.toLocaleDateString()}`;
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
const gardenManager = new GardenManager();

// Page-specific initialization
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '') {
        initHomepage();
    } else if (currentPage === 'garden.html') {
        initGardenPage();
    }
});

// Homepage functionality
function initHomepage() {
    const searchInput = document.getElementById('nameSearch');
    const searchBtn = document.getElementById('searchBtn');
    const randomGardenPreview = document.getElementById('randomGardenPreview');
    
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    function handleSearch() {
        const name = searchInput.value.trim();
        if (name && name.length <= 15) {
            window.location.href = `garden.html?name=${encodeURIComponent(name)}`;
        }
    }
    
    // Display random garden
    function displayRandomGarden() {
        const random = gardenManager.getRandomGarden();
        
        if (random) {
            const flowerPreview = random.garden.flowers.slice(0, 5)
                .map(f => `<span class="preview-flower">${f.type}</span>`)
                .join('');
            
            const safeName = escapeHtml(random.displayName || random.name);
            randomGardenPreview.innerHTML = `
                <h3 class="preview-name">${safeName}'s garden</h3>
                <div class="preview-flowers">${flowerPreview}</div>
                <p class="preview-count">${random.garden.flowers.length} flower${random.garden.flowers.length !== 1 ? 's' : ''}</p>
            `;
            
            randomGardenPreview.onclick = () => {
                window.location.href = `garden.html?name=${encodeURIComponent(random.name)}`;
            };
        } else {
            randomGardenPreview.innerHTML = `
                <p style="color: #718096;">No gardens yet. Be the first to plant a flower!</p>
            `;
        }
    }
    
    displayRandomGarden();
}

// Garden page functionality
function initGardenPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const gardenName = urlParams.get('name');
    
    if (!gardenName) {
        window.location.href = 'index.html';
        return;
    }
    
    let currentGardenIndex = 0;
    const gardens = gardenManager.getGardensForName(gardenName);
    
    // If no gardens exist, create one
    if (gardens.length === 0) {
        gardenManager.gardens[gardenName.toLowerCase().trim()] = [{
            flowers: [],
            createdAt: Date.now(),
            displayName: gardenName
        }];
        gardenManager.saveGardens();
    }
    
    // Elements
    const gardenNameEl = document.getElementById('gardenName');
    const gardenIndexEl = document.getElementById('gardenIndex');
    const prevBtn = document.getElementById('prevGarden');
    const nextBtn = document.getElementById('nextGarden');
    const flowerContainer = document.getElementById('flowerContainer');
    const plantBtn = document.getElementById('plantFlowerBtn');
    
    // Popups
    const flowerPopup = document.getElementById('flowerPopup');
    const plantPopup = document.getElementById('plantPopup');
    const confirmPopup = document.getElementById('confirmPopup');
    
    // Display garden name
    gardenNameEl.textContent = `${gardenName}'s garden`;
    document.getElementById('plantForName').textContent = gardenName;
    
    // Navigation
    function updateNavigation() {
        const gardens = gardenManager.getGardensForName(gardenName);
        prevBtn.disabled = currentGardenIndex >= gardens.length - 1;
        nextBtn.disabled = currentGardenIndex <= 0;
        gardenIndexEl.textContent = `garden ${gardens.length - currentGardenIndex}`;
    }
    
    prevBtn.addEventListener('click', () => {
        currentGardenIndex++;
        displayGarden();
    });
    
    nextBtn.addEventListener('click', () => {
        currentGardenIndex--;
        displayGarden();
    });
    
    // Display flowers
    function displayGarden() {
        const garden = gardenManager.getGarden(gardenName, currentGardenIndex);
        if (!garden) return;
        
        flowerContainer.innerHTML = '';
        
        garden.flowers.forEach((flower, index) => {
            const flowerEl = document.createElement('div');
            flowerEl.className = 'flower';
            flowerEl.innerHTML = `<span class="flower-icon">${flower.type}</span>`;
            
            // Random positioning within circular garden
            const angle = Math.random() * Math.PI * 2;
            const maxRadius = 180; // pixels from center (keep flowers inside island)
            const minRadius = 30; // minimum distance from center
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            
            // Convert to percentage based on container size (450px)
            const containerSize = 450;
            const x = 50 + (radius * Math.cos(angle) / containerSize) * 100;
            const y = 50 + (radius * Math.sin(angle) / containerSize) * 100;
            
            flowerEl.style.left = `${x}%`;
            flowerEl.style.top = `${y}%`;
            
            // Add delay to animation
            flowerEl.style.animationDelay = `${index * 0.1}s`;
            
            flowerEl.addEventListener('click', () => showFlowerDetails(flower));
            flowerContainer.appendChild(flowerEl);
        });
        
        updateNavigation();
    }
    
    // Show flower details
    function showFlowerDetails(flower) {
        const rawEmbed = flower.embed || createEmbed(flower.song);
        const embed = sanitizeEmbed(rawEmbed);

        document.getElementById('songEmbed').innerHTML = embed || '';
        document.getElementById('songTitle').textContent = embed ? '' : flower.song;
        document.getElementById('songNote').textContent = flower.note || '';
        document.getElementById('plantDate').textContent = formatDate(flower.plantedAt);
        
        flowerPopup.classList.remove('hidden');
    }
    
    // Plant flower functionality
    plantBtn.addEventListener('click', () => {
        plantPopup.classList.remove('hidden');
        document.getElementById('songInput').value = '';
        document.getElementById('noteInput').value = '';
        updateWordCount();
    });
    
    // Word count
    const noteInput = document.getElementById('noteInput');
    const wordCountEl = document.getElementById('wordCount');
    
    function updateWordCount() {
        const words = countWords(noteInput.value);
        wordCountEl.textContent = `${words}/20 words`;
        wordCountEl.style.color = words > 20 ? '#f56565' : '#718096';
    }
    
    noteInput.addEventListener('input', updateWordCount);
    
    // Plant form submission
    document.getElementById('plantForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const songInput = document.getElementById('songInput').value.trim();
        const note = document.getElementById('noteInput').value.trim();
        
        if (!songInput) return;
        
        // Check word count
        if (countWords(note) > 20) {
            alert('Please keep your note under 20 words.');
            return;
        }
        
        const embed = createEmbed(songInput);
        const flower = {
            song: embed ? 'Embedded Song' : songInput.substring(0, 50),
            embed: embed,
            note: note
        };
        
        if (gardenManager.addFlower(gardenName, flower)) {
            plantPopup.classList.add('hidden');
            confirmPopup.classList.remove('hidden');
            
            // Refresh garden display
            currentGardenIndex = 0;
            displayGarden();
        } else {
            alert('Your message was flagged as spam. Please try again.');
        }
    });
    
    // Close popups
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.popup').classList.add('hidden');
        });
    });
    
    document.querySelector('.close-confirm-btn').addEventListener('click', () => {
        confirmPopup.classList.add('hidden');
    });
    
    // Close popup on background click
    [flowerPopup, plantPopup, confirmPopup].forEach(popup => {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.add('hidden');
            }
        });
    });
    
    // Initial display
    displayGarden();
}
