let allProducts = []; // Will hold products loaded from JSON

// Fetch product data once and initialize all
async function loadProducts() {
    try {
        const res = await fetch('scripts/data/products.json');
        allProducts = await res.json();
        document.dispatchEvent(new Event('productsLoaded')); // 🔹 Trigger event
        initializePage();
    } catch (error) {
        console.error("Failed to load products.json:", error);
    }
}

function initializePage() {
    updateYearAndModified();
    initThemeToggle();
    renderProductsByCategory();
    loadFavorites();
    loadCart();
    initPromoCarousel();
    initOtherUI();
}

// Update year and last modified
function updateYearAndModified() {
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    const lastModifiedEl = document.getElementById('lastModified');
    if (lastModifiedEl) lastModifiedEl.textContent = `Last updated: ${document.lastModified}`;
}

// Theme toggle
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });
}

// Render products by category (for product listing pages)
function renderProductsByCategory() {
    const productTrack = document.querySelector('.product-track');
    if (!productTrack) return;

    const category = productTrack.dataset.category;
    if (!category) return;

    const filtered = allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());

    productTrack.innerHTML = ''; // clear existing

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p>R$${p.price.toFixed(2)}</p>
            <button onclick="addToCart(${p.id})" aria-label="Add ${p.name} to cart">Add to Cart</button>
            <button onclick="addToFavorites(${p.id})" aria-label="Add ${p.name} to favorites">❤️ Favorite</button>
        `;
        productTrack.appendChild(card);
    });
}

// Add to favorites
function addToFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert("Added to favorites!");
        loadFavorites();
    } else {
        alert("Already in favorites.");
    }
}

// Remove from favorites
function removeFromFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
}

// Load favorites on favorites page
function loadFavorites() {
    const favoritesContainer = document.getElementById('favoritesContainer');
    if (!favoritesContainer) return;

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesContainer.innerHTML = '';

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `<p style="text-align:center; font-style: italic; color: gray;">You have no favorite items yet.</p>`;
        return;
    }

    favorites.forEach(favId => {
        const product = allProducts.find(p => p.id === favId);
        if (product) {
            const favCard = document.createElement('div');
            favCard.className = 'promo-item';
            favCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p>R$${product.price.toFixed(2)}</p>
                <button class="remove-favorite" data-id="${product.id}">Remove ❤️</button>
            `;
            favoritesContainer.appendChild(favCard);
        }
    });

    // Add remove event listeners
    favoritesContainer.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = parseInt(e.target.dataset.id);
            removeFromFavorites(id);
        });
    });
}

// Add item to cart
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Added to cart!");
    loadCart(); // refresh cart UI if on cart page
}

// Remove all occurrences of productId from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(id => id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Decrease quantity by removing one occurrence
function decreaseCartQuantity(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.indexOf(productId);
    if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

// Clear entire cart
function clearCart() {
    localStorage.removeItem('cart');
    loadCart();
}

// Load cart items with quantities and render
function loadCart() {
    const cartContainer = document.getElementById('cartContainer');
    const cartTotalEl = document.getElementById('cartTotal');
    if (!cartContainer || !cartTotalEl) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = `<p style="text-align:center; font-style: italic; color: gray; width: 100%;">Your cart is empty.</p>`;
        cartTotalEl.textContent = '0.00';
        return;
    }

    let total = 0;
    const quantities = {};
    cart.forEach(id => {
        quantities[id] = (quantities[id] || 0) + 1;
    });

    Object.entries(quantities).forEach(([idStr, qty]) => {
        const id = parseInt(idStr);
        const product = allProducts.find(p => p.id === id);
        if (product) {
            total += product.price * qty;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p>R$${product.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="qty-decrease" data-id="${id}" aria-label="Decrease quantity of ${product.name}">-</button>
                    <span class="qty-value">${qty}</span>
                    <button class="qty-increase" data-id="${id}" aria-label="Increase quantity of ${product.name}">+</button>
                </div>
                <button class="remove-item" data-id="${id}" aria-label="Remove ${product.name} from cart">Remove</button>
            `;
            cartContainer.appendChild(cartItem);
        }
    });

    cartTotalEl.textContent = total.toFixed(2);

    // Add listeners for quantity and remove buttons
    cartContainer.querySelectorAll('.qty-increase').forEach(btn => {
        btn.addEventListener('click', e => {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
            loadCart();
        });
    });

    cartContainer.querySelectorAll('.qty-decrease').forEach(btn => {
        btn.addEventListener('click', e => {
            const productId = parseInt(e.target.dataset.id);
            decreaseCartQuantity(productId);
            loadCart();
        });
    });

    cartContainer.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', e => {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
            loadCart();
        });
    });
}

// Initialize promo carousel on the promo page
function initPromoCarousel() {
    const promoCarousel = document.getElementById('promoCarousel');
    if (!promoCarousel) return;

    promoCarousel.innerHTML = '';

    const promotions = allProducts.filter(p => p.category.toLowerCase() === 'promotions');
    promotions.forEach(product => {
        const promoCard = document.createElement('div');
        promoCard.classList.add('promo-item');
        promoCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>R$${product.price.toFixed(2)}</p>
            <button onclick="addToFavorites(${product.id})" aria-label="Add ${product.name} to favorites">❤️ Favorite</button>
            <button onclick="addToCart(${product.id})" aria-label="Add ${product.name} to cart">🛒 Add to Cart</button>
        `;
        promoCarousel.appendChild(promoCard);
    });

    // Promo carousel arrow controls (optional)
    document.querySelector('.promo-arrow.left')?.addEventListener('click', () => {
        promoCarousel.scrollBy({ left: -300, behavior: 'smooth' });
    });
    document.querySelector('.promo-arrow.right')?.addEventListener('click', () => {
        promoCarousel.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

function initOtherUI() {
    // Navigation menu toggle example, footer social icons, etc.
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }

    // Footer social icons
    const footerRight = document.createElement('div');
    footerRight.className = 'footer-right';
    footerRight.setAttribute('data-aos', 'fade-left');

    footerRight.innerHTML = `
      <div class="social-icons">
        <a href="https://www.instagram.com" target="_blank" aria-label="Instagram">
          <i class="fab fa-instagram fa-lg"></i>
        </a>
        <a href="https://www.facebook.com" target="_blank" aria-label="Facebook">
          <i class="fab fa-facebook fa-lg"></i>
        </a>
        <a href="https://www.youtube.com" target="_blank" aria-label="YouTube">
          <i class="fab fa-youtube fa-lg"></i>
        </a>
        <a href="https://wa.me" target="_blank" aria-label="WhatsApp">
          <i class="fab fa-whatsapp fa-lg"></i>
        </a>
      </div>
    `;

    const footerContainer = document.querySelector('footer .footer-container');
    if (footerContainer) footerContainer.appendChild(footerRight);

    // Initialize AOS animations if you use it
    if (window.AOS) AOS.init({ duration: 800, once: true, easing: 'ease-in-out' });
}

// LOGIN FORM HANDLER (optional, unchanged)
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.getElementById('loginLink');

    // Check if user is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser) {
        // Show logout button, hide login link
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (loginLink) loginLink.style.display = 'none';
    } else {
        // Show login link, hide logout button
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginLink) loginLink.style.display = 'inline-block';
    }

    // Logout button click handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser'); // Clear login info
            alert('You have logged out.');
            window.location.href = 'login.html'; // Redirect to login page
        });
    }
});

// The navigation link indicates the crrent page the user is on
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll("nav a");

    links.forEach(link => {
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");
        }
    });
});

// === SEARCH BAR ===
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const itemsList = document.querySelectorAll('#items li'); // For pages with static list
    const params = new URLSearchParams(window.location.search);
    const searchTermDisplay = document.getElementById('searchTerm');
    const searchResultsContainer = document.getElementById('searchResults'); // For searchbar.html dynamic results
    const currentPage = window.location.pathname.split("/").pop();

    function filterItems(term) {
        const lowerTerm = term.toLowerCase();
        itemsList.forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(lowerTerm) ? '' : 'none';
        });
    }

    function performSearch() {
        const term = searchInput.value.trim();
        if (term) {
            if (itemsList.length > 0) filterItems(term);
            if (currentPage !== 'searchbar.html') {
                window.location.href = `categories/searchbar.html?q=${encodeURIComponent(term)}`;
            }
        }
    }

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (itemsList.length > 0) filterItems(searchInput.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // On searchbar.html — show results dynamically
    if (currentPage === 'searchbar.html') {
        const term = params.get('q') || '';

        if (searchTermDisplay) {
            searchTermDisplay.textContent = term
                ? `Results for "${term}":`
                : 'No search term provided.';
        }

        if (searchInput) searchInput.value = term;

        if (searchResultsContainer) {
            // Wait until products are loaded
            const showResults = () => {
                searchResultsContainer.innerHTML = ''; // Clear

                if (!term) {
                    searchResultsContainer.innerHTML = '<p style="text-align:center; color:gray;">No search term provided.</p>';
                    return;
                }

                const results = allProducts.filter(p =>
                    p.name.toLowerCase().includes(term.toLowerCase())
                );

                if (results.length === 0) {
                    searchResultsContainer.innerHTML = '<p style="text-align:center; color:gray;">No products found.</p>';
                    return;
                }

                results.forEach(p => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <img src="${p.image}" alt="${p.name}">
                        <h4>${p.name}</h4>
                        <p>R$${p.price.toFixed(2)}</p>
                        <button onclick="addToCart(${p.id})">🛒 Add to Cart</button>
                        <button onclick="addToFavorites(${p.id})">❤️ Favorite</button>
                    `;
                    searchResultsContainer.appendChild(card);
                });
            };

            // If products already loaded
            if (allProducts.length > 0) {
                showResults();
            } else {
                document.addEventListener('productsLoaded', showResults);
            }
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const category = document.body.dataset.category;
    const container = document.getElementById("product-grid");

    // Map friendly page names to actual JSON category names
    const categoryMap = {
        "Clothes": "Karate Gear",
        "Supplements": "Supplement",
        "Health": "Health",
        "Promotions": "Promotions"
    };

    const realCategory = categoryMap[category] || category;

    // Adjust JSON path depending on current folder
    const pathToJSON = window.location.pathname.includes("/categories/")
        ? "../scripts/data/products.json"
        : "scripts/data/products.json";

    fetch(pathToJSON)
        .then(res => res.json())
        .then(products => {
            const filtered = products.filter(p =>
                p.category.toLowerCase() === realCategory.toLowerCase()
            );

            if (filtered.length === 0) {
                container.innerHTML = `<p>No products found in this category.</p>`;
                return;
            }

            container.innerHTML = filtered.map(product => `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="brand">${product.brand}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="desc">${product.description}</p>
                </div>
            `).join('');
        })
        .catch(err => {
            console.error("Error loading products:", err);
            container.innerHTML = `<p>Error loading products.</p>`;
        });
});

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('thankYouMessage')) {
        const name = localStorage.getItem('contactName') || 'Friend';
        document.getElementById('thankYouMessage').textContent =
            `Thanks, ${name}, your message has been sent.`;
        localStorage.removeItem('contactName');
    }
});

// Start by loading products.json on page load
document.addEventListener('DOMContentLoaded', loadProducts);