document.addEventListener('DOMContentLoaded', () => {
    // Theme Switching
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Add transition class for smooth color changes
        htmlElement.classList.add('theme-transition');

        // Switch theme
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Remove transition class after animation
        setTimeout(() => {
            htmlElement.classList.remove('theme-transition');
        }, 300);
    });

    // Add theme transition styles
    const style = document.createElement('style');
    style.textContent = `
        .theme-transition,
        .theme-transition *,
        .theme-transition *:before,
        .theme-transition *:after {
            transition: all 0.3s ease !important;
        }
    `;
    document.head.appendChild(style);

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const options = document.querySelectorAll('.option');

    let selectedOption = 'research'; // Default option
    let isProcessing = false;

    // Add typing animation to placeholder
    const placeholders = [
        "Enter your research topic...",
        "e.g., Artificial Intelligence in Healthcare...",
        "e.g., Quantum Computing Applications...",
        "e.g., Climate Change Solutions...",
        "e.g., Renewable Energy Technologies..."
    ];
    let currentPlaceholder = 0;

    function animatePlaceholder() {
        const placeholder = placeholders[currentPlaceholder];
        let charIndex = 0;

        function type() {
            if (charIndex < placeholder.length) {
                searchInput.placeholder = placeholder.substring(0, charIndex + 1);
                charIndex++;
                setTimeout(type, 50);
            } else {
                setTimeout(erase, 2000);
            }
        }

        function erase() {
            if (charIndex > 0) {
                searchInput.placeholder = placeholder.substring(0, charIndex - 1);
                charIndex--;
                setTimeout(erase, 30);
            } else {
                currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
                setTimeout(animatePlaceholder, 500);
            }
        }

        type();
    }

    animatePlaceholder();

    // Handle option selection with ripple effect
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            if (isProcessing) return;

            // Remove active class and background from all options
            options.forEach(opt => {
                opt.classList.remove('active');
                opt.style.background = 'rgba(255, 255, 255, 0.1)';
            });

            // Add active class and background to clicked option
            option.classList.add('active');
            option.style.background = 'rgba(255, 255, 255, 0.3)';

            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            option.appendChild(ripple);

            const rect = option.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            setTimeout(() => ripple.remove(), 1000);

            selectedOption = option.querySelector('span').textContent.toLowerCase().split(' ')[0];
        });
    });

    // Handle search button click
    searchButton.addEventListener('click', performSearch);

    // Handle enter key press
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    async function performSearch() {
        if (isProcessing) return;

        const query = searchInput.value.trim();

        if (!query) {
            showError('Please enter a research topic');
            return;
        }

        isProcessing = true;

        // Show loading spinner with fade effect
        loadingSpinner.style.display = 'flex';
        loadingSpinner.style.opacity = '0';
        setTimeout(() => loadingSpinner.style.opacity = '1', 10);

        // Clear previous results with fade effect
        if (resultsContainer.innerHTML) {
            resultsContainer.style.opacity = '0';
            setTimeout(() => {
                resultsContainer.innerHTML = '<div class="loading-message">Analyzing your topic and generating a detailed report...</div>';
                resultsContainer.style.opacity = '1';
            }, 300);
        } else {
            resultsContainer.innerHTML = '<div class="loading-message">Analyzing your topic and generating a detailed report...</div>';
        }

        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    type: selectedOption
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Hide loading spinner with fade effect
            loadingSpinner.style.opacity = '0';
            setTimeout(() => loadingSpinner.style.display = 'none', 300);

            // Display results
            displayResults(data);

        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred while processing your request. Please try again.');
        } finally {
            isProcessing = false;
        }
    }

    function showError(message) {
        // Shake animation for input field
        searchInput.classList.add('shake');
        setTimeout(() => searchInput.classList.remove('shake'), 500);

        // Show error message
        resultsContainer.innerHTML = `
            <div class="error-message" style="opacity: 0;">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;

        setTimeout(() => {
            const errorMessage = resultsContainer.querySelector('.error-message');
            if (errorMessage) errorMessage.style.opacity = '1';
        }, 10);
    }

    function displayResults(data) {
        if (!data || data.error) {
            showError(data.error || 'Failed to generate report');
            return;
        }

        // Prepare results HTML with staggered animation
        const resultsHTML = data.results.map((result, index) => {
            const description = result.description
                .replace(/#{3,}\s(.*)/g, '<h4 class="animate-in">$1</h4>')
                .replace(/##\s(.*)/g, '<h3 class="animate-in">$1</h3>')
                .replace(/#\s(.*)/g, '<h2 class="animate-in">$1</h2>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="animate-link">$1</a>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');

            return `
                <div class="result-item" style="animation-delay: ${index * 0.1}s">
                    <h2 class="result-title animate-in">${result.title}</h2>
                    <div class="result-content">${description}</div>
                </div>
            `;
        }).join('');

        // Add header and results with fade in
        resultsContainer.style.opacity = '0';
        resultsContainer.innerHTML = `
            <div class="results-header animate-in">
                <h3>Research Report</h3>
                <p>Topic: ${data.query}</p>
            </div>
            ${resultsHTML}
        `;

        // Trigger animations
        setTimeout(() => {
            resultsContainer.style.opacity = '1';

            // Smooth scroll to results
            resultsContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 10);
    }

    // Add input field animations
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.classList.add('focused');
    });

    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('focused');
    });

    // Add button hover animation
    searchButton.addEventListener('mouseover', () => {
        searchButton.querySelector('i').style.transform = 'rotate(180deg)';
    });

    searchButton.addEventListener('mouseout', () => {
        searchButton.querySelector('i').style.transform = 'rotate(0deg)';
    });
}); 