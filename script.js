// Store timer IDs and event handlers for cleanup
let countdownInterval = null;
let socialProofInterval = null;
let viewerCountInterval = null;
let viewerCountTimeout = null;
let exitIntentShown = false;

// Named event handlers for proper cleanup
const handleScroll = function() {
    const floatingButton = document.getElementById('floating-buy-button');
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercentage > 50) {
        floatingButton.classList.remove('hidden');
        floatingButton.classList.add('flex');
    } else {
        floatingButton.classList.remove('flex');
        floatingButton.classList.add('hidden');
    }
};

const handleMouseLeave = function(e) {
    if (e.clientY <= 0 && !exitIntentShown) {
        const exitPopup = document.getElementById('exit-popup');
        exitPopup.classList.remove('hidden');
        exitPopup.classList.add('flex');
        exitIntentShown = true;
        sessionStorage.setItem('exitIntentShown', 'true');
    }
};

const handlePurchaseFormSubmit = function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    
    // Initialize Paystack
    const handler = PaystackPop.setup({
        key: 'pk_test_xxxxxxxxxxxxx', // Replace with your actual Paystack public key
        email: formData.get('email'),
        amount: 2700, // 27 GHS in pesewas
        currency: 'GHS',
        channels: formData.get('payment_method') === 'momo' 
            ? ['mobile_money'] 
            : ['card'],
        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: formData.get('name')
                },
                {
                    display_name: "Phone Number",
                    variable_name: "phone_number",
                    value: formData.get('phone') || 'N/A'
                },
                {
                    display_name: "Product",
                    variable_name: "product",
                    value: "The Ghanaian Goddess Code"
                }
            ]
        },
        callback: function(response) {
            // Payment successful
            console.log('Payment successful!', response.reference);
            // Close modal
            const purchaseModal = document.getElementById('purchase-modal');
            purchaseModal.classList.remove('flex');
            purchaseModal.classList.add('hidden');
            // Redirect to thank you page (you'll need to create this)
            window.location.href = '/thank-you.html';
        },
        onClose: function() {
            // User closed payment popup
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Complete Purchase - 27 GHS <i class="fas fa-lock ml-2"></i>';
        }
    });
    
    handler.openIframe();
};

const handleContactFormSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Here you would normally send to your backend
    alert('Thank you for your message! We will respond within 24 hours.');
    form.reset();
};

const handleNewsletterFormSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    
    // Here you would normally send to your backend
    alert(`Thank you for subscribing! We'll send exclusive tips to ${email}`);
    form.reset();
};

// Countdown timer function
function startCountdown() {
    const updateTimer = () => {
        const now = new Date();
        const midnight = new Date();
        midnight.setDate(midnight.getDate() + 1); // Set to tomorrow
        midnight.setHours(24, 0, 0, 0); // Set to midnight of tomorrow

        const diff = midnight - now;

        if (diff <= 0) {
            // If somehow we're past midnight, set to next day
            midnight.setDate(midnight.getDate() + 1);
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Update all countdown displays
        const hoursElements = document.querySelectorAll('#hours, #hours2');
        const minutesElements = document.querySelectorAll('#minutes, #minutes2');
        const secondsElements = document.querySelectorAll('#seconds, #seconds2');

        hoursElements.forEach(el => el.textContent = String(hours).padStart(2, '0'));
        minutesElements.forEach(el => el.textContent = String(minutes).padStart(2, '0'));
        secondsElements.forEach(el => el.textContent = String(seconds).padStart(2, '0'));
    };

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// Social proof notifications
function startSocialProofNotifications() {
    const names = [
        // English names (70%)
        'Sarah J.', 'Emmanuella W.', 'Olivia M.', 'Sophia L.', 'Gifty T.',
        'Isabella C.', 'Emerald K.', 'Charlotte R.', 'Amelia S.', 'Sandra P.',
        'Evelyn B.', 'Abigail G.', 'Emily D.', 'Ella H.', 'Madison F.',
        'Luna A.', 'Grace I.', 'Chloe N.', 'Camila V.', 'Aurora O.',
        'Eleanor Q.', 'Jane U.', 'Hannah X.', 'Layla Y.', 'Obaya Z.',
        'Gabriella J.', 'Riley K.', 'Zoey L.', 'Nora M.', 'Lily W.',
        'Aria C.', 'Aaliyah S.', 'Eliana R.', 'Quinn T.', 'Gabriella P.',
        'Bennett F.', 'James S.', 'Oliver T.', 'Elijah M.', 'Christabel K.',
        'Doreen P.', 'Henry V.', 'Theodora B.', 'Edina D.', 'Queen H.',
        'Sebastian L.', 'Samuel R.', 'Nana Ekua A.', 'Joseph O.', 'Wyatt Q.',

        // Ghanaian names (30%)
        'Ama K.', 'Akosua M.', 'Abena T.', 'Afia S.', 'Adwoa P.',
        'Esi D.', 'Efua A.', 'Yaa B.', 'Akua J.', 'Adjoa L.',
        'Ama A.', 'Akosua B.', 'Abena C.', 'Afia D.', 'Adwoa E.',
        'Esi F.', 'Efua G.', 'Yaa H.', 'Akua I.', 'Adjoa J.'
    ];
    
    const cities = [
        'Accra', 'Kumasi', 'Tema', 'Takoradi', 'Kasoa',
        'Cape Coast', 'Koforidua', 'Sunyani', 'Legon', 'KNUST'
    ];
    
    const times = ['just now', '2 minutes ago', '5 minutes ago', '8 minutes ago'];
    
    const showNotification = () => {
        const container = document.getElementById('social-proof-container');
        const name = names[Math.floor(Math.random() * names.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        
        const notification = document.createElement('div');
        notification.className = 'slide-in bg-white rounded-lg shadow-2xl p-4 mb-3 border-l-4 border-green-500 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-3">
                    <i class="fas fa-check-circle text-green-500 text-xl mt-1"></i>
                    <div>
                        <p class="font-semibold text-gray-900">${name} from ${city}</p>
                        <p class="text-sm text-gray-600">Just purchased The Ghanaian Goddess Code</p>
                        <p class="text-xs text-gray-500 mt-1">${time}</p>
                    </div>
                </div>
                <button class="close-notification text-gray-400 hover:text-gray-600 ml-2">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Add close functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Limit to 3 notifications at a time
        const notifications = container.querySelectorAll('.slide-in');
        if (notifications.length > 3) {
            notifications[0].remove();
        }
    };
    
    // Show first notification after 3 seconds
    setTimeout(showNotification, 3000);
    
    // Then show every 15 seconds
    socialProofInterval = setInterval(showNotification, 15000);
}

// Live viewer count
function startViewerCount() {
    let currentViewers = 23;
    
    const updateViewerCount = () => {
        // Randomly change by -1, 0, or +1
        const change = Math.floor(Math.random() * 3) - 1;
        currentViewers = Math.max(18, Math.min(35, currentViewers + change));
        
        const viewerNumberElement = document.getElementById('viewer-number');
        if (viewerNumberElement) {
            viewerNumberElement.textContent = currentViewers;
        }
    };
    
    // Show after 2 seconds
    viewerCountTimeout = setTimeout(() => {
        const viewerCount = document.getElementById('viewer-count');
        viewerCount.classList.remove('hidden');
        viewerCount.classList.add('fade-in');
        
        // Update every 8 seconds
        viewerCountInterval = setInterval(updateViewerCount, 8000);
    }, 2000);
}

// FAQ accordion functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        question.addEventListener('click', () => {
            const isOpen = !answer.classList.contains('hidden');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
            document.querySelectorAll('.faq-question i').forEach(i => i.style.transform = 'rotate(0deg)');
            
            // Toggle current FAQ
            if (!isOpen) {
                answer.classList.remove('hidden');
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// Modal functionality
function initializeModals() {
    const purchaseModal = document.getElementById('purchase-modal');
    const exitPopup = document.getElementById('exit-popup');
    const closeModalBtn = document.getElementById('close-modal');
    const closeExitPopupBtn = document.getElementById('close-exit-popup');
    
    // Open purchase modal on CTA button click
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            purchaseModal.classList.remove('hidden');
            purchaseModal.classList.add('flex');
        });
    });

    // Open purchase modal from exit popup
    const exitPopupCtaButtons = exitPopup.querySelectorAll('.cta-button');
    exitPopupCtaButtons.forEach(button => {
        button.addEventListener('click', () => {
            exitPopup.classList.remove('flex');
            exitPopup.classList.add('hidden');
            purchaseModal.classList.remove('hidden');
            purchaseModal.classList.add('flex');
        });
    });
    
    // Close modal
    closeModalBtn.addEventListener('click', () => {
        purchaseModal.classList.remove('flex');
        purchaseModal.classList.add('hidden');
    });
    
    // Close exit popup
    closeExitPopupBtn.addEventListener('click', () => {
        exitPopup.classList.remove('flex');
        exitPopup.classList.add('hidden');
    });
    
    // Close modal on outside click
    purchaseModal.addEventListener('click', (e) => {
        if (e.target === purchaseModal) {
            purchaseModal.classList.remove('flex');
            purchaseModal.classList.add('hidden');
        }
    });

    exitPopup.addEventListener('click', (e) => {
        if (e.target === exitPopup) {
            exitPopup.classList.remove('flex');
            exitPopup.classList.add('hidden');
        }
    });
}

// Scroll to "See What's Inside" button
function initializeScrollButtons() {
    const scrollButtons = document.querySelectorAll('.scroll-to-inside');
    scrollButtons.forEach(button => {
        button.addEventListener('click', () => {
            const insideSection = document.querySelector('section:has(h2:contains("Complete"))');
            if (insideSection) {
                insideSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Fallback: scroll to book mockup section
                window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize everything
export function init() {
    // Check if exit intent was already shown
    if (sessionStorage.getItem('exitIntentShown')) {
        exitIntentShown = true;
    }
    
    // Start countdown timer
    startCountdown();
    
    // Start social proof notifications
    startSocialProofNotifications();
    
    // Start viewer count
    startViewerCount();
    
    // Initialize FAQ accordion
    initializeFAQ();
    
    // Initialize modals
    initializeModals();
    
    // Initialize scroll buttons
    initializeScrollButtons();
    
    // Add scroll listener for floating button
    window.addEventListener('scroll', handleScroll);
    
    // Add exit-intent listener
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Add floating buy button listener
    const floatingButton = document.getElementById('floating-buy-button');
    floatingButton.addEventListener('click', () => {
        const purchaseModal = document.getElementById('purchase-modal');
        purchaseModal.classList.remove('hidden');
        purchaseModal.classList.add('flex');
    });
    
    // Add payment form listener
    const paymentForm = document.getElementById('payment-form');
    paymentForm.addEventListener('submit', handlePurchaseFormSubmit);
    
    // Add contact form listener
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    // Add newsletter form listener
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterFormSubmit);
    }
}

// Cleanup function
export function teardown() {
    // Clear all intervals
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    if (socialProofInterval) {
        clearInterval(socialProofInterval);
        socialProofInterval = null;
    }
    
    if (viewerCountInterval) {
        clearInterval(viewerCountInterval);
        viewerCountInterval = null;
    }
    
    if (viewerCountTimeout) {
        clearTimeout(viewerCountTimeout);
        viewerCountTimeout = null;
    }
    
    // Remove event listeners
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('mouseleave', handleMouseLeave);
    
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.removeEventListener('submit', handlePurchaseFormSubmit);
    }
    
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.removeEventListener('submit', handleContactFormSubmit);
    }
    
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.removeEventListener('submit', handleNewsletterFormSubmit);
    }
    
    // Reset exit intent flag
    exitIntentShown = false;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}