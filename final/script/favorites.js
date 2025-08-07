document.addEventListener('DOMContentLoaded', () => {
    const favoritesContainer = document.getElementById('favoritesContainer');
    const favoriteIds = JSON.parse(localStorage.getItem('favorites')) || [];

    fetch('data/products.json')
        .then(res => res.json())
        .then(products => {
            const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));

            if (favoriteProducts.length === 0) {
                favoritesContainer.innerHTML = '<p style="margin: 2rem auto;">No favorites yet.</p>';
                return;
            }

            favoriteProducts.forEach(product => {
                const card = document.createElement('div');
                card.classList.add('promo-item');
                card.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <h4>${product.name}</h4>
          <p>R$${product.price.toFixed(2)}</p>
          <button onclick="removeFavorite(${product.id})">❌ Remove</button>
          <button onclick="addToCart(${product.id})">🛒 Add to Cart</button>
        `;
                favoritesContainer.appendChild(card);
            });
        });
});

// Reuse this from script.js or duplicate if needed
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Added to cart!");
}

function removeFavorite(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    location.reload();
}
