// Search and Filter System
class SearchManager {
    constructor() {
        this.currentQuery = '';
        this.currentFilter = 'all';
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        console.log('SearchManager initializing...');
        
        // Get search input
        const searchInput = document.getElementById('navSearchInput');
        
        if (!searchInput) {
            console.warn('Search input not found');
            return;
        }

        // Add search listener
        searchInput.addEventListener('input', (e) => {
            this.currentQuery = e.target.value.toLowerCase().trim();
            console.log('Search query:', this.currentQuery);
            this.applyFilters();
        });

        // Add filter chip listeners if they exist
        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = chip.getAttribute('data-filter');
                this.applyFilters();
            });
        });

        this.initialized = true;
        console.log('SearchManager initialized');
    }

    applyFilters() {
        // Get ALL food cards dynamically (they might be added after init)
        const foodCards = document.querySelectorAll('.food-preview');
        
        if (foodCards.length === 0) {
            console.warn('No food cards found');
            return;
        }

        console.log(`Filtering ${foodCards.length} cards with query: "${this.currentQuery}"`);
        
        let visibleCount = 0;
        let hiddenCount = 0;

        foodCards.forEach(card => {
            const foodNameEl = card.querySelector('.food-name');
            
            if (!foodNameEl) {
                console.warn('Food name not found in card', card);
                return;
            }

            const foodName = foodNameEl.textContent.toLowerCase();
            const type = card.getAttribute('data-type') || '';
            const tags = card.getAttribute('data-tags') || '';

            // Check search query
            const matchesSearch = !this.currentQuery || foodName.includes(this.currentQuery);

            // Check category filter
            let matchesFilter = true;
            if (this.currentFilter !== 'all') {
                if (this.currentFilter === 'veg' || this.currentFilter === 'non-veg') {
                    matchesFilter = (type === this.currentFilter);
                } else {
                    matchesFilter = tags.includes(this.currentFilter);
                }
            }

            // Show/Hide card
            if (matchesSearch && matchesFilter) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
                hiddenCount++;
            }
        });

        console.log(`Visible: ${visibleCount}, Hidden: ${hiddenCount}`);

        // Handle empty sections
        this.handleEmptySections();
    }

    handleEmptySections() {
        // Hide sections with no visible cards
        const sections = document.querySelectorAll('.food-1-preview');
        
        sections.forEach(section => {
            const visibleCards = Array.from(section.children).filter(
                child => child.style.display !== 'none'
            );
            
            // Get the section title (previous sibling)
            let titleEl = section.previousElementSibling;
            while (titleEl && !titleEl.classList.contains('food-type-name')) {
                titleEl = titleEl.previousElementSibling;
            }

            if (visibleCards.length > 0) {
                section.style.display = '';
                if (titleEl) titleEl.style.display = '';
            } else {
                section.style.display = 'none';
                if (titleEl) titleEl.style.display = 'none';
            }
        });
    }

    reset() {
        this.currentQuery = '';
        this.currentFilter = 'all';
        const searchInput = document.getElementById('navSearchInput');
        if (searchInput) searchInput.value = '';
        this.applyFilters();
    }
}

// Create global instance
let searchManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    searchManager = new SearchManager();
    searchManager.init();
    
    // Also initialize favorites
    initFavorites();
});

// Re-initialize search after food cards are loaded
// Call this function after renderAllCategories() completes
function initializeSearchAfterRender() {
    if (searchManager) {
        console.log('Re-initializing search after render');
        searchManager.applyFilters();
    }
}

// === FAVORITES SYSTEM ===
function toggleFavorite(event, id) {
    event.stopPropagation();

    let favorites = JSON.parse(localStorage.getItem('khajaTimeFavorites')) || [];
    const index = favorites.indexOf(id);

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(id);
    }

    localStorage.setItem('khajaTimeFavorites', JSON.stringify(favorites));
    updateFavoriteBtnUI(id, index === -1);
}

function initFavorites() {
    const favorites = JSON.parse(localStorage.getItem('khajaTimeFavorites')) || [];
    favorites.forEach(id => {
        updateFavoriteBtnUI(id, true);
    });
}

function updateFavoriteBtnUI(id, isFavorite) {
    const cards = document.querySelectorAll(`.food-preview[data-id="${id}"]`);
    cards.forEach(card => {
        const btn = card.querySelector('.favorite-btn');
        if (btn) {
            if (isFavorite) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="far fa-heart"></i>';
            }
        }
    });
}

class CustomSearchManager {
    constructor() {
        this.currentQuery = '';
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        console.log('Custom Search Manager initializing...');
        
        // Get search elements by ID
        const searchInput = document.getElementById('searchInput');
        const searchForm = document.getElementById('searchForm');
        const resetButton = document.getElementById('resetButton');
        
        if (!searchInput) {
            console.warn('Search input not found');
            return;
        }

        // Prevent form submission
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                return false;
            });
        }

        // Add search listener - filter as user types
        searchInput.addEventListener('input', (e) => {
            this.currentQuery = e.target.value.toLowerCase().trim();
            console.log('Search query:', this.currentQuery);
            this.filterFood();
        });

        // Add reset button listener
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.reset();
            });
        }

        this.initialized = true;
        console.log('Custom Search Manager initialized');
    }

    filterFood() {
        // Get all food cards dynamically
        const foodCards = document.querySelectorAll('.food-preview');
        
        if (foodCards.length === 0) {
            console.warn('No food cards found');
            return;
        }

        console.log(`Filtering ${foodCards.length} cards with query: "${this.currentQuery}"`);
        
        let visibleCount = 0;
        let hiddenCount = 0;

        foodCards.forEach(card => {
            const foodNameEl = card.querySelector('.food-name');
            const foodDescEl = card.querySelector('.food-item-description');
            
            if (!foodNameEl) {
                console.warn('Food name not found in card', card);
                return;
            }

            const foodName = foodNameEl.textContent.toLowerCase();
            const foodDesc = foodDescEl ? foodDescEl.textContent.toLowerCase() : '';

            // Check if search query matches name or description
            const matchesSearch = !this.currentQuery || 
                                  foodName.includes(this.currentQuery) || 
                                  foodDesc.includes(this.currentQuery);

            // Show/Hide card
            if (matchesSearch) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
                hiddenCount++;
            }
        });

        console.log(`Visible: ${visibleCount}, Hidden: ${hiddenCount}`);

        // Handle empty sections
        this.handleEmptySections();
        
        // Show "no results" message if needed
        this.showNoResultsMessage(visibleCount);
    }

    handleEmptySections() {
        // Hide sections with no visible cards
        const sections = document.querySelectorAll('.food-1-preview');
        
        sections.forEach(section => {
            const visibleCards = Array.from(section.children).filter(
                child => child.style.display !== 'none'
            );
            
            // Get the section title (previous sibling)
            let titleEl = section.previousElementSibling;
            while (titleEl && !titleEl.classList.contains('food-type-name')) {
                titleEl = titleEl.previousElementSibling;
            }

            if (visibleCards.length > 0) {
                section.style.display = '';
                if (titleEl) titleEl.style.display = '';
            } else {
                section.style.display = 'none';
                if (titleEl) titleEl.style.display = 'none';
            }
        });
    }

    showNoResultsMessage(visibleCount) {
        // Remove existing no results message
        const existingMsg = document.getElementById('noResultsMessage');
        if (existingMsg) {
            existingMsg.remove();
        }

        // If no results and there's a search query, show message
        if (visibleCount === 0 && this.currentQuery) {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                const noResultsDiv = document.createElement('div');
                noResultsDiv.id = 'noResultsMessage';
                noResultsDiv.style.cssText = `
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                `;
                noResultsDiv.innerHTML = `
                    <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                    <h2 style="font-size: 24px; margin-bottom: 10px;">No results found</h2>
                    <p style="font-size: 16px;">Try searching for something else</p>
                `;
                mainContent.insertBefore(noResultsDiv, mainContent.firstChild);
            }
        }
    }

    reset() {
        this.currentQuery = '';
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        this.filterFood();
        console.log('Search reset');
    }
}

// Create global instance
let customSearchManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    customSearchManager = new CustomSearchManager();
    customSearchManager.init();
});

// Re-initialize search after food cards are loaded
// Call this function after renderAllCategories() completes
function initializeCustomSearchAfterRender() {
    if (customSearchManager) {
        console.log('Re-initializing custom search after render');
        customSearchManager.filterFood();
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.customSearchManager = customSearchManager;
    window.initializeCustomSearchAfterRender = initializeCustomSearchAfterRender;
}

