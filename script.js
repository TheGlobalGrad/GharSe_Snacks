// ============ CONFIG ============
// Backend API base. Empty string works when the site is served by the same
// Express server (npm start -> http://localhost:3000). Change this if your
// frontend and backend are hosted separately.
// Port 3000 is the supplied storefront server and proxies API calls. When the
// page is opened with Live Server or directly from a file, call the local API
// service instead so forms still reach MySQL.
const API_BASE =
    location.hostname === "localhost" || location.hostname === "127.0.0.1" ?
    "http://127.0.0.1:3001" :
    "https://ghar-se-snacks-backend.onrender.com";

// ============ STATE ============
let PRODUCTS = [];
let CART = [];
let CURRENT_USER = JSON.parse(localStorage.getItem("gharse_user") || "null");
let AUTH_MODE = "login"; // "login" | "signup"
let ACTIVE_PRODUCT_ID = null;
let PRODUCT_RATINGS = new Map();

const PRODUCT_IMAGE_FILES = {
    "classic thepla box": "Images/Thepla.jpeg",
    "khakhra crunch pack": "Images/Khakhra.jpeg",
    "bhakri bites": "Images/Bhakhri.jpeg",
    "indori tikhi sev": "Images/Rtalami Sev.jpeg",
    "banana chips": "Images/Banana Chips.jpeg",
    "besan ladoo": "Images/Besan Ladoo.jpeg",
    "gathiya": "Images/Gtahiya.png",
    "bhakarwadi": "Images/Bhakarwadi.jpeg",
    "chana jor": "Images/Chana Jor.jpeg",
    "chivda": "Images/Chivda.jpeg",
    "potato chips": "Images/Potato Chips.jpeg",
    "ragi chips": "Images/Raagi Chips.jpeg",
    "soya sticks": "Images/Soya Sticks.jpeg"
};

// The storefront must remain browsable when the optional API is not running
// (for example, when index.html is opened through a static development server).
// API products replace these entries whenever the backend is available.
const PRODUCT_CATALOG = [
    ["Classic Thepla Box", "Images/Thepla.jpeg", "Soft, spiced Gujarati thepla for a comforting chai-time break."],
    ["Khakhra Crunch Pack", "Images/Khakhra.jpeg", "Light, crisp khakhra with a satisfying roasted crunch."],
    ["Bhakri Bites", "Images/Bhakhri.jpeg", "Traditional bhakri bites made for snacking anywhere."],
    ["Indori Tikhi Sev", "Images/Rtalami Sev.jpeg", "Bold, spicy sev inspired by Indore's famous flavours."],
    ["Banana Chips", "Images/Banana Chips.jpeg", "Golden, crunchy banana chips with simple coastal flavour."],
    ["Besan Ladoo", "Images/Besan Ladoo.jpeg", "A melt-in-the-mouth besan ladoo for a sweet little treat."],
    ["Gathiya", "Images/Gtahiya.png", "Classic Gujarati gathiya, crisp and ready for chai."],
    ["Bhakarwadi", "Images/Bhakarwadi.jpeg", "Spiral bhakarwadi with sweet, spicy, tangy filling."],
    ["Chana Jor", "Images/Chana Jor.jpeg", "Crunchy spiced chana jor for an anytime bite."],
    ["Chivda", "Images/Chivda.jpeg", "A savoury chivda mix with layers of crunch."],
    ["Potato Chips", "Images/Potato Chips.jpeg", "Classic potato chips with an irresistible crisp."],
    ["Ragi Chips", "Images/Raagi Chips.jpeg", "Wholesome ragi chips with a satisfying crunch."],
    ["Soya Sticks", "Images/Soya Sticks.jpeg", "Seasoned soya sticks for a protein-packed snack break."]
].map(([name, image_url, description], index) => ({
    id: -(index + 1),
    name,
    image_url,
    description,
    price: 100,
    stock: 100,
    category: "GharSe Snacks"
}));

// ============ HELPERS ============
function money(value) {
    return `₹${Number(value).toLocaleString("en-IN")}`;
}

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle("is-error", isError);
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 3200);
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
}

function showSuccess(title, message) {
    document.getElementById("successModalTitle").textContent = title;
    document.getElementById("successModalMessage").textContent = message;
    openModal("successModal");
}

function productImage(product) {
    const databasePath = String(product.image_url || "").replace(/^images\//i, "Images/");
    return databasePath || PRODUCT_IMAGE_FILES[String(product.name || "").trim().toLowerCase()] || "gharse-logo-centered.jpg";
}

function openProfile() {
    if (!CURRENT_USER) return;
    document.getElementById("profileName").textContent = CURRENT_USER.name || "GharSe member";
    const email = document.getElementById("profileEmail");
    email.textContent = CURRENT_USER.email || "";
    email.href = `mailto:${CURRENT_USER.email || ""}`;
    document.getElementById("profileCustomerId").textContent = CURRENT_USER.customerId ? `Member ID: ${CURRENT_USER.customerId}` : "";
    openModal("profileModal");
}

async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options
    });
    let data;
    try {
        data = await res.json();
    } catch (e) {
        throw new Error("Server did not return a valid response.");
    }
    if (!res.ok || data.success === false) {
        throw new Error(data.error || "Something went wrong. Please try again.");
    }
    return data;
}

// ============ REVEAL ON SCROLL ============
function initReveal() {
    const items = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
}

// ============ CAROUSEL ============
function initCarousel() {
    const carousel = document.getElementById("heroCarousel");
    if (!carousel) return;
    const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const dots = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
    let index = 0;
    let timer = null;

    function render() {
        slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
        dots.forEach((dot, i) => {
            dot.classList.toggle("is-active", i === index);
            dot.setAttribute("aria-selected", i === index ? "true" : "false");
        });
    }

    function go(newIndex) {
        index = (newIndex + slides.length) % slides.length;
        render();
    }

    function restartAutoplay() {
        clearInterval(timer);
        timer = setInterval(() => go(index + 1), 5000);
    }

    carousel.querySelectorAll("[data-carousel]").forEach((btn) => {
        btn.addEventListener("click", () => {
            go(btn.dataset.carousel === "next" ? index + 1 : index - 1);
            restartAutoplay();
        });
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            go(Number(dot.dataset.carouselSlide));
            restartAutoplay();
        });
    });

    render();
    restartAutoplay();
}

// ============ PRODUCTS ============
async function loadProducts() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;
    try {
        const data = await api("/api/products");
        const apiProducts = data.products || [];
        const productsByName = new Map(apiProducts.map((product) => [String(product.name).trim().toLowerCase(), product]));
        PRODUCTS = PRODUCT_CATALOG.map((catalogProduct) =>
            productsByName.get(catalogProduct.name.toLowerCase()) || catalogProduct
        );
    } catch (err) {
        PRODUCTS = PRODUCT_CATALOG;
        console.warn("Product API unavailable; displaying the local product catalog.", err);
    }
    reconcileCartWithProducts();
    renderProducts();
    loadProductRatings();
}

async function loadProductRatings() {
    try {
        const data = await api("/api/reviews");
        const grouped = new Map();
        (data.reviews || []).forEach((review) => {
            const ratings = grouped.get(Number(review.product_id)) || [];
            ratings.push(Number(review.rating));
            grouped.set(Number(review.product_id), ratings);
        });
        PRODUCT_RATINGS = new Map([...grouped].map(([id, ratings]) => [id, {
            average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
            count: ratings.length
        }]));
        renderProducts();
    } catch (error) {
        console.warn("Product ratings are unavailable.", error);
    }
}

function reconcileCartWithProducts() {
    const productsByName = new Map(PRODUCTS.map((product) => [String(product.name).trim().toLowerCase(), product]));
    const previousCart = JSON.stringify(CART);
    CART = CART.map((item) => {
        const product = productsByName.get(String(item.name || "").trim().toLowerCase());
        return product && Number(product.id) > 0 ? {...item, id: product.id, name: product.name, price: Number(product.price) } :
            item;
    }).filter((item) => Number(item.id) > 0 && Number(item.quantity) > 0);
    if (JSON.stringify(CART) !== previousCart) persistCart();
    renderCart();
}

function renderProducts() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;
    if (!PRODUCTS.length) {
        grid.innerHTML = `<p class="empty-reviews">No snacks available yet. Check back soon!</p>`;
        return;
    }
    grid.innerHTML = PRODUCTS.map((p) => {
        const rating = PRODUCT_RATINGS.get(Number(p.id));
        const ratingText = rating ? `${rating.average.toFixed(1)} / 5 (${rating.count})` : "No ratings yet";
        return `
        <article class="product-card reveal" data-id="${p.id}">
            <div class="product-image-wrap">
                <img src="${escapeHtml(productImage(p))}" alt="${escapeHtml(p.name)}" loading="lazy" />
            </div>
            <div class="product-top">
                <h3>${escapeHtml(p.name)}</h3>
                <span class="product-price">${Number(p.price) > 0 ? money(p.price) : 'Coming soon'}</span>
            </div>
            <p>${escapeHtml(p.description || "")}</p>
            <button class="product-rating text-link" data-view="${p.id}" type="button" aria-label="Read or write a review for ${escapeHtml(p.name)}">★★★★★ <span>${ratingText}</span></button>
            <div class="product-bottom">
                <span class="product-state ${p.stock > 0 ? '' : 'coming-soon'}">${p.stock > 0 ? "In stock" : "Will be available soon"}</span>
                <button class="product-view-btn text-link" data-view="${p.id}" type="button">View details</button>
            </div>
            <div class="product-actions">
                <div class="qty-control" data-qty-for="${p.id}">
                    <button type="button" data-qty="dec">−</button>
                    <span data-qty-value>0</span>
                    <button type="button" data-qty="inc">+</button>
                </div>
                <button class="btn btn-primary" type="button" data-add-to-cart="${p.id}">${p.stock > 0 ? 'Add to cart' : 'Notify me'}</button>
            </div>
        </article>
    `;
    }).join("");
    requestAnimationFrame(initReveal);
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

function getQtyFor(productId) {
    const el = Array.from(document.querySelectorAll(`[data-qty-for="${productId}"] [data-qty-value]`))
        .find((item) => item.offsetParent !== null);
    return el ? Number(el.textContent) : 1;
}

document.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
        const wrap = qtyBtn.closest("[data-qty-for]");
        const valueEl = wrap.querySelector("[data-qty-value]");
        let value = Number(valueEl.textContent);
        value = qtyBtn.dataset.qty === "inc" ? value + 1 : Math.max(0, value - 1);
        valueEl.textContent = value;
        return;
    }

    const addBtn = e.target.closest("[data-add-to-cart]");
    if (addBtn) {
        const id = Number(addBtn.dataset.addToCart);
        addToCart(id, getQtyFor(id));
        return;
    }

    const viewBtn = e.target.closest("[data-view]");
    if (viewBtn) {
        openProductDetail(Number(viewBtn.dataset.view));
    }
});

// ============ PRODUCT DETAIL + REVIEWS ============
async function openProductDetail(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    ACTIVE_PRODUCT_ID = productId;
    const rating = PRODUCT_RATINGS.get(Number(product.id));
    const ratingText = rating ? `${rating.average.toFixed(1)} / 5 (${rating.count} review${rating.count === 1 ? "" : "s"})` : "No ratings yet";
    const available = Number(product.stock) > 0;

    const detail = document.getElementById("productDetail");
    detail.innerHTML = `
        <div class="product-detail-layout">
            <div class="product-image-panel">
                <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.name)}" />
                <span class="detail-availability ${available ? "" : "coming-soon"}">${available ? "In stock" : "Coming soon"}</span>
            </div>
            <div class="product-detail-copy">
                <h2>${escapeHtml(product.name)}</h2>
                <div class="detail-meta"><span>${escapeHtml(product.category || "GharSe Snacks")}</span><span>${escapeHtml(product.category_code || "Category ID unavailable")}</span><span>${escapeHtml(product.product_code || `Product ID ${product.id}`)}</span></div>
                <p class="detail-description">${escapeHtml(product.description || "")}</p>
                <div class="detail-purchase">
                    <div><span class="detail-label">Price</span><strong class="product-detail-price">${Number(product.price) > 0 ? money(product.price) : "Coming soon"}</strong></div>
                    <div class="qty-control" data-qty-for="${product.id}"><button type="button" data-qty="dec" aria-label="Reduce quantity">-</button><span data-qty-value>1</span><button type="button" data-qty="inc" aria-label="Increase quantity">+</button></div>
                    <button class="btn btn-primary" type="button" data-add-to-cart="${product.id}">${available ? "Add to cart" : "Notify me"}</button>
                </div>
                <div class="product-reviews">
                    <h3>Reviews</h3>
                    <p class="detail-rating">Rating: <span>${ratingText}</span></p>
                    <div id="reviewsList" class="reviews-list"><p class="empty-reviews">Loading reviews…</p></div>
                    <form class="detail-review-form" id="reviewForm">
                        <input type="text" name="reviewer" placeholder="Your name" required />
                        <select name="reviewType" required>
                            <option value="">Bought or sampled?</option>
                            <option value="Bought from GharSe Snacks">Bought from GharSe Snacks</option>
                            <option value="Tried a sample">Tried a sample</option>
                        </select>
                        <fieldset class="rating-picker star-picker">
                            <legend>Your rating</legend>
                            ${[1, 2, 3, 4, 5].map((n) => `
                                <label class="star-choice"><input type="radio" name="rating" value="${n}" ${n === 5 ? "checked" : ""} />★</label>
                            `).join("")}
                        </fieldset>
                        <textarea name="comment" rows="3" placeholder="Tell others what you thought" required></textarea>
                        <button class="btn btn-primary" type="submit">Submit review</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    openModal("productModal");
    loadReviews(productId);
}

async function loadReviews(productId) {
    const list = document.getElementById("reviewsList");
    try {
        const data = await api("/api/reviews");
        const reviews = (data.reviews || []).filter((r) => r.product_id === productId);
        if (!reviews.length) {
            list.innerHTML = "";
            return;
        }
        if (!reviews.length) {
            list.innerHTML = `<p class="empty-reviews">No reviews yet — be the first to share one!</p>`;
            return;
        }
        list.innerHTML = reviews.map((r) => `
            <div class="review-card">
                <div class="review-card-head">
                    <strong>${escapeHtml(r.reviewer)}</strong>
                    <span class="review-type">${escapeHtml(r.review_type)}</span>
                </div>
                <p>${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</p>
                <p>${escapeHtml(r.comment)}</p>
                <small>${new Date(r.created_at).toLocaleDateString("en-IN")}</small>
            </div>
        `).join("");
    } catch (err) {
        list.innerHTML = `<p class="empty-reviews">Could not load reviews.</p>`;
    }
}

document.addEventListener("submit", async(e) => {
    if (e.target.id !== "reviewForm") return;
    e.preventDefault();
    if (!CURRENT_USER) {
        showToast("Please create an account or log in before posting a review.", true);
        openModal("authModal");
        return;
    }
    const form = e.target;
    const formData = new FormData(form);
    try {
        await api("/api/reviews", {
            method: "POST",
            body: JSON.stringify({
                productId: ACTIVE_PRODUCT_ID,
                userId: CURRENT_USER?.id || null,
                reviewer: formData.get("reviewer"),
                reviewType: formData.get("reviewType"),
                rating: Number(formData.get("rating")),
                comment: formData.get("comment")
            })
        });
        form.reset();
        loadReviews(ACTIVE_PRODUCT_ID);
        showToast("Thanks for your review!");
    } catch (err) {
        showToast(err.message, true);
    }
});

// ============ CART ============
function persistCart() {
    localStorage.setItem("gharse_cart", JSON.stringify(CART));
}

function loadCart() {
    CART = JSON.parse(localStorage.getItem("gharse_cart") || "[]");
    renderCart();
}

async function addToCart(productId, quantity) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    if (!Number.isInteger(quantity) || quantity < 1) return;
    if (Number(product.stock) <= 0) {
        if (!CURRENT_USER) {
            showToast("Please log in to request an unavailable product.", true);
            openModal("authModal");
            return;
        }
        try {
            const result = await api('/api/product-interest', {
                method: 'POST',
                body: JSON.stringify({ productId, userId: CURRENT_USER.id, quantity })
            });
            showToast(`You'll be notified when ${product.name} is available.`);
        } catch (error) {
            showToast(error.message, true);
        }
        return;
    }
    const existing = CART.find((item) => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        CART.push({ id: productId, name: product.name, price: product.price, quantity });
    }
    persistCart();
    renderCart();
    showToast(`${product.name} added to cart.`);
}

function removeFromCart(productId) {
    CART = CART.filter((item) => item.id !== productId);
    persistCart();
    renderCart();
}

function renderCart() {
    const countEl = document.getElementById("cartCount");
    const itemsEl = document.getElementById("cartItems");
    const totalItems = CART.reduce((sum, item) => sum + item.quantity, 0);
    if (countEl) countEl.textContent = totalItems;
    document.getElementById("cartTrigger")?.setAttribute(
        "aria-label",
        `Shopping cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`
    );

    if (itemsEl) {
        if (!CART.length) {
            itemsEl.innerHTML = `<p class="empty-reviews">Your cart is empty. Add some snacks to get started!</p>`;
        } else {
            itemsEl.innerHTML = CART.map((item) => `
                <div class="cart-item">
                    <div>
                        <h4>${escapeHtml(item.name)}</h4>
                        <p>${money(item.price)} × ${item.quantity}</p>
                    </div>
                    <div class="qty-control">
                        <strong>${money(item.price * item.quantity)}</strong>
                        <button type="button" data-remove-from-cart="${item.id}" aria-label="Remove item">×</button>
                    </div>
                </div>
            `).join("");
        }
    }

    const subtotal = CART.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal;
    const subtotalEl = document.getElementById("subtotalValue");
    const totalEl = document.getElementById("totalValue");
    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    if (totalEl) totalEl.textContent = money(total);
}

document.addEventListener("click", (e) => {
    const removeBtn = e.target.closest("[data-remove-from-cart]");
    if (removeBtn) removeFromCart(Number(removeBtn.dataset.removeFromCart));
});

// ============ CHECKOUT (RAZORPAY) ============
document.addEventListener("submit", async(e) => {
    if (e.target.id !== "checkoutForm") return;
    e.preventDefault();

    if (!CART.length) {
        showToast("Your cart is empty.", true);
        return;
    }

    const form = e.target; 
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
        const data = await api("/api/create-order", {
            method: "POST",
            body: JSON.stringify({
                customer: { userId: CURRENT_USER ? CURRENT_USER.id : null },
                items: CART.map((item) => ({ id: item.id, quantity: item.quantity }))
            })
        });

        const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            name: "GharSe Snacks",
            description: "Order payment",
            order_id: data.orderId,
            handler: async function(response) {
                try {
                    await api("/api/verify-payment", {
                        method: "POST",
                        body: JSON.stringify(response)
                    });
                    CART = [];
                    persistCart();
                    renderCart();
                    closeModal("cartModal");
                    showSuccess("Payment successful!", `Order ${data.orderNumber} is confirmed. We'll notify you with updates.`);
                    form.reset();
                } catch (err) {
                    showToast(err.message, true);
                }
            },
            theme: { color: "#a4100d" }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (err) {
        showToast(err.message, true);
    } finally {
        submitBtn.disabled = false;
    }
});

// ============ AUTH (LOGIN / SIGNUP) ============
function setAuthMode(mode) {
    AUTH_MODE = mode;
    const modalCard = document.querySelector("#authModal .modal-card");
    const title = document.getElementById("authTitle");
    const switchText = document.getElementById("authSwitchText");
    const toggleBtn = document.getElementById("toggleAuthMode");
    const nameInput = document.querySelector('#authForm [name="name"]');

    modalCard.classList.toggle("signup-mode", mode === "signup");
    document.querySelectorAll("#authForm .signup-only").forEach((el) => {
        el.required = mode === "signup" && ["name", "contact", "place", "address"].includes(el.name);
    });
    if (nameInput) nameInput.required = mode === "signup";

    if (mode === "signup") {
        title.textContent = "Create account";
        switchText.textContent = "Already have an account? ";
        toggleBtn.textContent = "Login instead";
    } else {
        title.textContent = "Login";
        switchText.textContent = "New user? ";
        toggleBtn.textContent = "Create account";
    }
}

document.getElementById("authTrigger")?.addEventListener("click", () => {
    if (CURRENT_USER) return openProfile();
    setAuthMode("login");
    openModal("authModal");
});

document.addEventListener("change", (e) => {
    if (!e.target.matches('input[name="rating"]')) return;
    const selected = Number(e.target.value);
    e.target.closest(".star-picker").querySelectorAll(".star-choice").forEach((star) => {
        star.classList.toggle("selected", Number(star.querySelector("input").value) <= selected);
    });
});

document.getElementById("logoutButton")?.addEventListener("click", () => {
    CURRENT_USER = null;
    localStorage.removeItem("gharse_user");
    closeModal("profileModal");
    showToast("You have been logged out.");
});

document.getElementById("toggleAuthMode")?.addEventListener("click", () => {
    setAuthMode(AUTH_MODE === "login" ? "signup" : "login");
});

document.getElementById("authForm")?.addEventListener("submit", async(e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
        const endpoint = AUTH_MODE === "signup" ? "/api/auth/signup" : "/api/auth/login";
        const payload = AUTH_MODE === "signup" ? {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            contact: formData.get("contact"),
            place: formData.get("place"),
            address: formData.get("address"),
            preferredSnacks: formData.get("preferredSnacks")
        } : {
            identifier: formData.get("email"),
            password: formData.get("password")
        };

        const data = await api(endpoint, { method: "POST", body: JSON.stringify(payload) });

        if (AUTH_MODE === "signup") {
            showToast("Account created! Please log in.");
            setAuthMode("login");
            form.reset();
        } else {
            CURRENT_USER = data.user;
            localStorage.setItem("gharse_user", JSON.stringify(CURRENT_USER));
            closeModal("authModal");
            showToast(`Welcome back, ${data.user.name}!`);
            form.reset();
        }
    } catch (err) {
        showToast(err.message, true);
    } finally {
        submitBtn.disabled = false;
    }
});

// ============ PARTNER FORM ============
document.getElementById("partnerForm")?.addEventListener("submit", async(e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
        const data = await api("/api/partner-interest", {
            method: "POST",
            body: JSON.stringify({
                name: formData.get("name"),
                contact: formData.get("contact"),
                email: formData.get("email"),
                state: formData.get("state"),
                details: formData.get("details")
            })
        });
        form.reset();
        showSuccess("Thank you!", `We've received your partner application (${data.partnerId}). Our team will reach out soon.`);
    } catch (err) {
        showToast(err.message, true);
    } finally {
        submitBtn.disabled = false;
    }
});

// ============ SUBSCRIBE FORM ============
document.getElementById("subscribeForm")?.addEventListener("submit", async(e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
        const data = await api("/api/subscriptions", {
            method: "POST",
            body: JSON.stringify({ email: formData.get("email"), userId: CURRENT_USER?.id || null })
        });
        form.reset();
        showToast(data.alreadySubscribed ? "You're already on the list!" : "Subscribed! Watch your inbox for updates.");
    } catch (err) {
        showToast(err.message, true);
    } finally {
        submitBtn.disabled = false;
    }
});

// ============ MODAL OPEN/CLOSE WIRING ============
document.getElementById("cartTrigger")?.addEventListener("click", () => openModal("cartModal"));
document.getElementById("forgotPasswordTrigger")?.addEventListener("click", () => { closeModal("authModal"); openModal("resetPasswordModal"); });
document.getElementById("resetRequestForm")?.addEventListener("submit", async (e) => {
    e.preventDefault(); const form = e.target; const email = new FormData(form).get("email");
    try { await api("/api/auth/password-reset/request", { method: "POST", body: JSON.stringify({ email }) }); document.querySelector('#resetConfirmForm [name="email"]').value = email; document.getElementById("resetConfirmForm").classList.remove("is-hidden"); showToast("Reset code sent if that email has an account."); } catch (error) { showToast(error.message, true); }
});
document.getElementById("resetConfirmForm")?.addEventListener("submit", async (e) => {
    e.preventDefault(); const form = e.target; const data = new FormData(form);
    try { await api("/api/auth/password-reset/confirm", { method: "POST", body: JSON.stringify(Object.fromEntries(data)) }); form.reset(); closeModal("resetPasswordModal"); openModal("authModal"); showToast("Password updated. Please log in."); } catch (error) { showToast(error.message, true); }
});
document.getElementById("suggestionTrigger")?.addEventListener("click", () => openModal("suggestionModal"));
document.getElementById("suggestionForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    try {
        await api("/api/suggestions", { method: "POST", body: JSON.stringify({ userId: CURRENT_USER?.id || null, name: data.get("name"), email: data.get("email"), suggestion: data.get("suggestion") }) });
        form.reset(); closeModal("suggestionModal"); showSuccess("Thank you!", "Your suggestion has been saved.");
    } catch (error) { showToast(error.message, true); }
});

document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-close]");
    if (closeBtn) closeModal(closeBtn.dataset.close);
    if (e.target.classList.contains("modal") || e.target.classList.contains("success-modal")) {
        e.target.classList.remove("open");
        e.target.setAttribute("aria-hidden", "true");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll(".modal.open, .success-modal.open").forEach((m) => {
            m.classList.remove("open");
            m.setAttribute("aria-hidden", "true");
        });
    }
});

// ============ INIT ============
document.addEventListener("DOMContentLoaded", () => {
    initReveal();
    initCarousel();
    loadProducts();
    loadCart();
    setAuthMode("login");
});