const fs = require('fs');
const path = require('path');

// Read the questions.txt file
const inputPath = path.join(__dirname, '../../questions.txt');
const outputPath = path.join(__dirname, '../data/questions.json');

fs.readFile(inputPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Split the content by question numbers
    const lines = data.split('\n');
    const questions = [];

    let currentSection = '';
    let currentSubsection = '';
    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '') continue;

        // Check for section headers
        if (line === 'AMERICAN GOVERNMENT' || 
            line === 'AMERICAN HISTORY' || 
            line === 'INTEGRATED CIVICS') {
            currentSection = line;
            continue;
        }

        // Check for subsection headers
        if (line.startsWith('A:') || line.startsWith('B:') || line.startsWith('C:')) {
            currentSubsection = line;
            continue;
        }

        // Check for question numbers (e.g., "1.", "2.")
        const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (questionMatch) {
            // Save previous question if it exists
            if (currentQuestion) {
                questions.push(currentQuestion);
            }

            // Start a new question
            const questionNumber = parseInt(questionMatch[1]);
            const questionText = questionMatch[2];
            
            currentQuestion = {
                id: questionNumber,
                question: questionText,
                section: currentSection,
                subsection: currentSubsection,
                answers: []
            };
            continue;
        }

        // If we have a current question and the line is an answer (starts with ".")
        if (currentQuestion && line.startsWith('.')) {
            const answer = line.substring(1).trim();
            if (answer) {
                currentQuestion.answers.push(answer);
            }
        }
    }

    // Add the last question
    if (currentQuestion) {
        questions.push(currentQuestion);
    }

    // Write the JSON file
    fs.writeFile(outputPath, JSON.stringify(questions, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
            return;
        }
        console.log(`Successfully parsed ${questions.length} questions to ${outputPath}`);
    });
});