document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const numberGrid = document.getElementById('number-grid');
    const locationName = document.getElementById('location-name');
    const completionPercentage = document.getElementById('completion-percentage');
    const mainProgress = document.getElementById('main-progress');
    const newFileBtn = document.getElementById('new-file-btn');
    const hexValue1 = document.getElementById('hex-value-1');
    const hexValue2 = document.getElementById('hex-value-2');
    
    // Bin progress elements
    const binProgressElements = {
        1: document.getElementById('bin-1-progress'),
        2: document.getElementById('bin-2-progress'),
        3: document.getElementById('bin-3-progress'),
        4: document.getElementById('bin-4-progress'),
        5: document.getElementById('bin-5-progress')
    };
    
    // Bin percentage elements
    const binPercentageElements = {
        1: document.getElementById('bin-1-percentage'),
        2: document.getElementById('bin-2-percentage'),
        3: document.getElementById('bin-3-percentage'),
        4: document.getElementById('bin-4-percentage'),
        5: document.getElementById('bin-5-percentage')
    };
    
    // Location names from Severance
    const locations = [
        'Cold Harbor', 'Dranesville', 'Gaines Mill', 
        'Lexington', 'Malvern Hill', 'Manassas', 
        'Seven Pines', 'The Wilderness', 'Antietam',
        'Gettysburg', 'Fredericksburg', 'Cedar Creek'
    ];
    
    // Calculate how many numbers to generate based on viewport size
    function calculateNumbersCount() {
        // Estimate based on screen size
        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        
        // Approximate how many cells will fit in the grid
        // Assuming each cell is about 35px (including gap)
        const columns = Math.floor(viewportWidth * 0.9 / 35);
        const rows = Math.floor((viewportHeight * 0.6) / 35);
        
        // Ensure we have at least 20x20 = 400 numbers
        return Math.max(columns * rows, 400);
    }
    
    // Game state
    let gameState = {
        totalNumbers: calculateNumbersCount(),
        selectedNumbers: [],
        completedNumbers: 0,
        bins: {
            1: { progress: 0, max: 30 },
            2: { progress: 0, max: 30 },
            3: { progress: 0, max: 30 },
            4: { progress: 0, max: 30 },
            5: { progress: 0, max: 30 }
        },
        gridColumns: 0,
        gridNumbers: []
    };
    
    // Initialize the game
    function initGame() {
        // Update the total numbers count based on current viewport
        gameState.totalNumbers = calculateNumbersCount();
        
        // Clear the grid
        numberGrid.innerHTML = '';
        
        // Reset game state
        gameState.selectedNumbers = [];
        gameState.completedNumbers = 0;
        gameState.gridNumbers = [];
        
        // Set bins progress to 0
        for (let bin = 1; bin <= 5; bin++) {
            gameState.bins[bin].progress = 0;
            updateBinProgress(bin);
        }
        
        // Set random location
        locationName.textContent = locations[Math.floor(Math.random() * locations.length)];
        
        // Generate random hex values
        hexValue1.textContent = '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
        hexValue2.textContent = '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
        
        // Generate numbers for the grid
        generateNumbers();
        
        // Update progress
        updateProgress();
        
        // Add hover effects
        setupHoverEffects();
        
        // Initialize bins for click interaction
        initBins();
    }
    
    // Generate random numbers for the grid
    function generateNumbers() {
        // Calculate number of columns to help with hover effects
        const gridStyle = window.getComputedStyle(numberGrid);
        const gridTemplateColumns = gridStyle.getPropertyValue('grid-template-columns');
        gameState.gridColumns = gridTemplateColumns.split(' ').length;
        
        for (let i = 0; i < gameState.totalNumbers; i++) {
            const number = document.createElement('div');
            number.className = 'number';
            number.dataset.index = i;
            
            // Random single digit
            const randomNum = Math.floor(Math.random() * 10);
            number.textContent = randomNum;
            number.dataset.value = randomNum;
            
            // Make numbers selectable
            number.addEventListener('click', () => {
                selectNumber(number);
            });
            
            numberGrid.appendChild(number);
            gameState.gridNumbers.push(number);
        }
    }
    
    // Setup hover effects for neighboring numbers
    function setupHoverEffects() {
        const numberElements = document.querySelectorAll('.number');
        
        numberElements.forEach(number => {
            number.addEventListener('mouseenter', () => {
                highlightNeighbors(number);
            });
            
            number.addEventListener('mouseleave', () => {
                resetHighlights();
            });
        });
    }
    
    // Highlight neighboring numbers
    function highlightNeighbors(centerNumber) {
        const index = parseInt(centerNumber.dataset.index);
        const cols = gameState.gridColumns;
        
        // Calculate neighbor indices
        const neighbors = [
            index - cols - 1, index - cols, index - cols + 1,  // Above
            index - 1,                     index + 1,          // Sides
            index + cols - 1, index + cols, index + cols + 1   // Below
        ];
        
        // Highlight neighbors
        neighbors.forEach(neighborIndex => {
            if (neighborIndex >= 0 && neighborIndex < gameState.gridNumbers.length) {
                const neighborNumber = gameState.gridNumbers[neighborIndex];
                // Only highlight if it's a direct neighbor (handles edge cases)
                const centerRow = Math.floor(index / cols);
                const neighborRow = Math.floor(neighborIndex / cols);
                
                // Make sure we're not wrapping to the next/previous row incorrectly
                if (Math.abs(centerRow - neighborRow) <= 1) {
                    neighborNumber.classList.add('neighbor-highlight');
                }
            }
        });
        
        // Add the primary highlight to the hovered number
        centerNumber.classList.add('primary-highlight');
    }
    
    // Reset all highlights
    function resetHighlights() {
        document.querySelectorAll('.primary-highlight').forEach(el => {
            el.classList.remove('primary-highlight');
        });
        
        document.querySelectorAll('.neighbor-highlight').forEach(el => {
            el.classList.remove('neighbor-highlight');
        });
    }
    
    // Select a number
    function selectNumber(numberElement) {
        // Don't allow selection of already processed numbers
        if (numberElement.style.opacity === '0.3') {
            return;
        }
        
        // Toggle selection
        if (numberElement.classList.contains('selected')) {
            numberElement.classList.remove('selected');
            gameState.selectedNumbers = gameState.selectedNumbers.filter(n => n !== numberElement);
        } else {
            numberElement.classList.add('selected');
            gameState.selectedNumbers.push(numberElement);
        }
        
        // Update UI to show active selection
        updateSelectionStatus();
    }
    
    // Update the UI to reflect the current selection status
    function updateSelectionStatus() {
        // If there are selected numbers, highlight the bins to indicate they can be clicked
        const bins = document.querySelectorAll('.bin');
        
        if (gameState.selectedNumbers.length > 0) {
            bins.forEach(bin => {
                bin.classList.add('bin-active');
            });
        } else {
            bins.forEach(bin => {
                bin.classList.remove('bin-active');
            });
        }
    }
    
    // Initialize bin clickable areas
    function initBins() {
        const bins = document.querySelectorAll('.bin');
        
        bins.forEach((bin) => {
            const binIndex = Array.from(bins).indexOf(bin) + 1;
            
            // Make bins clickable to add selected numbers
            bin.addEventListener('click', () => {
                if (gameState.selectedNumbers.length > 0) {
                    // Visual feedback
                    bin.classList.add('bin-clicked');
                    setTimeout(() => {
                        bin.classList.remove('bin-clicked');
                    }, 200);
                    
                    // Add all selected numbers to this bin
                    gameState.selectedNumbers.forEach(number => {
                        addNumberToBin(number, binIndex);
                    });
                    
                    // Clear selection
                    gameState.selectedNumbers = [];
                    
                    // Update progress
                    updateProgress();
                    
                    // Update UI
                    updateSelectionStatus();
                }
            });
            
            // Hover effect for bins
            bin.addEventListener('mouseenter', () => {
                if (gameState.selectedNumbers.length > 0) {
                    bin.classList.add('bin-hover');
                }
            });
            
            bin.addEventListener('mouseleave', () => {
                bin.classList.remove('bin-hover');
            });
        });
    }
    
    // Add a number to a bin
    function addNumberToBin(numberElement, binIndex) {
        // Mark the number as processed
        numberElement.classList.remove('selected');
        numberElement.style.opacity = '0.3';
        numberElement.style.pointerEvents = 'none';
        
        // Increment the bin's progress
        gameState.bins[binIndex].progress++;
        if (gameState.bins[binIndex].progress > gameState.bins[binIndex].max) {
            gameState.bins[binIndex].progress = gameState.bins[binIndex].max;
        }
        
        // Update the bin's visual progress
        updateBinProgress(binIndex);
        
        // Increment completed numbers
        gameState.completedNumbers++;
    }
    
    // Update a bin's progress display
    function updateBinProgress(binIndex) {
        const progress = gameState.bins[binIndex].progress;
        const max = gameState.bins[binIndex].max;
        const percentage = Math.floor((progress / max) * 100);
        
        binProgressElements[binIndex].style.width = `${percentage}%`;
        binPercentageElements[binIndex].textContent = `${percentage}%`;
    }
    
    // Update overall progress
    function updateProgress() {
        const percentage = Math.floor((gameState.completedNumbers / gameState.totalNumbers) * 100);
        completionPercentage.textContent = `${percentage}% Complete`;
        mainProgress.style.width = `${percentage}%`;
        
        // Check if the file is complete
        if (percentage >= 100) {
            setTimeout(() => {
                alert('File processing complete! Praise Kier!');
                initGame();
            }, 1000);
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Only reinitialize if the grid size would change significantly
        const newCount = calculateNumbersCount();
        if (Math.abs(newCount - gameState.totalNumbers) > 100) {
            initGame();
        }
    });
    
    // New file button
    newFileBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to start a new file?')) {
            initGame();
        }
    });
    
    // Initialize the game
    initGame();
}); 