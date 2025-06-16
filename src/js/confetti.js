// A simple confetti animation script
function createConfetti() {
  const confettiCount = 200;
  const colors = ['#bf0a30', '#002868', '#ffffff', '#ffcc00']; // Red, blue, white, gold
  const container = document.createElement('div');
  
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  
  document.body.appendChild(container);
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    const size = Math.floor(Math.random() * 10) + 5; // Size between 5px and 15px
    
    confetti.style.position = 'absolute';
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = '-20px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.opacity = Math.random() + 0.5;
    
    container.appendChild(confetti);
    
    const duration = Math.random() * 3 + 2; // Animation duration between 2-5 seconds
    const rotation = Math.random() * 360;
    
    // Animate the confetti falling
    confetti.animate([
      { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${(Math.random() - 0.5) * 400}px, ${window.innerHeight}px) rotate(${rotation}deg)`, opacity: 0 }
    ], {
      duration: duration * 1000,
      easing: 'cubic-bezier(.37,1.04,.68,.98)',
      fill: 'forwards'
    });
  }
  
  // Remove the confetti container after animations complete
  setTimeout(() => {
    container.remove();
  }, 6000);
}

// Create a modal to display messages based on the scenario
function showModal(type) {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'congratulations-modal';
  
  let content = '';
  
  if (type === 'earmarked') {
    // For when all regular questions are done but earmarked questions remain
    content = `
      <div class="congratulations-content">
        <h2><span class="emoji-glow">🎓</span> Well Done!</h2>
        <p>You've completed all regular questions. Now reviewing your earmarked questions.</p>
        <button id="modal-continue-btn" class="btn">Continue</button>
      </div>
    `;
  } else if (type === 'completed') {
    // For when all questions including earmarked are completed
    content = `
      <div class="congratulations-content">
        <h2><span class="emoji-glow">🎉</span> Congratulations!</h2>
        <p>You've practiced all the questions. Reset the flashcards to practice more.</p>
        <button id="modal-reset-btn" class="btn btn-reset">Reset Flashcards</button>
      </div>
    `;
  } else if (type === 'empty') {
    // For when there are no more questions to show
    content = `
      <div class="congratulations-content">
        <h2><span class="emoji-glow">🏆</span> No Other Questions</h2>
        <p>Reset to practice again.</p>
        <button id="modal-reset-btn" class="btn btn-reset">Reset Flashcards</button>
      </div>
    `;
  }
  
  modal.innerHTML = content;
  document.body.appendChild(modal);
  
  // Add event listeners based on the button type
  if (type === 'earmarked') {
    const continueBtn = document.getElementById('modal-continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        modal.remove();
      });
    }
  }
  
  // Reset button
  const resetBtn = document.getElementById('modal-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      modal.remove();
      resetQuestions(); // Call the global resetQuestions function directly
    });
  }
  
  // Close modal when clicking outside of it
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Export the functions
export { createConfetti, showModal };