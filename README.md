# Severance MDR Task Simulator

This project is a web-based simulator of the Macro Data Refinement (MDR) task from the Apple TV+ show "Severance." It recreates the retro computer interface that the MDR department employees use to categorize numbers based on how they "feel."

## Features

- Authentic retro computer interface inspired by the show
- Displays the official Lumon Industries logo from the show
- Grid of random numbers to categorize
- Five different "emotion" bins to sort numbers into
- Click to select numbers or drag and drop them directly
- Progress tracking for individual bins and overall completion
- Random location names from the show
- Hexadecimal values that update with each new file

## How to Run

1. Clone this repository
2. Save the Lumon logo image to `public/images/lumon-logo.png` (see instructions in that directory)
3. Install dependencies with `npm install`
4. Start the server with `npm start`
5. Open `http://localhost:3000` in your browser
6. Start categorizing numbers!

## How to Play

1. Look at the grid of numbers
2. When you feel a number is "scary," drag it to bin 1
3. When you feel a number is "sad," drag it to bin 2
4. When you feel a number is "happy," drag it to bin 3
5. When you feel a number is "dazzling," drag it to bin 4
6. When you feel a number is "frolicsome," drag it to bin 5
7. You can select multiple numbers by clicking on them, then drag them all to a bin
8. The file is complete when all numbers have been categorized

## Technical Details

- The interface uses CSS grid for the number display and flexbox for layout
- Drag and drop functionality uses the HTML5 Drag and Drop API
- Simple Node.js server to serve the web files
- Responsive design that works on various screen sizes

## Note

This is a fan project inspired by the Apple TV+ show "Severance" and is not affiliated with Apple, Inc. or the show's creators.

## Image References

The interface design is inspired by scenes from the show featuring the MDR department's computer terminals, which display a grid of numbers, location names like "Cold Harbor" and "Dranesville," and the Lumon Industries logo.

---

Please enjoy your simulated work experience. Praise Kier! 