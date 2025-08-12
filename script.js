// DOM Elements
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');
const perfectSchemesLogo = document.querySelector('nav h1 a');
const eligibilityForm = document.getElementById('eligibilityForm');
const schemeList = document.getElementById('schemeList');
const searchInput = document.getElementById('searchInput');
const filterSector = document.getElementById('filterSector');
const alertForm = document.getElementById('alertForm');
const loginForm = document.getElementById('loginForm');
const loginModal = document.getElementById('login');
const registerModal = document.getElementById('register');
const contactForm = document.getElementById('contactForm');
const guideTabs = document.querySelectorAll('.guide-tab-content');
const tabButtons = document.querySelectorAll('.tab-btn');
const faqQuestions = document.querySelectorAll('.faq-question');
const registerForm = document.getElementById('registerForm');
const actionButtons = document.getElementById('registerActionButtons');
const loginNavItem = document.getElementById('loginNavItem');
const registerNavItem = document.getElementById('registerNavItem');
const logoutNavItem = document.getElementById('logoutNavItem');

// Current language state
let currentLanguage = 'en';

// History stack for navigation
let historyStack = ['home'];

// Initialize the application
function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Show home section by default
    showSection('home');
    
    // Initialize browser history
    window.addEventListener('popstate', handlePopState);
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Update language on initial load
    updateLanguage();
}

// Set up all event listeners
function setupEventListeners() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
            addToHistory(sectionId);
        });
    });
    
    // Perfect Schemes logo
    perfectSchemesLogo.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('home');
        addToHistory('home');
    });
    
    // Eligibility form submission
    if (eligibilityForm) {
        eligibilityForm.addEventListener('submit', handleEligibilitySubmit);
    }
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Filter sector
    if (filterSector) {
        filterSector.addEventListener('change', handleSectorFilter);
    }
    
    // Alert form submission
    if (alertForm) {
        alertForm.addEventListener('submit', handleAlertSubmit);
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Register form submission and validation
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
        registerForm.addEventListener('input', validateRegisterForm);
    }
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Guide tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
            openGuideTab(tabId);
        });
    });
    
    // FAQ questions
    faqQuestions.forEach(question => {
        question.addEventListener('click', toggleFAQ);
    });
}

// Validate register form in real-time
function validateRegisterForm() {
    if (!registerForm || !actionButtons) return;
    
    const allFilled = Array.from(registerForm.elements).every(input => {
        // Skip validation for non-required fields
        if (!input.required) return true;
        
        // Special handling for checkbox
        if (input.type === 'checkbox') return input.checked;
        
        // For password fields, check if they match
        if (input.id === 'registerPassword' || input.id === 'registerConfirmPassword') {
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            return password && password === confirmPassword;
        }
        
        // For all other required fields
        return input.value.trim() !== '';
    });
    
    actionButtons.style.display = allFilled ? 'flex' : 'none';
}

// Reset register form
function resetRegisterForm() {
    if (registerForm) {
        registerForm.reset();
    }
    if (actionButtons) {
        actionButtons.style.display = 'none';
    }
    
    // Clear any validation messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

// Show a specific section
function showSection(sectionId) {
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Special handling for dashboard to load schemes
        if (sectionId === 'dashboard') {
            loadAllSchemes();
        }
        
        // Special handling for histogram in about section
        if (sectionId === 'about') {
            renderHistogram();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Add section to history stack
function addToHistory(sectionId) {
    historyStack.push(sectionId);
    window.history.pushState({ sectionId }, '', `#${sectionId}`);
}

// Handle browser back/forward navigation
function handlePopState(event) {
    if (event.state && event.state.sectionId) {
        showSection(event.state.sectionId);
    } else {
        showSection('home');
    }
}

// Toggle language between English and Hindi
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    updateLanguage();
    
    // Update chart language if exists
    if (window.histogramChart) {
        renderHistogram();
    }
}

// Update all elements with language data attributes
function updateLanguage() {
    document.querySelectorAll('[data-en]').forEach(element => {
        const translation = element.getAttribute(`data-${currentLanguage}`);
        if (translation) {
            // For form elements, update placeholder instead of value
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                const currentValue = element.value;
                if (currentValue === '' || currentValue === element.getAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                }
            } else {
                // For other elements, update text content
                element.textContent = translation;
            }
        }
    });
}

// Enhanced logout function
function logout() {
    localStorage.removeItem('currentUser');
    checkAuthStatus();
    showSection('home');
    alert(currentLanguage === 'en' ? 
        'You have been logged out successfully.' : 
        'आप सफलतापूर्वक लॉग आउट हो गए हैं।'
    );
}

// Enhanced checkAuthStatus function
function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    const loginBtn = document.getElementById('loginNavItem');
    const registerBtn = document.getElementById('registerNavItem');
    const logoutBtn = document.getElementById('logoutNavItem');

    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Handle eligibility form submission
function handleEligibilitySubmit(e) {
    e.preventDefault();
    
    // Get form values
    const formData = {
        businessType: document.getElementById('businessType').value,
        sector: document.getElementById('sector').value,
        size: document.getElementById('size').value,
        location: document.getElementById('location').value,
        revenue: document.getElementById('revenue').value,
        years: document.getElementById('years').value
    };
    
    // Find matching schemes
    const matchingSchemes = findMatchingSchemes(formData);
    
    // Display matching schemes
    displaySchemes(matchingSchemes);
    
    // Show dashboard section
    showSection('dashboard');
    addToHistory('dashboard');
}

// Find schemes matching the form criteria
function findMatchingSchemes(formData) {
    return schemes.filter(scheme => {
        // Check business type match
        if (scheme.businessType && !scheme.businessType.includes(formData.businessType)) {
            return false;
        }
        
        // Check sector match
        if (scheme.sector && !scheme.sector.includes(formData.sector)) {
            return false;
        }
        
        // Check size match
        if (scheme.size && !scheme.size.includes(formData.size)) {
            return false;
        }
        
        // Check location match
        if (scheme.location && !scheme.location.includes(formData.location)) {
            return false;
        }
        
        // Check revenue match
        if (scheme.revenue && !scheme.revenue.includes(formData.revenue)) {
            return false;
        }
        
        // Check years in operation match
        if (scheme.years && !scheme.years.includes(formData.years)) {
            return false;
        }
        
        // If all checks passed
        return true;
    });
}

// Display schemes in the dashboard
function displaySchemes(schemesToDisplay) {
    schemeList.innerHTML = '';
    
    if (schemesToDisplay.length === 0) {
        schemeList.innerHTML = `
            <div class="no-schemes">
                <p data-en="No schemes found matching your criteria. Try adjusting your filters or check back later for new schemes."
                   data-hi="आपकी कसौटियों से मेल खाने वाली कोई योजना नहीं मिली। नई योजनाओं के लिए अपने फ़िल्टर को समायोजित करने का प्रयास करें या बाद में जांचें।">
                   No schemes found matching your criteria. Try adjusting your filters or check back later for new schemes.
                </p>
            </div>
        `;
        updateLanguage();
        return;
    }
    
    schemesToDisplay.forEach(scheme => {
        const schemeCard = document.createElement('div');
        schemeCard.className = 'scheme-card';
        schemeCard.innerHTML = `
            <h3>${scheme.name}</h3>
            <p>${scheme.description}</p>
            <p><strong data-en="Eligibility:" data-hi="पात्रता:">Eligibility:</strong> ${scheme.eligibility}</p>
            <p><strong data-en="Benefits:" data-hi="लाभ:">Benefits:</strong> ${scheme.benefits}</p>
            <p><strong data-en="Documents Required:" data-hi="आवश्यक दस्तावेज़:">Documents Required:</strong> ${scheme.documents}</p>
            <p><strong data-en="Deadline:" data-hi="अंतिम तिथि:">Deadline:</strong> ${scheme.deadline || 'Ongoing'}</p>
            
            <div class="scheme-meta">
                <span>${scheme.sector}</span>
                <span>${scheme.size}</span>
                <span>${scheme.location}</span>
            </div>
            
            <div class="scheme-actions">
                <a href="${scheme.link}" target="_blank" class="btn-primary" data-en="Apply Now" data-hi="अभी आवेदन करें">Apply Now</a>
                <button class="btn-secondary" onclick="showSchemeDetails('${scheme.id}')" data-en="View Details" data-hi="विवरण देखें">View Details</button>
            </div>
            
            <div class="accordion-item">
                <button class="accordion-header" onclick="toggleAccordion(this)">
                    <span data-en="Application Guide" data-hi="आवेदन गाइड">Application Guide</span>
                    <span class="accordion-toggle">+</span>
                </button>
                <div class="accordion-content">
                    ${scheme.guide}
                </div>
            </div>
        `;
        schemeList.appendChild(schemeCard);
    });
    
    updateLanguage();
}

// Load all schemes (for dashboard)
function loadAllSchemes() {
    displaySchemes(schemes);
}

// Handle search input
function handleSearch() {
    const term = searchInput.value.toLowerCase();
    document.querySelectorAll('.scheme-card').forEach(card => {
        const textContent = card.textContent.toLowerCase();
        card.style.display = textContent.includes(term) ? 'block' : 'none';
    });
}

// Handle sector filter
function handleSectorFilter() {
    const sector = filterSector.value;
    const cards = document.querySelectorAll('.scheme-card');
    
    cards.forEach(card => {
        if (sector === '' || card.textContent.includes(sector)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Show scheme details (placeholder for modal)
function showSchemeDetails(schemeId) {
    const scheme = schemes.find(s => s.id === schemeId);
    if (scheme) {
        alert(`Detailed view for: ${scheme.name}\n\n${scheme.detailedDescription || scheme.description}`);
    }
}

// Handle alert form submission
function handleAlertSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    localStorage.setItem('alertEmail', email);
    alert(currentLanguage === 'en' ? 
        'Thank you for subscribing! You will now receive email alerts for new schemes matching your profile.' :
        'सदस्यता लेने के लिए धन्यवाद! अब आपको अपने प्रोफाइल से मेल खाने वाली नई योजनाओं के लिए ईमेल अलर्ट प्राप्त होंगे।'
    );
    e.target.reset();
}

// Enhanced showRegister function
function showRegister() {
    const registerModal = document.getElementById("register");
    registerModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    
    // Reset scroll position when opening modal
    const modalContent = registerModal.querySelector('.modal-content');
    modalContent.scrollTop = 0;
    
    // Focus on first input field
    const firstInput = registerModal.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

// Enhanced showLogin function
function showLogin() {
    const loginModal = document.getElementById("login");
    loginModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    
    // Reset scroll position when opening modal
    const modalContent = loginModal.querySelector('.modal-content');
    modalContent.scrollTop = 0;
    
    // Focus on first input field
    const firstInput = loginModal.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

// Enhanced closeModal function
function closeModal() {
    document.getElementById("register").style.display = "none";
    document.getElementById("login").style.display = "none";
    document.body.style.overflow = "auto";
}

// Fix cut button in login form
function resetLoginForm() {
    document.getElementById("loginForm").reset();
    const errorMessages = document.querySelectorAll('#loginForm .error-message');
    errorMessages.forEach(msg => msg.remove());
}

// Enhanced handleLoginSubmit function
function handleLoginSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('loginRememberMe').checked;

    // Get all registered users
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = existingUsers.find(u => u.username === username && atob(u.password) === password);

    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update stored users if needed
        if (rememberMe) {
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        }

        alert(currentLanguage === 'en' ? 
            `Welcome back, ${user.name}!` : 
            `वापस स्वागत है, ${user.name}!`
        );
        closeModal();
        checkAuthStatus();
        return;
    }

    alert(currentLanguage === 'en' ? 
        'Invalid username or password. Please try again.' : 
        'अमान्य उपयोगकर्ता नाम या पासवर्ड। कृपया पुन: प्रयास करें।'
    );
}

// Enhanced handleRegisterSubmit function
function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const businessType = document.getElementById('registerBusinessType').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        alert(currentLanguage === 'en' ? 
            'Passwords do not match!' : 
            'पासवर्ड मेल नहीं खाते!'
        );
        return;
    }

    // Check if username already exists
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    if (existingUsers.some(user => user.username === username)) {
        alert(currentLanguage === 'en' ? 
            'Username already exists! Please choose another.' : 
            'उपयोगकर्ता नाम पहले से मौजूद है! कृपया कोई अन्य चुनें।'
        );
        return;
    }

    // Create user object with hashed password (basic example)
    const user = {
        id: Date.now().toString(),
        name,
        email,
        username,
        password: btoa(password), // Basic obfuscation
        businessType,
        registeredDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    // Store user
    existingUsers.push(user);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    localStorage.setItem('currentUser', JSON.stringify(user));

    alert(currentLanguage === 'en' ? 
        `Thank you for registering, ${name}! You are now logged in.` : 
        `पंजीकरण के लिए धन्यवाद, ${name}! अब आप लॉग इन हैं।`
    );

    closeModal();
    checkAuthStatus();
    resetRegisterForm();
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();
    alert(currentLanguage === 'en' ? 
        'Thank you for your message! We will get back to you soon.' : 
        'आपके संदेश के लिए धन्यवाद! हम जल्द ही आपके पास वापस आएंगे।'
    );
    e.target.reset();
}

// Open guide tab
function openGuideTab(tabId) {
    // Hide all tab contents
    guideTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Activate clicked button
    const activeButton = document.querySelector(`.tab-btn[onclick*="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Toggle FAQ item
function toggleFAQ(e) {
    const question = e.currentTarget;
    const answer = question.nextElementSibling;
    const toggle = question.querySelector('.faq-toggle');
    
    question.classList.toggle('active');
    answer.classList.toggle('active');
    
    if (question.classList.contains('active')) {
        toggle.textContent = '−';
    } else {
        toggle.textContent = '+';
    }
}

// Toggle accordion
function toggleAccordion(button) {
    const content = button.nextElementSibling;
    const toggle = button.querySelector('.accordion-toggle');
    
    button.classList.toggle('active');
    content.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        toggle.textContent = '−';
    } else {
        toggle.textContent = '+';
    }
}

// Render histogram chart
function renderHistogram() {
    const ctx = document.getElementById('histogram').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.histogramChart) {
        window.histogramChart.destroy();
    }
    
    window.histogramChart = new Chart(ctx, {
        type: 'bar',
        data: histogramData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: currentLanguage === 'en' ? 
                        'Agri-MSMEs Dependency on Middlemen' : 
                        'मध्यस्थों पर कृषि-एमएसएमई की निर्भरता',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return currentLanguage === 'en' ? 
                                `${context.parsed.y} businesses` : 
                                `${context.parsed.y} व्यवसाय`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: currentLanguage === 'en' ? 'Number of Businesses' : 'व्यवसायों की संख्या'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: currentLanguage === 'en' ? 'Dependency Level' : 'निर्भरता स्तर'
                    }
                }
            }
        }
    });
}

// Form Validation with Auto-Scroll to Errors
document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const firstInvalidInput = document.querySelector("#registerForm input:invalid, #registerForm select:invalid");
    if (firstInvalidInput) {
        firstInvalidInput.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
        firstInvalidInput.focus();
        firstInvalidInput.classList.add('invalid-input');
        
        // Remove feedback after interaction
        firstInvalidInput.addEventListener('input', function() {
            this.classList.remove('invalid-input');
        }, { once: true });
        
        return false;
    }
    
    // If form is valid, proceed with registration
    handleRegisterSubmit(e);
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
