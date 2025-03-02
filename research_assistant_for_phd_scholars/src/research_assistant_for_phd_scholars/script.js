document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const options = document.querySelectorAll('.option');

    let selectedOption = 'research'; // Default option

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(opt => {
                opt.classList.remove('active');
                opt.style.background = 'rgba(255, 255, 255, 0.1)';
            });
            option.classList.add('active');
            option.style.background = 'rgba(255, 255, 255, 0.3)';
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
        const query = searchInput.value.trim();

        if (!query) {
            alert('Please enter a research topic');
            return;
        }

        // Show loading spinner and message
        loadingSpinner.style.display = 'flex';
        resultsContainer.innerHTML = '<div style="text-align: center; color: rgba(255, 255, 255, 0.8);">Analyzing your topic and generating a detailed report...</div>';

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

            // Hide loading spinner
            loadingSpinner.style.display = 'none';

            // Display results
            displayResults(data);

        } catch (error) {
            console.error('Error:', error);
            loadingSpinner.style.display = 'none';
            resultsContainer.innerHTML = `
                <div style="color: #ff4444; padding: 20px; text-align: center;">
                    <p style="margin-bottom: 10px;">An error occurred while processing your request.</p>
                    <p style="font-size: 0.9em; color: rgba(255, 68, 68, 0.8);">Please try again or check if the research topic is valid.</p>
                </div>
            `;
        }
    }

    function displayResults(data) {
        if (!data || data.error) {
            resultsContainer.innerHTML = `
                <div style="color: #ff4444; padding: 20px; text-align: center;">
                    <p style="margin-bottom: 10px;">${data.error || 'Failed to generate report'}</p>
                    <p style="font-size: 0.9em; color: rgba(255, 68, 68, 0.8);">Please try again with a different topic.</p>
                </div>
            `;
            return;
        }

        const resultsHTML = data.results.map(result => {
            // Convert markdown-style formatting to HTML
            const description = result.description
                .replace(/#{3,}\s(.*)/g, '<h4 style="color: #ffffff; margin: 15px 0 10px;">$1</h4>')  // H3 and smaller
                .replace(/##\s(.*)/g, '<h3 style="color: #ffffff; margin: 20px 0 10px;">$1</h3>')     // H2
                .replace(/#\s(.*)/g, '<h2 style="color: #ffffff; margin: 25px 0 15px;">$1</h2>')      // H1
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
                .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic text
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #667eea; text-decoration: none;">$1</a>')  // Links
                .replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 3px;">$1</code>')  // Inline code
                .replace(/\n/g, '<br>');  // Line breaks

            return `
                <div class="result-item" style="background: rgba(255, 255, 255, 0.1); margin: 15px 0; padding: 20px; border-radius: 10px;">
                    <h2 style="margin-bottom: 15px; color: #ffffff; font-size: 1.5em;">${result.title}</h2>
                    <div style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${description}</div>
                </div>
            `;
        }).join('');

        resultsContainer.innerHTML = `
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; text-align: center;">
                <h3 style="color: #ffffff; margin-bottom: 5px;">Research Report</h3>
                <p style="color: rgba(255, 255, 255, 0.8);">Topic: ${data.query}</p>
            </div>
            ${resultsHTML}
        `;

        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}); 