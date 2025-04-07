document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const numberGrid = document.getElementById('number-grid');
    const locationName = document.getElementById('location-name');
    const completionPercentage = document.getElementById('completion-percentage');
    const mainProgress = document.getElementById('main-progress');
    const newFileBtn = document.getElementById('new-file-btn');
    const hexValue1 = document.getElementById('hex-value-1');
    const hexValue2 = document.getElementById('hex-value-2');
    const zoomIndicator = document.getElementById('zoom-indicator');
    
    // Performance mode - reduces grid size for testing
    let performanceMode = false;
    
    // Add performance mode toggle key (press 'P' to toggle)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            performanceMode = !performanceMode;
            alert(`Performance mode ${performanceMode ? 'enabled' : 'disabled'}. Grid will update on next refresh.`);
            initGame();
        }
    });
    
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
    
    // Zoom state
    let zoomLevel = 1; // 1 = normal, >1 = zoomed in, <1 = zoomed out
    const zoomStep = 0.1;
    const maxZoom = 2;
    const minZoom = 0.5;
    let zoomIndicatorTimeout;
    
    // Calculate how many numbers to generate based on viewport size
    function calculateNumbersCount() {
        // For "almost infinite" grid, multiply by a large factor
        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        
        // Calculate base dimensions
        // For horizontal expansion, use much larger width factor
        const columns = Math.floor(viewportWidth * (performanceMode ? 1 : 4) / 35);
        const rows = Math.floor((viewportHeight * 0.6) / 35);
        
        // Multiply by a large factor to create an "almost infinite" grid
        // Use a factor that's large but not so large it crashes browsers
        const infinityFactor = performanceMode ? 2 : 7;
        
        return Math.max(columns * rows * infinityFactor, performanceMode ? 500 : 2000);
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
        
        // Reset zoom level
        zoomLevel = 1;
        updateZoom();
        
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
        
        // Initialize zoom functionality
        setupZoom();
    }
    
    // Setup zoom functionality
    function setupZoom() {
        // Add wheel event listener to the number grid
        numberGrid.addEventListener('wheel', (e) => {
            // Prevent default scrolling behavior
            e.preventDefault();
            
            // Determine zoom direction
            if (e.deltaY < 0) {
                // Scroll up - zoom in
                zoomLevel = Math.min(maxZoom, zoomLevel + zoomStep);
            } else {
                // Scroll down - zoom out
                zoomLevel = Math.max(minZoom, zoomLevel - zoomStep);
            }
            
            updateZoom();
        });
        
        // Keyboard shortcuts for zooming
        document.addEventListener('keydown', (e) => {
            // Use + and - keys for zooming
            if (e.key === '+' || e.key === '=') {
                // Zoom in
                zoomLevel = Math.min(maxZoom, zoomLevel + zoomStep);
                updateZoom();
            } else if (e.key === '-' || e.key === '_') {
                // Zoom out
                zoomLevel = Math.max(minZoom, zoomLevel - zoomStep);
                updateZoom();
            } else if (e.key === '0') {
                // Reset zoom
                zoomLevel = 1;
                updateZoom();
            }
            
            // Grid navigation with arrow keys and WASD
            const gridWrapper = document.querySelector('.number-grid-wrapper');
            const scrollAmount = 40; // Pixels to scroll per keypress
            
            // Arrow keys and WASD for navigation
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    gridWrapper.scrollBy(0, -scrollAmount);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    gridWrapper.scrollBy(0, scrollAmount);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    gridWrapper.scrollBy(-scrollAmount * 2, 0); // Double horizontal scroll amount
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    gridWrapper.scrollBy(scrollAmount * 2, 0); // Double horizontal scroll amount
                    break;
            }
        });
        
        // Setup cursor-based scrolling for the grid wrapper
        setupCursorScroll();
    }
    
    // Setup cursor-based scrolling
    function setupCursorScroll() {
        const gridWrapper = document.querySelector('.number-grid-wrapper');
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;
        
        // When mouse button is pressed down
        gridWrapper.addEventListener('mousedown', (e) => {
            // Skip if we clicked directly on a number (to preserve selection behavior)
            if (e.target.classList.contains('number')) {
                return;
            }
            
            isDragging = true;
            gridWrapper.style.cursor = 'grabbing';
            startX = e.clientX;
            startY = e.clientY;
            scrollLeft = gridWrapper.scrollLeft;
            scrollTop = gridWrapper.scrollTop;
            
            // Prevent default behavior
            e.preventDefault();
        });
        
        // When mouse moves
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const x = e.clientX - startX;
            const y = e.clientY - startY;
            
            // Scroll the grid wrapper based on cursor movement
            gridWrapper.scrollTo({
                left: scrollLeft - x,
                top: scrollTop - y,
                behavior: 'auto' // Direct dragging
            });
        });
        
        // When mouse button is released
        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            gridWrapper.style.cursor = 'default';
        });
        
        // When mouse leaves the window
        window.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                gridWrapper.style.cursor = 'default';
            }
        });
        
        // Prevent drag interference
        gridWrapper.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    // Update zoom level visual
    function updateZoom() {
        // Get grid wrapper for scroll position
        const gridWrapper = document.querySelector('.number-grid-wrapper');
        
        // Calculate the center of the viewport in the grid's coordinate system
        const viewportWidth = gridWrapper.clientWidth;
        const viewportHeight = gridWrapper.clientHeight;
        const scrollLeft = gridWrapper.scrollLeft;
        const scrollTop = gridWrapper.scrollTop;
        
        // Calculate the center point (where we want to zoom around)
        const centerX = scrollLeft + viewportWidth / 2;
        const centerY = scrollTop + viewportHeight / 2;
        
        // Remove existing zoom classes
        numberGrid.classList.remove('zoomed-in', 'zoomed-out');
        
        // Apply custom scale transform
        numberGrid.style.transform = `scale(${zoomLevel})`;
        
        // Apply appropriate class for additional styling if needed
        if (zoomLevel > 1) {
            numberGrid.classList.add('zoomed-in');
        } else if (zoomLevel < 1) {
            numberGrid.classList.add('zoomed-out');
        }
        
        // Adjust scroll position to maintain center point after zoom
        gridWrapper.scrollLeft = centerX - viewportWidth / 2;
        gridWrapper.scrollTop = centerY - viewportHeight / 2;
        
        // Update zoom indicator
        zoomIndicator.textContent = `Zoom: ${Math.round(zoomLevel * 100)}%`;
        zoomIndicator.classList.remove('hidden');
        
        // Hide indicator after delay
        clearTimeout(zoomIndicatorTimeout);
        zoomIndicatorTimeout = setTimeout(() => {
            zoomIndicator.classList.add('hidden');
        }, 2000);
    }
    
    // Generate random numbers for the grid
    function generateNumbers() {
        // Calculate number of columns to help with hover effects
        const gridStyle = window.getComputedStyle(numberGrid);
        const gridTemplateColumns = gridStyle.getPropertyValue('grid-template-columns');
        gameState.gridColumns = gridTemplateColumns.split(' ').length;
        
        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < gameState.totalNumbers; i++) {
            const number = document.createElement('div');
            number.className = 'number';
            number.dataset.index = i;
            
            // Random single digit
            const randomNum = Math.floor(Math.random() * 10);
            number.textContent = randomNum;
            number.dataset.value = randomNum;
            
            // Add randomized floating animation properties
            // Random x and y offset for floating (small enough to not break the grid layout)
            const xOffset = (Math.random() * 6) - 3; // -3px to +3px
            const yOffset = (Math.random() * 6) - 3; // -3px to +3px
            
            // Random animation delay (creates more organic movement)
            const delay = Math.random() * 2000; // 0-2000ms delay
            
            // Apply as CSS custom properties
            number.style.setProperty('--x-offset', xOffset);
            number.style.setProperty('--y-offset', yOffset);
            number.style.setProperty('--animation-delay', delay);
            
            // No need for individual click handlers with event delegation
            
            fragment.appendChild(number);
            gameState.gridNumbers.push(number);
        }
        
        // Append all numbers at once
        numberGrid.appendChild(fragment);
    }
    
    // Setup hover effects for neighboring numbers
    function setupHoverEffects() {
        // Use event delegation instead of attaching listeners to each element
        numberGrid.addEventListener('mouseover', (e) => {
            const target = e.target;
            // Check if the hovered element is a number
            if (target.classList.contains('number')) {
                highlightNeighbors(target);
            }
        });
        
        numberGrid.addEventListener('mouseout', (e) => {
            const target = e.target;
            // Only reset highlights when moving out of a number
            if (target.classList.contains('number')) {
                resetHighlights();
            }
        });
        
        // Use event delegation for clicks too
        numberGrid.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('number')) {
                selectNumber(target);
            }
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
                const centerCol = index % cols;
                const neighborCol = neighborIndex % cols;
                
                // Make sure we're not wrapping to the next/previous row incorrectly
                // Check both row and column differences to prevent wrapping
                if (Math.abs(centerRow - neighborRow) <= 1 && Math.abs(centerCol - neighborCol) <= 1) {
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
        // Calculate percentage based on visible grid numbers that are processed
        // This way, users can still complete the task even with an "infinite" grid
        let visibleTotal = 0;
        let visibleCompleted = 0;
        
        gameState.gridNumbers.forEach(number => {
            // Check if element is at least partially visible in viewport
            const rect = number.getBoundingClientRect();
            const isVisible = (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
                rect.bottom >= 0 &&
                rect.right >= 0
            );
            
            if (isVisible) {
                visibleTotal++;
                if (number.style.opacity === '0.3') {
                    visibleCompleted++;
                }
            }
        });
        
        // Use visible numbers as the basis for completion percentage
        // If no visible numbers, fall back to overall count with a minimum threshold
        const percentage = visibleTotal > 0 ? 
            Math.floor((visibleCompleted / visibleTotal) * 100) : 
            Math.floor((gameState.completedNumbers / Math.min(500, gameState.totalNumbers)) * 100);
        
        completionPercentage.textContent = `${percentage}% Complete`;
        mainProgress.style.width = `${percentage}%`;
        
        // Check if the file is complete (visible area is processed)
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