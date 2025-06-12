// Data Management
export default class GardenManager {
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

    getGarden(name, index = 0) {
        const normalizedName = name.toLowerCase().trim();
        if (!this.gardens[normalizedName]) return null;
        return this.gardens[normalizedName][index] || null;
    }

    getGardensForName(name) {
        const normalizedName = name.toLowerCase().trim();
        return this.gardens[normalizedName] || [];
    }

    addFlower(name, flower) {
        const normalizedName = name.toLowerCase().trim();

        // Check spam filter
        if (this.isSpam(flower.song) || this.isSpam(flower.note)) {
            return false;
        }

        if (!this.gardens[normalizedName]) {
            this.gardens[normalizedName] = [{ flowers: [], createdAt: Date.now() }];
        }

        const currentGarden = this.gardens[normalizedName][0];

        // Create new garden if current is full
        if (currentGarden.flowers.length >= 25) {
            this.gardens[normalizedName].unshift({ flowers: [], createdAt: Date.now() });
        }

        // Add flower with random type
        flower.type = this.flowerTypes[Math.floor(Math.random() * this.flowerTypes.length)];
        flower.id = Date.now() + Math.random();
        flower.plantedAt = Date.now();

        this.gardens[normalizedName][0].flowers.push(flower);
        this.saveGardens();
        return true;
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

    getRandomGarden() {
        const names = Object.keys(this.gardens).filter(name =>
            this.gardens[name].some(g => g.flowers.length > 0)
        );
        if (names.length === 0) return null;

        const randomName = names[Math.floor(Math.random() * names.length)];
        return {
            name: randomName,
            displayName: this.gardens[randomName][0].displayName || randomName,
            garden: this.gardens[randomName][0]
        };
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

    isSpam(text) {
        if (!text) return false;

        const spamSettings = this.loadSpamSettings();
        if (!spamSettings.enabled) return false;

        const lowerText = text.toLowerCase();
        return spamSettings.bannedWords.some(word =>
            word && lowerText.includes(word.toLowerCase())
        );
    }

    loadSpamSettings() {
        const stored = localStorage.getItem('anonasong_spam_settings');
        return stored ? JSON.parse(stored) : {
            enabled: true,
            bannedWords: ['spam', 'viagra', 'casino', 'xxx']
        };
    }
}
