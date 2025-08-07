// promotions.js

const promoCarousel = document.getElementById("promoCarousel");
const leftArrow = document.querySelector(".promo-arrow.left");
const rightArrow = document.querySelector(".promo-arrow.right");

fetch("data/products.json")
    .then((response) => response.json())
    .then((data) => {
        const promotions = data.filter((product) => product.category === "Promotions");

        promotions.forEach((product) => {
            const item = document.createElement("div");
            item.classList.add("promo-item");
            item.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h4>${product.name}</h4>
        <p>$${product.price.toFixed(2)}</p>
        <button onclick="addToFavorites(${product.id})">❤ Favorite</button>
        <button onclick="addToCart(${product.id})">🛒 Add to Cart</button>
      `;
            promoCarousel.appendChild(item);
        });
    });

leftArrow.addEventListener("click", () => {
    promoCarousel.scrollBy({ left: -300, behavior: "smooth" });
});

rightArrow.addEventListener("click", () => {
    promoCarousel.scrollBy({ left: 300, behavior: "smooth" });
});

function addToFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart[index].quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
}
