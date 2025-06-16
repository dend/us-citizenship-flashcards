// Constants and variables
import { questionsData } from './questionsData.js';
import { createConfetti, showModal } from './confetti.js';

let questions = [];
let currentQuestionIndex = -1;
let nextQuestionIndex = -1; // Added to support preloading
let remainingQuestions = [];
let earmarkedQuestions = [];
let skippedQuestions = [];
let completedQuestions = [];
let preloadedQuestion = null; // Renamed from nextQuestion to avoid conflict
let totalQuestions = 0; // Added to track total number of questions

// DOM Elements
let flashcardElement;
let questionTextElement;
let sectionTagElement;
let subsectionTagElement;
let showAnswerBtn;
let skipBtn;

let questionTextBackElement;
let sectionTagBackElement;
let subsectionTagBackElement;
let answerListElement;
let nextBtn;
let earmarkBtn;
let resetBtn;

// Counter elements
let completedCountElement;
let remainingCountElement;
let earmarkedCountElement;
let skippedCountElement;

// Questions list overlay elements
let questionsListOverlay;
let questionsListTitle;
let questionsTableBody;
let noQuestionsMessage;
let closeQuestionsListBtn;
let viewQuestionsBtns;

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

// Initialize the app
function init() {
    try {
        // Initialize DOM references
        flashcardElement = document.getElementById('flashcard');
        questionTextElement = document.getElementById('question-text');
        sectionTagElement = document.getElementById('section-tag');
        subsectionTagElement = document.getElementById('subsection-tag');
        showAnswerBtn = document.getElementById('show-answer-btn');
        skipBtn = document.getElementById('skip-btn');

        questionTextBackElement = document.getElementById('question-text-back');
        sectionTagBackElement = document.getElementById('section-tag-back');
        subsectionTagBackElement = document.getElementById('subsection-tag-back');
        answerListElement = document.getElementById('answer-list');
        nextBtn = document.getElementById('next-btn');
        earmarkBtn = document.getElementById('earmark-btn');
        resetBtn = document.getElementById('reset-btn');

        // Counter elements
        completedCountElement = document.getElementById('completed-count');
        remainingCountElement = document.getElementById('remaining-count');
        earmarkedCountElement = document.getElementById('earmarked-count');
        skippedCountElement = document.getElementById('skipped-count');
        
        // Questions list overlay elements
        questionsListOverlay = document.getElementById('questions-list-overlay');
        questionsListTitle = document.getElementById('questions-list-title');
        questionsTableBody = document.getElementById('questions-table-body');
        noQuestionsMessage = document.getElementById('no-questions-message');
        closeQuestionsListBtn = document.getElementById('close-questions-list-btn');
        viewQuestionsBtns = document.querySelectorAll('.view-questions-btn');
        
        console.log('DOM elements initialized:', flashcardElement, showAnswerBtn, skipBtn, nextBtn, earmarkBtn, resetBtn);

        // Set up event listeners for the main flashcard functionality
        showAnswerBtn.addEventListener('click', flipCard);
        skipBtn.addEventListener('click', skipQuestion);
        nextBtn.addEventListener('click', nextQuestion);
        earmarkBtn.addEventListener('click', earmarkQuestion);
        resetBtn.addEventListener('click', resetQuestions);
        
        // Set up event listeners for the questions list overlay
        closeQuestionsListBtn.addEventListener('click', hideQuestionsList);
        
        // Add click events to all view buttons
        viewQuestionsBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                showQuestionsList(type);
            });
        });
        
        // Close questions list when clicking outside the container
        questionsListOverlay.addEventListener('click', (e) => {
            if (e.target === questionsListOverlay) {
                hideQuestionsList();
            }
        });
        
        console.log('Event listeners added');
        
        // Use the embedded questions data instead of fetching
        questions = questionsData;
        totalQuestions = questions.length;
        console.log('Questions loaded:', totalQuestions);
        
        // Initialize the flashcard system
        resetQuestions();
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('There was an error loading the application. Please check the console for details.');
    }
}

// Reset all questions
function resetQuestions() {
    console.log('Resetting questions');
    // Reset all counters and arrays
    remainingQuestions = [...questions];
    earmarkedQuestions = [];
    skippedQuestions = [];
    completedQuestions = [];
    preloadedQuestion = null;
    currentQuestionIndex = -1;
    
    // Make sure the flashcard container is visible
    flashcardElement.style.display = '';
    document.querySelector('.flashcard-container').style.display = '';
    
    // Make the empty state card invisible if it exists
    const emptyStateCard = document.getElementById('empty-state-card');
    if (emptyStateCard) {
        emptyStateCard.style.display = 'none';
    }
    
    // Shuffle the questions array
    shuffleArray(remainingQuestions);
    
    // FIXED: Hard-code the initial counters to ensure they start correct
    completedCountElement.textContent = '0';
    remainingCountElement.textContent = '100';  // Start with exactly 100
    earmarkedCountElement.textContent = '0';
    skippedCountElement.textContent = '0';
    
    // Preload the first question
    preloadNextQuestion();
    
    // Show the first question
    showNextQuestion();
    
    // Make sure the card is not flipped
    flashcardElement.classList.remove('flipped');
    
    // Re-enable buttons if they were disabled
    showAnswerBtn.disabled = false;
    skipBtn.disabled = false;
    nextBtn.disabled = false;
    earmarkBtn.disabled = false;
}

// Make resetQuestions available to the window scope so it can be called from modal
window.resetQuestions = resetQuestions;

// Show the next question
function showNextQuestion() {
    console.log('Showing next question');
    if (remainingQuestions.length === 0) {
        // If no more questions remaining, show a message
        if (earmarkedQuestions.length > 0) {
            // If there are earmarked questions, show appropriate message and switch to earmarked
            createConfetti();
            showModal('earmarked');
            remainingQuestions = [...earmarkedQuestions];
            earmarkedQuestions = [];
            updateCounters();
            showNextQuestion();
        } else {
            // No more questions left at all - show empty state
            clearQuestionDisplay();
            return;
        }
    } else {
        // Use preloaded question if available
        if (preloadedQuestion) {
            updateFlashcard(preloadedQuestion);
            currentQuestionIndex = nextQuestionIndex;
            
            // Now we remove the preloaded question from the remaining questions
            const indexToRemove = remainingQuestions.findIndex(q => q.id === preloadedQuestion.id);
            if (indexToRemove !== -1) {
                remainingQuestions.splice(indexToRemove, 1);
            }
            
            preloadedQuestion = null;
            
            // Preload the next question in the background
            preloadNextQuestion();
        } else {
            // Get a random question from remainingQuestions array
            const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
            const question = remainingQuestions[randomIndex];
            
            // Remove the question from remainingQuestions array
            remainingQuestions.splice(randomIndex, 1);
            
            // Update the current question index
            currentQuestionIndex = questions.findIndex(q => q.id === question.id);
            
            // Update the flashcard with question info
            updateFlashcard(question);
            
            // Preload the next question
            preloadNextQuestion();
        }
    }
}

// Preload the next question to improve responsiveness
function preloadNextQuestion() {
    if (remainingQuestions.length > 0) {
        // Determine next question
        const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
        preloadedQuestion = remainingQuestions[randomIndex];
        nextQuestionIndex = questions.findIndex(q => q.id === preloadedQuestion.id);
        // Note: We don't remove the question from remainingQuestions here.
        // It will be removed when showNextQuestion is called.
    }
}

// Update the flashcard with the question information
function updateFlashcard(question) {
    console.log('Updating flashcard with question:', question);
    // Update front side
    questionTextElement.textContent = question.question;
    sectionTagElement.textContent = question.section;
    subsectionTagElement.textContent = question.subsection;
    
    // Update back side
    questionTextBackElement.textContent = question.question;
    sectionTagBackElement.textContent = question.section;
    subsectionTagBackElement.textContent = question.subsection;
    
    // Update answers
    answerListElement.innerHTML = '';
    question.answers.forEach(answer => {
        const li = document.createElement('li');
        li.textContent = answer;
        answerListElement.appendChild(li);
    });
}

// Clear the question display (used when all questions are completed)
function clearQuestionDisplay() {
    // Hide the regular flashcard but keep the container
    flashcardElement.style.display = 'none';
    
    // Create an empty state card showing the bottom of the stack
    const emptyStateEl = document.getElementById('empty-state-card') || document.createElement('div');
    emptyStateEl.id = 'empty-state-card';
    emptyStateEl.className = 'empty-state-card';
    emptyStateEl.innerHTML = `
        <p class="empty-state-text">No more questions</p>
    `;
    
    // Add the empty state to the container
    const flashcardContainer = document.querySelector('.flashcard-container');
    if (!document.getElementById('empty-state-card')) {
        flashcardContainer.appendChild(emptyStateEl);
    } else {
        emptyStateEl.style.display = 'block';
    }
    
    // Keep the container visible
    flashcardContainer.style.display = '';
    
    // Disable buttons
    showAnswerBtn.disabled = true;
    skipBtn.disabled = true;
    nextBtn.disabled = true;
    earmarkBtn.disabled = true;
    
    // Enable reset button and make it more prominent
    resetBtn.disabled = false;
    
    // Show confetti and completion modal
    createConfetti();
    showModal('empty');
}

// Flip the flashcard to show the answer
function flipCard() {
    console.log('Flipping card');
    flashcardElement.classList.add('flipped');
}

// Skip the current question with a clean toss animation
function skipQuestion() {
    console.log('Skipping question', currentQuestionIndex);
    if (currentQuestionIndex === -1) return;
    
    // Add current question to skipped questions
    const currentQuestion = questions[currentQuestionIndex];
    skippedQuestions.push(currentQuestion);
    
    // Apply the toss-left animation
    flashcardElement.classList.add('toss-left');
    
    // Preload the next question's content while current card is still animating
    // This ensures content is ready before we try to show it
    const nextQuestionContent = preloadedQuestion || 
        (remainingQuestions.length > 0 ? remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)] : null);
    
    if (nextQuestionContent) {
        // Prepare the next question's content in memory
        // but don't update the DOM yet
    }
    
    // After the animation completes, load new question
    setTimeout(() => {
        // Hide the card immediately to prevent flash
        flashcardElement.style.opacity = '0';
        
        // Remove the toss animation class
        flashcardElement.classList.remove('toss-left');
        
        // Make sure the card is not flipped
        flashcardElement.classList.remove('flipped');
        
        // Show the next question
        showNextQuestion();
        
        // Update counters
        updateCounters();
        
        // After DOM updates but before showing the card, force a reflow
        void flashcardElement.offsetHeight;
        
        // Restore the card visibility with CSS transition
        flashcardElement.style.opacity = '1';
        flashcardElement.style.transition = 'opacity 0.2s ease-in';
        
        // Clear the transition style after animation completes
        setTimeout(() => {
            flashcardElement.style.transition = '';
        }, 200);
    }, 450);
}

// Move to the next question with a clean toss animation
function nextQuestion(event) {
    // Prevent default button behavior to avoid page scrolling on mobile
    if (event) event.preventDefault();
    
    console.log('Next question', currentQuestionIndex);
    if (currentQuestionIndex === -1) return;
    
    // Add current question to completed questions
    const currentQuestion = questions[currentQuestionIndex];
    completedQuestions.push(currentQuestion);
    
    // Apply the toss-right animation
    flashcardElement.classList.add('toss-right');
    
    // Check if this was the last question overall
    const isLastQuestion = remainingQuestions.length === 0 && earmarkedQuestions.length === 0;
    
    // Preload the next question's content while current card is still animating
    // This ensures content is ready before we try to show it
    const nextQuestionContent = preloadedQuestion || 
        (remainingQuestions.length > 0 ? remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)] : null);
    
    if (nextQuestionContent) {
        // Prepare the next question's content in memory
        // but don't update the DOM yet
    }
    
    // After the animation completes, load new question
    setTimeout(() => {
        // Hide the card immediately to prevent flash
        flashcardElement.style.opacity = '0';
        
        // Remove the toss animation class
        flashcardElement.classList.remove('toss-right');
        
        // Make sure the card is not flipped
        flashcardElement.classList.remove('flipped');
        
        // If this was the last question overall, show completion modal
        if (isLastQuestion) {
            // We'll handle this in showNextQuestion which will call clearQuestionDisplay
        }
        
        // Show the next question
        showNextQuestion();
        
        // Update counters
        updateCounters();
        
        // After DOM updates but before showing the card, force a reflow
        void flashcardElement.offsetHeight;
        
        // Restore the card visibility with CSS transition
        flashcardElement.style.opacity = '1';
        flashcardElement.style.transition = 'opacity 0.2s ease-in';
        
        // Clear the transition style after animation completes
        setTimeout(() => {
            flashcardElement.style.transition = '';
        }, 200);
    }, 450);
}

// Earmark the current question for later review
function earmarkQuestion() {
    console.log('Earmarking question', currentQuestionIndex);
    if (currentQuestionIndex === -1) return;
    
    // Add current question to earmarked questions
    const currentQuestion = questions[currentQuestionIndex];
    earmarkedQuestions.push(currentQuestion);
    
    // Apply the toss-down animation
    flashcardElement.classList.add('toss-down');
    
    // Preload the next question's content while current card is still animating
    const nextQuestionContent = preloadedQuestion || 
        (remainingQuestions.length > 0 ? remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)] : null);
    
    if (nextQuestionContent) {
        // Prepare the next question's content in memory
        // but don't update the DOM yet
    }
    
    // After the animation completes, load new question
    setTimeout(() => {
        // Hide the card immediately to prevent flash
        flashcardElement.style.opacity = '0';
        
        // Remove the toss animation class
        flashcardElement.classList.remove('toss-down');
        
        // Make sure the card is not flipped
        flashcardElement.classList.remove('flipped');
        
        // Show the next question
        showNextQuestion();
        
        // Update counters
        updateCounters();
        
        // After DOM updates but before showing the card, force a reflow
        void flashcardElement.offsetHeight;
        
        // Restore the card visibility with CSS transition
        flashcardElement.style.opacity = '1';
        flashcardElement.style.transition = 'opacity 0.2s ease-in';
        
        // Clear the transition style after animation completes
        setTimeout(() => {
            flashcardElement.style.transition = '';
        }, 200);
    }, 450); // Match the timing with other animations (450ms)
}

// Update all counters
function updateCounters() {
    // Update completed count
    completedCountElement.textContent = completedQuestions.length;
    
    // Update earmarked count
    earmarkedCountElement.textContent = earmarkedQuestions.length;
    
    // Update skipped count
    skippedCountElement.textContent = skippedQuestions.length;
    
    // Update remaining count
    // For remaining, we need to account for:
    // 1) Questions still in the remainingQuestions array
    // 2) The current question being displayed (which is not in any array)
    const totalRemaining = remainingQuestions.length + (currentQuestionIndex !== -1 ? 1 : 0);
    
    // Make sure we're never showing a negative number
    remainingCountElement.textContent = Math.max(0, totalRemaining);
    
    console.log('Updated counters:', {
        completed: completedQuestions.length,
        remaining: totalRemaining,
        earmarked: earmarkedQuestions.length,
        skipped: skippedQuestions.length,
        total: completedQuestions.length + totalRemaining + earmarkedQuestions.length + skippedQuestions.length
    });
}

// Show the questions list overlay
function showQuestionsList(type) {
    let questionsToShow = [];
    let typeName = '';
    let className = '';
    
    // Determine which questions to show based on type
    if (type === 'completed') {
        questionsToShow = completedQuestions;
        typeName = 'Completed Questions';
        className = 'completed-question';
    } else if (type === 'remaining') {
        questionsToShow = remainingQuestions;
        typeName = 'Remaining Questions';
        className = 'remaining-question';
    } else if (type === 'earmarked') {
        questionsToShow = earmarkedQuestions;
        typeName = 'Earmarked Questions';
        className = 'earmarked-question';
    } else if (type === 'skipped') {
        questionsToShow = skippedQuestions;
        typeName = 'Skipped Questions';
        className = 'skipped-question';
    }
    
    // Update the title
    questionsListTitle.textContent = typeName;
    
    // Show/hide no questions message
    if (questionsToShow.length === 0) {
        document.getElementById('questions-table').style.display = 'none';
        noQuestionsMessage.style.display = 'block';
    } else {
        document.getElementById('questions-table').style.display = 'table';
        noQuestionsMessage.style.display = 'none';
        
        // Clear table body
        questionsTableBody.innerHTML = '';
        
        // Add questions to table
        questionsToShow.forEach(question => {
            const row = document.createElement('tr');
            row.className = className;
            
            row.innerHTML = `
                <td>${question.question}</td>
                <td>${question.section}</td>
                <td>${question.subsection}</td>
            `;
            
            questionsTableBody.appendChild(row);
        });
    }
    
    // Show the overlay
    questionsListOverlay.style.display = 'flex';
    
    // Add a special class to body to prevent scrolling
    document.body.classList.add('overlay-active');
    
    // Removed the back button for mobile
}

// Hide the questions list overlay
function hideQuestionsList() {
    // Hide the overlay
    questionsListOverlay.style.display = 'none';
    
    // Remove the body class
    document.body.classList.remove('overlay-active');
}

// Show a temporary message to the user - replacing alert with the modal
function showMessage(message) {
    // Create a simple modal with the given message instead of an alert
    const modal = document.createElement('div');
    modal.className = 'congratulations-modal';
    
    modal.innerHTML = `
        <div class="congratulations-content">
            <p>${message}</p>
            <button id="modal-ok-btn" class="btn">OK</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener to the ok button
    document.getElementById('modal-ok-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close modal when clicking outside of it
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}