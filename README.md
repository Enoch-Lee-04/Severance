# Severance MDR Task Simulator

This project is a web-based simulator of the Macro Data Refinement (MDR) task from the Apple TV+ show "Severance." It recreates the retro computer interface that the MDR department employees use to categorize numbers based on how they "feel."

## Features

- Authentic retro computer interface inspired by the show
- Personalized login system with welcome screen
- Dynamic grid of numbers that adapts to screen size
- Five different "emotion" bins to sort numbers into:
  - Scary (Bin 1)
  - Sad (Bin 2)
  - Happy (Bin 3)
  - Dazzling (Bin 4)
  - Frolicsome (Bin 5)
- Interactive features:
  - Click to select numbers or drag and drop them directly
  - Multi-select functionality for batch categorization
  - Zoom in/out capability using mouse wheel or keyboard (+/-)
  - Hover effects to highlight adjacent numbers
  - Keyboard shortcuts for efficient navigation
- Progress tracking:
  - Individual bin completion percentages
  - Overall task completion status
  - Visual progress bars for each bin
- Dynamic content:
  - Random location names from the show
  - Hexadecimal values that update with each new file
  - Responsive grid layout that adapts to screen size
- Modern UI/UX features:
  - Smooth animations and transitions
  - Visual feedback for user actions
  - Error handling and input validation
  - Responsive design for all screen sizes

## How to Run

1. Clone this repository
2. Install dependencies with `npm install`
3. Start the server with `npm start`
4. Open `http://localhost:3000` in your browser
5. Enter your name to begin your MDR task

## How to Play

1. Enter your first and last name to log in
2. Look at the grid of numbers
3. Categorize numbers based on how they make you feel:
   - Drag numbers to their corresponding bins
   - Click numbers to select them, then click a bin to categorize
   - Use multi-select for batch categorization
4. Use the mouse wheel or +/- keys to zoom in/out
5. Track your progress using the completion percentages
6. Start a new file when you're ready for a fresh challenge

## Technical Details

- Built with vanilla JavaScript, HTML5, and CSS3
- Responsive design using CSS Grid and Flexbox
- Interactive features using HTML5 Drag and Drop API
- Dynamic content generation and state management
- Performance optimized for smooth animations
- Cross-browser compatible
- Mobile-responsive design
- Analytics integration with Vercel

## Development

The project uses modern web development practices:
- Version control with Git
- Dependency management with npm
- Deployment automation with Vercel
- Performance monitoring with Vercel Analytics

## Note

This is a fan project inspired by the Apple TV+ show "Severance" and is not affiliated with Apple, Inc. or the show's creators.

## Image References

The interface design is inspired by scenes from the show featuring the MDR department's computer terminals, which display a grid of numbers, location names like "Cold Harbor" and "Dranesville," and the Lumon Industries logo.

---

Please enjoy your simulated work experience. Praise Kier! 