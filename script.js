// script.js → COMPLETELY FIXED CART SYSTEM (November 2025)

let allProducts = [];
let cart = JSON.parse(localStorage.getItem("twoDotsCart") || "[]");

// ==================== CART SYSTEM - COMPLETELY FIXED ====================
function saveCart() {
  localStorage.setItem("twoDotsCart", JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badges = document.querySelectorAll(".cart-badge");
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  badges.forEach(badge => {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  });
}

// FIXED addToCart → ALWAYS SAVES FULL ABSOLUTE IMAGE URL
function addToCart(productId, name, price, image, selectedSize = "M") {
  const id = Number(productId);
  
  // THIS LINE FIXES EVERYTHING — CONVERTS relative → absolute URL
  const fullImageUrl = new URL(image, window.location.href).href;

  const existing = cart.find(i => i.id === id && i.size === selectedSize);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      image: fullImageUrl,   // ← NOW ALWAYS FULL URL
      size: selectedSize,
      qty: 1
    });
  }
  saveCart();
  showCartFeedback("Added to bag!");
}
// FIXED: Convert ID to number
function removeOne(id, size) {
  const numId = Number(id); // Convert to number
  const item = cart.find(i => i.id === numId && i.size === size);
  if (item && item.qty > 1) {
    item.qty--;
  } else {
    cart = cart.filter(i => !(i.id === numId && i.size === size));
  }
  saveCart();
  if (document.getElementById("cartItems")) renderCart();
}

// FIXED: Convert ID to number
function removeItem(id, size) {
  const numId = Number(id); // Convert to number
  cart = cart.filter(i => !(i.id === numId && i.size === size));
  saveCart();
  if (document.getElementById("cartItems")) renderCart();
}

// FIXED: Convert ID to number
function addOne(id, size) {
  const numId = Number(id); // Convert to number
  const item = cart.find(i => i.id === numId && i.size === size);
  if (item) {
    item.qty++;
    saveCart();
    if (document.getElementById("cartItems")) renderCart();
  }
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const emptyState = document.getElementById("emptyState");
  const cartContent = document.getElementById("cartContent");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("totalAmount");

  if (!container) return;

  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    if (cartContent) cartContent.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (cartContent) cartContent.style.display = "block";

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // FIXED: No need to convert in template since cart stores numbers
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <a href="product.html?id=${item.id}">
        <img src="${item.image}" alt="${item.name}">
      </a>
      <div class="cart-item-info">
        <a href="product.html?id=${item.id}" style="text-decoration:none;color:inherit;">
          <h4 class="cart-item-name">${item.name}</h4>
        </a>
        <div class="size-tag">Size: ${item.size}</div>
        
        <div class="qty-controls">
          <button class="qty-btn qty-minus" onclick="removeOne('${item.id}','${item.size}')">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn qty-plus" onclick="addOne('${item.id}','${item.size}')">+</button>
        </div>
        
        <div style="display:flex;justify-content:space-between;align-items:end;">
          <button class="remove-btn" onclick="removeItem('${item.id}','${item.size}')">
            <i class="fas fa-trash"></i> Remove
          </button>
          <div class="item-price">₹${item.price * item.qty}</div>
        </div>
      </div>
    </div>
  `).join("");

  if (subtotalEl) subtotalEl.textContent = "₹" + subtotal;
  if (totalEl) totalEl.textContent = "₹" + subtotal;
}

function showCartFeedback(message) {
  const existingFeedback = document.querySelector('.cart-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }

  const feedback = document.createElement('div');
  feedback.className = 'cart-feedback';
  feedback.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #00b3a6;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 8px 25px rgba(0,179,166,0.4);
    font-size: 16px;
  `;
  feedback.textContent = message;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
    }
  }, 1500);
}

// ==================== HOMEPAGE SECTIONS ====================
function renderSection(id, arr) {
  const container = document.getElementById(id);
  if (!container || arr.length === 0) return;

  container.innerHTML = arr.slice(0, 10).map(p => `
    <a href="product.html?id=${p.id}" class="product-card" style="text-decoration:none;color:inherit;">
      <div style="position:relative;">
        <img src="${p.image}" loading="lazy" alt="${p.name}">
        ${p.new ? '<span style="position:absolute;top:8px;left:8px;background:#00b3a6;color:white;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">NEW</span>' : ''}
      </div>
      <div class="info">
        <p class="name">${p.name}</p>
        <div class="price-row">
          <span class="price">₹${p.price}</span>
          ${p.oldPrice ? `<span class="old-price">₹${p.oldPrice}</span>` : ''}
          ${p.discount ? `<span class="discount">${p.discount}</span>` : ''}
        </div>
      </div>
    </a>
  `).join('');
}

// ==================== CATALOG PAGE - FIXED CATEGORY FILTERING ====================
function setupCatalogPage(allProducts, byCategory) {
  const urlParams = new URLSearchParams(location.search);
  const filter = urlParams.get("filter");
  
  // FIXED: Proper category filtering
  let currentList = [];
  if (filter && byCategory[filter]) {
    currentList = byCategory[filter];
    console.log(`Filtering by: ${filter}, found ${currentList.length} products`);
  } else {
    currentList = [...allProducts];
    console.log(`No filter or category not found, showing all ${currentList.length} products`);
  }

  const grid = document.getElementById("catalogGrid");
  const countEl = document.querySelector(".count");

  const render = (items) => {
    if (countEl) countEl.textContent = items.length + " Products";
    if (!grid) return;
    
    if (items.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:100px;color:#999;font-size:16px;">No products found</p>`;
      return;
    }

    grid.innerHTML = items.map(p => `
      <a href="product.html?id=${p.id}" class="catalog-card">
        <div style="position:relative;">
          <img src="${p.image}" alt="${p.name}">
          ${p.new ? '<span style="position:absolute;top:10px;left:10px;background:#00b3a6;color:white;padding:5px 10px;border-radius:4px;font-size:11px;font-weight:600;">NEW</span>' : ''}
        </div>
        <div class="card-info">
          <h3>${p.name}</h3>
          <div class="price-row">
            <span class="price">₹${p.price}</span>
            ${p.oldPrice ? `<span class="old-price">₹${p.oldPrice}</span>` : ''}
            ${p.discount ? `<span class="discount">${p.discount}</span>` : ''}
          </div>
        </div>
      </a>
    `).join('');
  };

  window.applyFilters = () => {
    let list = [...currentList];
    const query = document.getElementById("searchInput")?.value.trim().toLowerCase() || "";
    if (query) list = list.filter(p => p.name.toLowerCase().includes(query));

    const colors = Array.from(document.querySelectorAll('.color-swatches input:checked')).map(cb => cb.value);
    if (colors.length) list = list.filter(p => colors.includes(p.color));

    const min = parseInt(document.getElementById("priceMin")?.value) || 299;
    const max = parseInt(document.getElementById("priceMax")?.value) || 1499;
    list = list.filter(p => p.price >= min && p.price <= max);

    render(list);
  };

  render(currentList);

  document.getElementById("searchInput")?.addEventListener("input", applyFilters);
  document.querySelectorAll('.color-swatches input').forEach(cb => cb.addEventListener("change", applyFilters));

  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const minVal = document.getElementById("minValue");
  const maxVal = document.getElementById("maxValue");
  const progress = document.querySelector(".price-slider .progress");

  if (priceMin && priceMax && minVal && maxVal && progress) {
    const updateSlider = () => {
      let min = parseInt(priceMin.value);
      let max = parseInt(priceMax.value);
      if (min > max) [min, max] = [max, min];
      priceMin.value = min; priceMax.value = max;
      minVal.textContent = min;
      maxVal.textContent = max;
      const percentMin = ((min - 299) / (1499 - 299)) * 100;
      const percentMax = ((max - 299) / (1499 - 299)) * 100;
      progress.style.left = percentMin + "%";
      progress.style.right = (100 - percentMax) + "%";
      applyFilters();
    };
    priceMin.addEventListener("input", updateSlider);
    priceMax.addEventListener("input", updateSlider);
  }

  document.getElementById("openFilter")?.addEventListener("click", () => {
    document.getElementById("filterPanel").classList.add("active");
    document.getElementById("filterOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
  });
  
  ["closeFilter", "filterOverlay"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => {
      document.getElementById("filterPanel").classList.remove("active");
      document.getElementById("filterOverlay").classList.remove("active");
      document.body.style.overflow = "auto";
    });
  });
}

// ==================== HERO SLIDER ====================
function initHeroSlider() {
  const heroSlider = document.getElementById("heroSlider");
  if (!heroSlider) return;

  const wrapper = heroSlider.querySelector(".slides-wrapper");
  const slides = heroSlider.querySelectorAll(".slide");
  const dots = heroSlider.querySelectorAll(".dot");
  let currentIndex = 0;
  let autoPlay;

  const goToSlide = (index) => {
    wrapper.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
    currentIndex = index;
  };

  const startAutoPlay = () => {
    autoPlay = setInterval(() => goToSlide((currentIndex + 1) % slides.length), 5000);
  };
  const stopAutoPlay = () => clearInterval(autoPlay);

  dots.forEach((dot, i) => dot.addEventListener("click", () => {
    goToSlide(i);
    stopAutoPlay();
    startAutoPlay();
  }));

  let startX = 0;
  heroSlider.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    stopAutoPlay();
  }, { passive: true });

  heroSlider.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

  heroSlider.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToSlide((currentIndex + 1) % slides.length) : goToSlide((currentIndex - 1 + slides.length) % slides.length);
    }
    startAutoPlay();
  });

  goToSlide(0);
  startAutoPlay();
}

// ==================== HAMBURGER MENU ====================
function initHamburgerMenu() {
  document.getElementById("menuBtn")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("active");
    document.getElementById("overlay").classList.add("active");
  });
  document.getElementById("closeBtn")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
  });
  document.getElementById("overlay")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
  });
}

// ==================== MAIN INIT - FIXED CATEGORIES ====================
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  if (document.getElementById("cartItems")) {
    renderCart();
  }

  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      allProducts = data.map(p => ({
        ...p,
        new: p.new === true,
        color: p.color || "black",
        price: parseInt(p.price) || 0
      }));

      // FIXED: Include ALL categories from JSON data
      const byCategory = {
        printed: allProducts.filter(p => p.category === "printed"),
        women: allProducts.filter(p => p.category === "women"),
        oversized: allProducts.filter(p => p.category === "oversized"),
        simple: allProducts.filter(p => p.category === "simple"),
        new: allProducts.filter(p => p.new)
      };

      console.log("Categories loaded:", Object.keys(byCategory).map(key => `${key}: ${byCategory[key].length} products`));

      if (document.getElementById("new")) {
        renderSection("new", byCategory.new);
        renderSection("printed", byCategory.printed);
        renderSection("women", byCategory.women);
        renderSection("oversized", byCategory.oversized);
      }

      if (document.getElementById("catalogGrid")) {
        setupCatalogPage(allProducts, byCategory);
      }

      initHeroSlider();
      initHamburgerMenu();
    })
    .catch(err => console.error("Failed to load products:", err));
});

// ==================== GLOBAL FUNCTION EXPORTS ====================
window.addToCart = addToCart;
window.removeOne = removeOne;
window.removeItem = removeItem;
window.addOne = addOne;
window.renderCart = renderCart;
window.updateCartBadge = updateCartBadge;

// ==================== WISHLIST FUNCTIONALITY ====================
window.toggleWishlist = (product) => {
  let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
  const exists = wishlist.find(p => p.id === product.id);
  
  if (exists) {
    wishlist = wishlist.filter(p => p.id !== product.id);
    alert("Removed from wishlist");
  } else {
    wishlist.push(product);
    alert("Added to wishlist!");
  }
  
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  document.dispatchEvent(new Event("wishlistUpdated"));
};

// Update heart icon on product page
document.addEventListener("productsLoaded", () => {
  setTimeout(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const heart = document.getElementById("wish");
    if (heart && wishlist.find(p => p.id === new URLSearchParams(location.search).get("id"))) {
      heart.classList.add("active");
    }
  }, 100);
});

// ==================== SMART PROFILE ICON - AUTO LOGIN/ACCOUNT SWITCH ====================
function updateProfileIcon() {
  const user = JSON.parse(localStorage.getItem("twoDotsUser") || "{}");
  const btn = document.getElementById("profileBottomBtn");
  const avatar = document.getElementById("profileAvatarImg");
  const text = document.getElementById("profileText");

  if (user.email) {
    // LOGGED IN → Show real avatar + name
    const photo = user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name||"You")}&background=00d4c4&color=fff&bold=true&size=128`;
    avatar.src = photo;
    text.textContent = user.name?.split(" ")[0] || "Account";
    btn.href = "account.html";
    btn.classList.add("active");
  } else {
    // NOT LOG Ged IN → Show default + Login
    avatar.src = "https://ui-avatars.com/api/?name=?&background=ddd&color=999&bold=true";
    text.textContent = "Account";
    btn.href = "login.html";
    btn.classList.remove("active");
  }
}

// Update profile icon on every page load
document.addEventListener("DOMContentLoaded", () => {
  updateProfileIcon();
  updateCartBadge();

  // Also update when user logs in/out from other pages
  window.addEventListener("storage", (e) => {
    if (e.key === "twoDotsUser") updateProfileIcon();
  });
});

// Call this after any login/logout
window.updateProfileIcon = updateProfileIcon;