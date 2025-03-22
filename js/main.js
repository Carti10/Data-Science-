// Main JavaScript file for Data Science for Omics and Systems Biology Course

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                }
            }
        });
    });
    
    // Add active class to current navigation item
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        
        if (currentPage === linkPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Initialize any interactive components
    initializeInteractiveComponents();
});

// Function to initialize interactive components if they exist on the page
function initializeInteractiveComponents() {
    // Initialize quiz if on quiz page
    if (document.querySelector('.quiz-container')) {
        initializeQuiz();
    }
    
    // Initialize data analysis tool if on tool page
    if (document.querySelector('.tool-container')) {
        // The tool has its own initialization in data_analysis_tool.js
        console.log('Data analysis tool page detected');
    }
    
    // Initialize code highlighting for code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    if (codeBlocks.length > 0 && typeof hljs !== 'undefined') {
        codeBlocks.forEach(block => {
            hljs.highlightBlock(block);
        });
    }
}

// Function to initialize quiz functionality
function initializeQuiz() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;
    
    // Load quiz data
    fetch('/assessments/quiz_data.json')
        .then(response => response.json())
        .then(data => {
            if (data && data.questions) {
                renderQuiz(data.questions);
            }
        })
        .catch(error => {
            console.error('Error loading quiz data:', error);
            quizContainer.innerHTML = '<p>Error loading quiz. Please try again later.</p>';
        });
}

// Function to render quiz questions
function renderQuiz(questions) {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;
    
    // Clear existing content
    quizContainer.innerHTML = '';
    
    // Create quiz header
    const quizHeader = document.createElement('div');
    quizHeader.className = 'quiz-header';
    quizHeader.innerHTML = `
        <h2>Data Science for Omics Knowledge Check</h2>
        <p>Test your understanding of key concepts in data science for omics research.</p>
    `;
    quizContainer.appendChild(quizHeader);
    
    // Create questions
    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'quiz-question';
        questionElement.dataset.questionId = question.id;
        questionElement.dataset.correctAnswer = question.correctAnswer;
        
        // Question text
        const questionText = document.createElement('h3');
        questionText.textContent = `Question ${index + 1}: ${question.question}`;
        questionElement.appendChild(questionText);
        
        // Options
        const optionsList = document.createElement('ul');
        optionsList.className = 'quiz-options';
        
        question.options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('li');
            optionItem.className = 'quiz-option';
            optionItem.dataset.optionIndex = optionIndex;
            optionItem.textContent = option;
            
            // Add click event
            optionItem.addEventListener('click', function() {
                selectOption(this, questionElement);
            });
            
            optionsList.appendChild(optionItem);
        });
        
        questionElement.appendChild(optionsList);
        
        // Explanation (hidden initially)
        const explanation = document.createElement('div');
        explanation.className = 'quiz-explanation';
        explanation.style.display = 'none';
        explanation.innerHTML = `<p><strong>Explanation:</strong> ${question.explanation}</p>`;
        questionElement.appendChild(explanation);
        
        quizContainer.appendChild(questionElement);
    });
    
    // Create quiz controls
    const quizControls = document.createElement('div');
    quizControls.className = 'quiz-controls mt-3';
    quizControls.innerHTML = `
        <button id="check-answers" class="btn">Check Answers</button>
        <button id="reset-quiz" class="btn" style="display: none;">Reset Quiz</button>
        <div id="quiz-results" class="mt-2"></div>
    `;
    quizContainer.appendChild(quizControls);
    
    // Add event listeners for quiz controls
    document.getElementById('check-answers').addEventListener('click', checkAnswers);
    document.getElementById('reset-quiz').addEventListener('click', resetQuiz);
}

// Function to handle option selection
function selectOption(optionElement, questionElement) {
    // Remove selected class from all options in this question
    const options = questionElement.querySelectorAll('.quiz-option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    optionElement.classList.add('selected');
}

// Function to check answers
function checkAnswers() {
    let correctCount = 0;
    const totalQuestions = document.querySelectorAll('.quiz-question').length;
    
    // Check each question
    document.querySelectorAll('.quiz-question').forEach(questionElement => {
        const correctAnswer = parseInt(questionElement.dataset.correctAnswer);
        const selectedOption = questionElement.querySelector('.quiz-option.selected');
        
        // Show explanation
        questionElement.querySelector('.quiz-explanation').style.display = 'block';
        
        if (!selectedOption) {
            // No option selected
            return;
        }
        
        const selectedIndex = parseInt(selectedOption.dataset.optionIndex);
        
        // Mark as correct or incorrect
        if (selectedIndex === correctAnswer) {
            selectedOption.classList.add('correct');
            correctCount++;
        } else {
            selectedOption.classList.add('incorrect');
            // Highlight the correct answer
            questionElement.querySelectorAll('.quiz-option').forEach(option => {
                if (parseInt(option.dataset.optionIndex) === correctAnswer) {
                    option.classList.add('correct');
                }
            });
        }
    });
    
    // Show results
    const resultsElement = document.getElementById('quiz-results');
    resultsElement.innerHTML = `<p>You got ${correctCount} out of ${totalQuestions} questions correct.</p>`;
    
    // Show reset button, hide check answers button
    document.getElementById('check-answers').style.display = 'none';
    document.getElementById('reset-quiz').style.display = 'inline-block';
    
    // Disable further selections
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.style.pointerEvents = 'none';
    });
}

// Function to reset quiz
function resetQuiz() {
    // Remove all selected, correct, incorrect classes
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
        option.style.pointerEvents = 'auto';
    });
    
    // Hide explanations
    document.querySelectorAll('.quiz-explanation').forEach(explanation => {
        explanation.style.display = 'none';
    });
    
    // Clear results
    document.getElementById('quiz-results').innerHTML = '';
    
    // Show check answers button, hide reset button
    document.getElementById('check-answers').style.display = 'inline-block';
    document.getElementById('reset-quiz').style.display = 'none';
}
