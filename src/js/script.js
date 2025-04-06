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
    
    // Game state
    let gameState = {
        totalNumbers: 400, // 20x20 grid
        selectedNumbers: [],
        completedNumbers: 0,
        bins: {
            1: { progress: 0, max: 30 },
            2: { progress: 0, max: 30 },
            3: { progress: 0, max: 30 },
            4: { progress: 0, max: 30 },
            5: { progress: 0, max: 30 }
        },
        draggedNumber: null
    };
    
    // Initialize the game
    function initGame() {
        // Clear the grid
        numberGrid.innerHTML = '';
        
        // Reset game state
        gameState.selectedNumbers = [];
        gameState.completedNumbers = 0;
        
        // Set random progress for bins
        for (let bin = 1; bin <= 5; bin++) {
            gameState.bins[bin].progress = Math.floor(Math.random() * gameState.bins[bin].max);
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
    }
    
    // Generate random numbers for the grid
    function generateNumbers() {
        for (let i = 0; i < gameState.totalNumbers; i++) {
            const number = document.createElement('div');
            number.className = 'number';
            
            // Random single digit
            const randomNum = Math.floor(Math.random() * 10);
            number.textContent = randomNum;
            number.dataset.value = randomNum;
            
            // Make numbers selectable
            number.addEventListener('click', () => {
                selectNumber(number);
            });
            
            // Make numbers draggable
            number.setAttribute('draggable', true);
            number.addEventListener('dragstart', (e) => {
                number.classList.add('dragging');
                gameState.draggedNumber = number;
                e.dataTransfer.setData('text/plain', number.dataset.value);
            });
            
            number.addEventListener('dragend', () => {
                number.classList.remove('dragging');
                gameState.draggedNumber = null;
            });
            
            numberGrid.appendChild(number);
        }
    }
    
    // Select a number
    function selectNumber(numberElement) {
        // Toggle selection
        if (numberElement.classList.contains('selected')) {
            numberElement.classList.remove('selected');
            gameState.selectedNumbers = gameState.selectedNumbers.filter(n => n !== numberElement);
        } else {
            numberElement.classList.add('selected');
            gameState.selectedNumbers.push(numberElement);
        }
    }
    
    // Initialize bin droppable areas
    function initBins() {
        const bins = document.querySelectorAll('.bin');
        
        bins.forEach((bin) => {
            const binIndex = Array.from(bins).indexOf(bin) + 1;
            
            bin.addEventListener('dragover', (e) => {
                e.preventDefault();
                bin.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';
            });
            
            bin.addEventListener('dragleave', () => {
                bin.style.backgroundColor = '';
            });
            
            bin.addEventListener('drop', (e) => {
                e.preventDefault();
                bin.style.backgroundColor = '';
                
                if (gameState.draggedNumber || gameState.selectedNumbers.length > 0) {
                    // If dragging a number, add it to the bin
                    if (gameState.draggedNumber) {
                        addNumberToBin(gameState.draggedNumber, binIndex);
                    }
                    
                    // If numbers are selected, add them all to the bin
                    if (gameState.selectedNumbers.length > 0) {
                        gameState.selectedNumbers.forEach(number => {
                            addNumberToBin(number, binIndex);
                        });
                        gameState.selectedNumbers = [];
                    }
                    
                    // Update progress
                    updateProgress();
                }
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
    
    // New file button
    newFileBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to start a new file?')) {
            initGame();
        }
    });
    
    // Initialize bins for drag and drop
    initBins();
    
    // Initialize the game
    initGame();
}); 