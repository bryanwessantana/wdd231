document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cartContainer');
    const cartTotal = document.getElementById('cartTotal');
    const cartIds = JSON.parse(localStorage.getItem('cart')) || [];

    fetch('data/products.json')
        .then(res => res.json())
        .then(products => {
            const cartItems = {};

            // Count quantities
            cartIds.forEach(id => {
                cartItems[id] = (cartItems[id] || 0) + 1;
            });

            let total = 0;

            Object.keys(cartItems).forEach(id => {
                const product = products.find(p => p.id === parseInt(id));
                if (!product) return;

                const quantity = cartItems[id];
                const subtotal = product.price * quantity;
                total += subtotal;

                const card = document.createElement('div');
                card.classList.add('promo-item');
                card.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <h4>${product.name}</h4>
          <p>Price: R$${product.price.toFixed(2)}</p>
          <p>Quantity: ${quantity}</p>
          <p>Subtotal: R$${subtotal.toFixed(2)}</p>
          <button onclick="removeFromCart(${product.id})">❌ Remove</button>
        `;
                cartContainer.appendChild(card);
            });

            cartTotal.textContent = total.toFixed(2);
        });
});

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.indexOf(productId);
    if (index > -1) {
        cart.splice(index, 1); // Remove one instance
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    location.reload();
}

function clearCart() {
    localStorage.removeItem('cart');
    location.reload();
}
