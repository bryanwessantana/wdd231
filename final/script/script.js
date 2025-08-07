document.addEventListener('DOMContentLoaded', () => {
    // Update Year
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = `${new Date().getFullYear()} `;
    }

    // Update Last Modified
    const lastModifiedEl = document.getElementById('lastModified');
    if (lastModifiedEl) {
        lastModifiedEl.textContent = `Last updated: ${document.lastModified}`;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark');
        });
    }

    const productTrack = document.querySelector('.product-track');
    const category = productTrack?.dataset.category;

    const allProducts = [
        { name: "Whey Protein", price: "$49.99", image: "../images/whey-protein.jpg", category: "supplements" },
        { name: "Creatine Monohydrate", price: "$39.99", image: "../images/creatine.jpg", category: "supplements" },
        { name: "Pre Workout", price: "$34.99", image: "../images/preworkout.jpg", category: "supplements" },
        { name: "Fitness Shaker", price: "$9.99", image: "../images/shaker.jpg", category: "supplements" },

        { name: "Karate Gi", price: "$59.99", image: "../images/karate-gi.jpg", category: "clothes" },
        { name: "Black Belt", price: "$39.99", image: "../images/black-belt.jpg", category: "clothes" },
        { name: "Karate Gloves", price: "$24.99", image: "../images/gloves.jpg", category: "clothes" },
        { name: "Karate Headgear", price: "$44.99", image: "../images/headgear.jpg", category: "clothes" },

        { name: "Resistance Bands Set", price: "$29.99", image: "../images/resistance-bands.jpg", category: "health" },
        { name: "Lifting Straps", price: "$14.99", image: "../images/lifting-straps.jpg", category: "health" },
        { name: "Massage Roller", price: "$19.99", image: "../images/massage-roller.jpg", category: "health" },

        { name: "Focus Mitts - 20% Off", price: "$21.99", image: "../images/focus-mitts.jpg", category: "promotions" },
        { name: "Promo: Karate Gloves Pack", price: "$18.99", image: "../images/gloves-pack.jpg", category: "promotions" },
        { name: "Summer Supplement Sale", price: "$44.99", image: "../images/summer-sale.jpg", category: "promotions" }
    ];

    if (productTrack && category) {
        const filtered = allProducts.filter(p => p.category === category);

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <h4>${p.name}</h4>
                <p>${p.price}</p>
                <button>Add to Cart</button>
            `;
            productTrack.appendChild(card);
        });
    }
});

// PROMOTIONS FROM JSON
fetch('script/data/products.json')
    .then(res => res.json())
    .then(products => {
        const promoCarousel = document.getElementById('promoCarousel');
        const promotions = products.filter(p => p.category.toLowerCase() === 'promotions');

        promotions.forEach(product => {
            const promoCard = document.createElement('div');
            promoCard.classList.add('promo-item');
            promoCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h4>${product.name}</h4>
        <p>R$${product.price.toFixed(2)}</p>
        <button onclick="addToFavorites(${product.id})">❤️ Favorite</button>
        <button onclick="addToCart(${product.id})">🛒 Add to Cart</button>
      `;
            promoCarousel.appendChild(promoCard);
        });
    })
    .catch(err => console.error('Error loading promotions:', err));

// CAROUSEL ARROW CONTROLS
document.querySelector('.promo-arrow.left')?.addEventListener('click', () => {
    document.getElementById('promoCarousel').scrollBy({ left: -300, behavior: 'smooth' });
});

document.querySelector('.promo-arrow.right')?.addEventListener('click', () => {
    document.getElementById('promoCarousel').scrollBy({ left: 300, behavior: 'smooth' });
});

function addToFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert("Added to favorites!");
    } else {
        alert("Already in favorites.");
    }
}

// ADD ITEM TO THE CART

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cart.includes(productId)) {
        cart.push(productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert("Added to cart!");
    } else {
        alert("Already in cart.");
    }
}

// SOCIAL MEDIA LINKS

AOS.init({
    duration: 800,
    once: true,
    easing: 'ease-in-out',
});

// Toggle navigation
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }

    // Create social media icons
    const footerRight = document.createElement('div');
    footerRight.className = 'footer-right';
    footerRight.setAttribute('data-aos', 'fade-left');

    footerRight.innerHTML = `
      <div class="social-icons">
        <a href="https://www.instagram.com/lyrics_ingles_personalizado/" target="_blank" aria-label="Instagram">
          <i class="fab fa-instagram fa-lg"></i>
        </a>
        <a href="https://www.facebook.com/lyricseducacao/" target="_blank" aria-label="Facebook">
          <i class="fab fa-facebook fa-lg"></i>
        </a>
        <a href="https://www.youtube.com/@lyricsidiomas8791" target="_blank" aria-label="YouTube">
          <i class="fab fa-youtube fa-lg"></i>
        </a>
        <a href="https://wa.me/41988939608" target="_blank" aria-label="WhatsApp">
          <i class="fab fa-whatsapp fa-lg"></i>
        </a>
      </div>
    `;

    const footerContainer = document.querySelector('footer .footer-container');
    if (footerContainer) {
        footerContainer.appendChild(footerRight);
    }
});