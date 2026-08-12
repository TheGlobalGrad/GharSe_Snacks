// =====================================================
// CONFIG
// =====================================================

// Backend API base.
// Local development -> http://127.0.0.1:3001
// Deployed website -> Render backend
const API_BASE =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ?
    "http://127.0.0.1:3001" :
    "https://gharsesnacks.onrender.com";

// =====================================================
// STATE
// =====================================================

let PRODUCTS = [];
let CART = [];
let CURRENT_USER = JSON.parse(
    localStorage.getItem("gharse_user") || "null"
);
let AUTH_MODE = "login";
let ACTIVE_PRODUCT_ID = null;
let PRODUCT_RATINGS = new Map();

// =====================================================
// LOCAL PRODUCT IMAGE CATALOG
// =====================================================

const PRODUCT_IMAGE_FILES = {
    "sev": "Images/Sev.jpeg",

    "spicy parmal / murmure": "Images/Spicy Parmal.jpeg",

    "spicy potato chips": "Images/Spicy Potato Chips.jpeg",

    "banana chips": "Images/Banana Chips.jpeg",

    "bhakarwadi": "Images/Bhakarwadi.jpeg",

    "chana jor": "Images/Chana Jor.jpeg",

    "besan ladoo": "Images/Besan Ladoo.jpeg",

    "masala khakhra": "Images/Coming Soon.jpeg",

    "methi khakhra": "Images/Coming Soon.jpeg",

    "jeera khakhra": "Images/Coming Soon.jpeg",

    "thepla": "Images/Coming Soon.jpeg",

    "coin khakhra (peri peri)": "Images/Coming Soon.jpeg",

    "coin khakhra (pani puri)": "Images/Coming Soon.jpeg",

    "coin khakhra (jain)": "Images/Coming Soon.jpeg",

    "coin khakhra (achari)": "Images/Coming Soon.jpeg",

    "soya chips": "Images/Coming Soon.jpeg",

    "raagi chips": "Images/Coming Soon.jpeg",

    "beetroot chips": "Images/Coming Soon.jpeg",

    "bhakhri": "Images/Coming Soon.jpeg",

    "coming soon": "Images/Coming Soon.jpeg"
};

// =====================================================
// CITY / CATEGORY CODES
// =====================================================



// =====================================================
// PRODUCT CATALOG
// =====================================================

const PRODUCT_CATALOG = [

    // =================================================
    // RATLAM
    // =================================================

    {
        name: "Sev",
        city: "Ratlam",
        price: 69,
        pack_size: "100g / packet",
        image_url: "Images/Sev.jpeg",
        description: "Crispy and flavourful Ratlami sev, perfect for chai-time snacking.",
        stock: 100,
        category: "Ratlami Snacks"
    },


    // =================================================
    // INDORE
    // =================================================

    {
        name: "Spicy Potato Chips",
        city: "Indore",
        price: 30,
        pack_size: "50g / packet",
        image_url: "Images/Spicy Potato Chips.jpeg",
        description: "Crispy spicy potato chips with a bold, satisfying crunch.",
        stock: 100,
        category: "Indori Snacks"
    },

    {
        name: "Spicy Parmal / Murmure",
        city: "Indore",
        price: 69,
        pack_size: "100g / packet",
        image_url: "Images/Spicy Parmal.jpeg",
        description: "A spicy and crunchy Indori-style parmal and murmure snack.",
        stock: 100,
        category: "Indori Snacks"
    },


    // =================================================
    // KOCHI
    // =================================================

    {
        name: "Banana Chips",
        city: "Kochi",
        price: 30,
        pack_size: "50g / packet",
        image_url: "Images/Banana Chips.jpeg",
        description: "Crispy banana chips inspired by Kerala's classic snack.",
        stock: 100,
        category: "Kerala Snacks"
    },


    // =================================================
    // PUNE
    // =================================================

    {
        name: "Bhakarwadi",
        city: "Pune",
        price: 89,
        pack_size: "200g / packet",
        image_url: "Images/Bhakarwadi.jpeg",
        description: "Sweet, spicy and tangy spiral bhakarwadi with a delicious crunch.",
        stock: 100,
        category: "Maharashtrian Snacks"
    },


    // =================================================
    // BIKANER
    // =================================================

    {
        name: "Chana Jor",
        city: "Bikaner",
        price: 49,
        pack_size: "100g / packet",
        image_url: "Images/Chana Jor.jpeg",
        description: "Crunchy spiced chana jor for an anytime snack.",
        stock: 100,
        category: "Rajasthani Snacks"
    },


    // =================================================
    // JAIPUR
    // =================================================

    {
        name: "Besan Ladoo",
        city: "Jaipur",
        price: 30,
        pack_size: "~63g / piece",
        image_url: "Images/Besan Ladoo.jpeg",
        description: "Traditional besan ladoo with a rich, comforting sweetness.",
        stock: 100,
        category: "Rajasthani Sweets"
    },


    // =================================================
    // AHMEDABAD — COMING SOON
    // =================================================

    {
        name: "Masala Khakhra",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Crispy Gujarati khakhra with a delicious masala flavour.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Methi Khakhra",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Classic Gujarati khakhra flavoured with methi.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Jeera Khakhra",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Light and crispy khakhra with the familiar flavour of jeera.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Thepla",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Soft, spiced Gujarati thepla made for a comforting snack.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Coin Khakhra (Peri Peri)",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Mini coin-shaped khakhra with a spicy peri peri flavour.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Coin Khakhra (Pani Puri)",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Mini coin-shaped khakhra with a fun pani puri-inspired flavour.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Coin Khakhra (Jain)",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Mini coin-shaped Jain-friendly khakhra.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Coin Khakhra (Achari)",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Mini coin-shaped khakhra with a tangy achari flavour.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Soya Chips",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Crunchy soya-based chips for a satisfying snack.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Raagi Chips",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Crunchy raagi chips with a wholesome twist.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Beetroot Chips",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Crispy beetroot chips with a distinctive flavour.",
        stock: 0,
        category: "Gujarati Snacks"
    },

    {
        name: "Bhakhri",
        city: "Ahmedabad",
        price: null,
        pack_size: "",
        image_url: "Images/Coming Soon.jpeg",
        description: "Traditional Gujarati bhakhri made for everyday snacking.",
        stock: 0,
        category: "Gujarati Snacks"
    }

].map((product, index) => ({

    ...product,

    // Internal local ID
    id: -(index + 1),

    // GharSe Snacks category ID


    image_url: product.image_url ||
        "Images/Coming Soon.jpeg"

}));

// =====================================================
// HELPERS
// =====================================================

function money(value) {
    return `₹${Number(value).toLocaleString("en-IN")}`;
}

function showToast(message, isError = false) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.toggle(
        "is-error",
        isError
    );

    toast.classList.add("show");

    clearTimeout(showToast._t);

    showToast._t =
        setTimeout(
            () => toast.classList.remove("show"),
            3200
        );
}

function openModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}

function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}

function showSuccess(title, message) {

    const titleEl =
        document.getElementById(
            "successModalTitle"
        );

    const messageEl =
        document.getElementById(
            "successModalMessage"
        );

    if (titleEl)
        titleEl.textContent = title;

    if (messageEl)
        messageEl.textContent = message;

    openModal("successModal");
}

function productImage(product) {

    const name =
        String(product.name || "")
        .trim()
        .toLowerCase();

    if (
        Number(product.stock) <= 0 ||
        product.price == null
    ) {
        return "Images/Coming Soon.jpeg";
    }

    return (
        PRODUCT_IMAGE_FILES[name] ||
        product.image_url ||
        "Logo.jpeg"
    );
}

function openProfile() {

    if (!CURRENT_USER) return;

    document.getElementById(
            "profileName"
        ).textContent =
        CURRENT_USER.name ||
        "GharSe member";

    const email =
        document.getElementById(
            "profileEmail"
        );

    email.textContent =
        CURRENT_USER.email || "";

    email.href =
        `mailto:${CURRENT_USER.email || ""}`;

    document.getElementById(
            "profileCustomerId"
        ).textContent =
        CURRENT_USER.customerId ?
        `Member ID: ${CURRENT_USER.customerId}` :
        "";

    openModal("profileModal");
}

async function api(path, options = {}) {

    const res = await fetch(
        `${API_BASE}${path}`, {
            headers: {
                "Content-Type": "application/json"
            },
            ...options
        }
    );

    let data;

    try {

        data = await res.json();

    } catch (e) {

        throw new Error(
            "Server did not return a valid response."
        );

    }

    if (!res.ok ||
        data.success === false
    ) {

        throw new Error(
            data.error ||
            "Something went wrong. Please try again."
        );

    }

    return data;
}

// =====================================================
// REVEAL ON SCROLL
// =====================================================

function initReveal() {

    const items =
        document.querySelectorAll(
            ".reveal"
        );

    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "is-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            }, {
                threshold: 0.12
            }
        );

    items.forEach(
        (item) =>
        observer.observe(item)
    );
}

// =====================================================
// CAROUSEL
// =====================================================

function initCarousel() {

    const carousel =
        document.getElementById(
            "heroCarousel"
        );

    if (!carousel) return;

    const slides =
        Array.from(
            carousel.querySelectorAll(
                ".carousel-slide"
            )
        );

    const dots =
        Array.from(
            carousel.querySelectorAll(
                "[data-carousel-slide]"
            )
        );

    let index = 0;
    let timer = null;


    function render() {

        slides.forEach(
            (slide, i) =>
            slide.classList.toggle(
                "is-active",
                i === index
            )
        );

        dots.forEach(
            (dot, i) => {

                dot.classList.toggle(
                    "is-active",
                    i === index
                );

                dot.setAttribute(
                    "aria-selected",
                    i === index ?
                    "true" :
                    "false"
                );

            }
        );

    }


    function go(newIndex) {

        if (!slides.length) return;

        index =
            (newIndex + slides.length) %
            slides.length;

        render();

    }


    function restartAutoplay() {

        clearInterval(timer);

        timer =
            setInterval(
                () => go(index + 1),
                5000
            );

    }


    carousel
        .querySelectorAll(
            "[data-carousel]"
        )
        .forEach((btn) => {

            btn.addEventListener(
                "click",
                () => {

                    go(
                        btn.dataset.carousel ===
                        "next" ?
                        index + 1 :
                        index - 1
                    );

                    restartAutoplay();

                }
            );

        });


    dots.forEach((dot) => {

        dot.addEventListener(
            "click",
            () => {

                go(
                    Number(
                        dot.dataset.carouselSlide
                    )
                );

                restartAutoplay();

            }
        );

    });


    render();
    restartAutoplay();
}

// =====================================================
// PRODUCTS
// =====================================================

async function loadProducts() {

    const grid =
        document.getElementById(
            "productGrid"
        );

    if (!grid) return;


    try {

        const data =
            await api(
                "/api/products"
            );

        const apiProducts =
            data.products || [];


        const productsByName =
            new Map(
                apiProducts.map(
                    (product) => [
                        String(
                            product.name
                        )
                        .trim()
                        .toLowerCase(),

                        product
                    ]
                )
            );


        PRODUCTS =
            PRODUCT_CATALOG.map(
                (localProduct) => {

                    const dbProduct =
                        productsByName.get(
                            localProduct.name
                            .trim()
                            .toLowerCase()
                        );


                    if (!dbProduct) {

                        return localProduct;

                    }


                    return {

                        ...dbProduct,

                        // LOCAL catalog controls:
                        // price, city, image, stock,
                        // and pack size
                        ...localProduct,

                        // DATABASE internal numeric ID
                        id: Number(
                            dbProduct.id
                        ),

                        category: localProduct.category ||
                            dbProduct.category,

                        city: localProduct.city,

                        pack_size: localProduct.pack_size ||
                            dbProduct.pack_size ||
                            "",

                        // Keep our display IDs
                        category_code: dbProduct.category_id || "",
                        product_code: dbProduct.product_code || ""

                    };

                }
            );


        // Desired product/city order
        const cityOrder = [
            "Ratlam",
            "Indore",
            "Kochi",
            "Pune",
            "Bikaner",
            "Jaipur",
            "Ahmedabad"
        ];


        PRODUCTS.sort(
            (a, b) =>
            cityOrder.indexOf(a.city) -
            cityOrder.indexOf(b.city)
        );


    } catch (err) {

        // If API is unavailable,
        // use local catalog.
        PRODUCTS =
            PRODUCT_CATALOG;

        console.warn(
            "Product API unavailable; displaying the local product catalog.",
            err
        );

    }


    reconcileCartWithProducts();

    renderProducts();


    if (
        typeof loadProductRatings ===
        "function"
    ) {

        loadProductRatings();

    }

}

// =====================================================
// RECONCILE CART
// =====================================================

function reconcileCartWithProducts() {

    const productsByName =
        new Map(
            PRODUCTS.map(
                (product) => [
                    String(product.name)
                    .trim()
                    .toLowerCase(),
                    product
                ]
            )
        );


    const previousCart =
        JSON.stringify(CART);


    CART = CART
        .map((item) => {

            const product =
                productsByName.get(
                    String(item.name || "")
                    .trim()
                    .toLowerCase()
                );


            return product &&
                Number(product.id) > 0

                ?
                {
                    ...item,
                    id: product.id,
                    name: product.name,
                    price: Number(
                        product.price
                    ),
                    pack_size: product.pack_size || ""
                }

            : item;

        })
        .filter(
            (item) =>
            Number(item.id) > 0 &&
            Number(item.quantity) > 0
        );


    if (
        JSON.stringify(CART) !==
        previousCart
    ) {

        persistCart();

    }


    renderCart();
}

// =====================================================
// RENDER PRODUCTS
// =====================================================

function renderProducts() {

    const grid =
        document.getElementById(
            "productGrid"
        );

    if (!grid) return;


    if (!PRODUCTS.length) {

        grid.innerHTML =
            `<p class="empty-reviews">
                No snacks available yet. Check back soon!
            </p>`;

        return;

    }


    grid.innerHTML =
        PRODUCTS.map((p) => {

            const rating =
                PRODUCT_RATINGS.get(
                    Number(p.id)
                );


            const ratingText =
                rating ?
                `${rating.average.toFixed(1)} / 5 (${rating.count})` :
                "No ratings yet";


            return `

                <article
                    class="product-card reveal"
                    data-id="${p.id}"
                >

                    <div class="product-image-wrap">

                        <img
                            src="${escapeHtml(
                                productImage(p)
                            )}"
                            alt="${escapeHtml(
                                p.name
                            )}"
                            loading="lazy"
                        />

                    </div>


                    <div class="product-top">

                        <div>

                            <h3>
                                ${escapeHtml(
                                    p.name
                                )}
                            </h3>

                            <small class="product-city">
                                ${escapeHtml(
                                    p.city || ""
                                )}
                            </small>

                        </div>


                        <span class="product-price">

                            ${
                                p.price != null &&
                                Number(p.price) > 0

                                    ? money(p.price)

                                    : "Coming soon"
                            }

                        </span>

                    </div>


                    <p>
                        ${escapeHtml(
                            p.description || ""
                        )}
                    </p>


                    <button
                        class="product-rating text-link"
                        data-view="${p.id}"
                        type="button"
                        aria-label="Read or write a review for ${escapeHtml(
                            p.name
                        )}"
                    >

                        ★★★★★

                        <span>
                            ${ratingText}
                        </span>

                    </button>


                    <div class="product-bottom">

                        <span
                            class="product-state ${
                                p.stock > 0
                                    ? ""
                                    : "coming-soon"
                            }"
                        >

                            ${
                                p.stock > 0
                                    ? "In stock"
                                    : "Will be available soon"
                            }

                        </span>


                        <button
                            class="product-view-btn text-link"
                            data-view="${p.id}"
                            type="button"
                        >
                            View details
                        </button>

                    </div>


                    <div class="product-actions">

                        <div
                            class="qty-control"
                            data-qty-for="${p.id}"
                        >

                            <button
                                type="button"
                                data-qty="dec"
                            >
                                −
                            </button>

                            <span data-qty-value>
                                0
                            </span>

                            <button
                                type="button"
                                data-qty="inc"
                            >
                                +
                            </button>

                        </div>


                        <button
                            class="btn btn-primary"
                            type="button"
                            data-add-to-cart="${p.id}"
                        >

                            ${
                                p.stock > 0
                                    ? "Add to cart"
                                    : "Notify me"
                            }

                        </button>

                    </div>

                </article>

            `;

        }).join("");


    requestAnimationFrame(
        initReveal
    );
}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(str) {

    const div =
        document.createElement("div");

    div.textContent =
        str == null ?
        "" :
        String(str);

    return div.innerHTML;
}

// =====================================================
// QUANTITY
// =====================================================

function getQtyFor(productId) {

    const el =
        Array.from(
            document.querySelectorAll(
                `[data-qty-for="${productId}"] [data-qty-value]`
            )
        ).find(
            (item) =>
            item.offsetParent !== null
        );


    return el ?
        Number(el.textContent) :
        0;
}

// =====================================================
// PRODUCT BUTTON CLICKS
// =====================================================

document.addEventListener(
    "click",
    (e) => {

        const qtyBtn =
            e.target.closest(
                "[data-qty]"
            );


        if (qtyBtn) {

            const wrap =
                qtyBtn.closest(
                    "[data-qty-for]"
                );

            const valueEl =
                wrap.querySelector(
                    "[data-qty-value]"
                );


            let value =
                Number(
                    valueEl.textContent
                );


            value =
                qtyBtn.dataset.qty ===
                "inc"

            ?
            value + 1

                : Math.max(
                0,
                value - 1
            );


            valueEl.textContent =
                value;

            return;

        }


        const addBtn =
            e.target.closest(
                "[data-add-to-cart]"
            );


        if (addBtn) {

            const id =
                Number(
                    addBtn.dataset.addToCart
                );

            const quantity =
                getQtyFor(id);


            if (quantity < 1) {

                showToast(
                    "Please select a quantity first.",
                    true
                );

                return;

            }


            addToCart(
                id,
                quantity
            );

            return;

        }


        const viewBtn =
            e.target.closest(
                "[data-view]"
            );


        if (viewBtn) {

            openProductDetail(
                Number(
                    viewBtn.dataset.view
                )
            );

        }

    }
);

// =====================================================
// PRODUCT DETAIL + REVIEWS
// =====================================================

async function openProductDetail(
    productId
) {

    const product =
        PRODUCTS.find(
            (p) =>
            Number(p.id) ===
            Number(productId)
        );


    if (!product) return;


    ACTIVE_PRODUCT_ID =
        productId;


    const rating =
        PRODUCT_RATINGS.get(
            Number(product.id)
        );


    const ratingText =
        rating

        ?
        `${rating.average.toFixed(1)} / 5 (${rating.count} review${
                rating.count === 1
                    ? ""
                    : "s"
            })`

    : "No ratings yet";


    const available =
        Number(product.stock) > 0;


    const detail =
        document.getElementById(
            "productDetail"
        );


    if (!detail) return;


    detail.innerHTML = `

        <div class="product-detail-layout">


            <div class="product-image-panel">

                <img
                    src="${escapeHtml(
                        productImage(product)
                    )}"
                    alt="${escapeHtml(
                        product.name
                    )}"
                />

                <span
                    class="detail-availability ${
                        available
                            ? ""
                            : "coming-soon"
                    }"
                >

                    ${
                        available
                            ? "In stock"
                            : "Coming soon"
                    }

                </span>

            </div>


            <div class="product-detail-copy">

                <h2>
                    ${escapeHtml(
                        product.name
                    )}
                </h2>


                <!--
                    Category and Product IDs are
                    intentionally smaller.
                -->

                <div class="detail-meta">

                    <span>
                        ${escapeHtml(
                            product.category ||
                            "GharSe Snacks"
                        )}
                    </span>


                    <span
                        class="detail-id"
                        style="
                            font-size: 0.72rem;
                            opacity: 0.7;
                            font-weight: 500;
                        "
                    >
                        Category ID:
                        ${escapeHtml(
                            product.category_code ||
                            "Unavailable"
                        )}
                    </span>


                    <span
                        class="detail-id"
                        style="
                            font-size: 0.72rem;
                            opacity: 0.7;
                            font-weight: 500;
                        "
                    >
                        Product ID:
                        ${escapeHtml(
                            product.product_code ||
                            `GSS-PRODUCT-${String(
                                product.id
                            ).padStart(6, "0")}`
                        )}
                    </span>

                </div>


                <p class="detail-description">

                    ${escapeHtml(
                        product.description ||
                        ""
                    )}

                </p>


                <div class="detail-purchase">

                    <div>

                        <span class="detail-label">
                            Price
                        </span>

                        <strong
                            class="product-detail-price"
                        >

                            ${
                                Number(
                                    product.price
                                ) > 0

                                    ? money(
                                        product.price
                                    )

                                    : "Coming soon"
                            }

                        </strong>


                        ${
                            product.pack_size &&
                            Number(product.price) > 0

                                ? `

                                    <div
                                        class="product-pack-size"
                                        style="
                                            margin-top: 6px;
                                            font-size: 0.9rem;
                                            font-weight: 600;
                                            opacity: 0.8;
                                        "
                                    >
                                        ${escapeHtml(
                                            product.pack_size
                                        )}
                                    </div>

                                    <div
                                        class="product-price-detail"
                                        style="
                                            margin-top: 4px;
                                            font-size: 0.82rem;
                                            opacity: 0.7;
                                        "
                                    >
                                        ${money(
                                            product.price
                                        )} for ${escapeHtml(
                                            product.pack_size
                                        )}
                                    </div>

                                `

                                : ""
                        }

                    </div>


                    <div
                        class="qty-control"
                        data-qty-for="${product.id}"
                    >

                        <button
                            type="button"
                            data-qty="dec"
                            aria-label="Reduce quantity"
                        >
                            -
                        </button>

                        <span data-qty-value>
                            1
                        </span>

                        <button
                            type="button"
                            data-qty="inc"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>


                    <button
                        class="btn btn-primary"
                        type="button"
                        data-add-to-cart="${product.id}"
                    >

                        ${
                            available
                                ? "Add to cart"
                                : "Notify me"
                        }

                    </button>

                </div>


                <div class="product-reviews">

                    <h3>
                        Reviews
                    </h3>


                    <p class="detail-rating">

                        Rating:

                        <span>
                            ${ratingText}
                        </span>

                    </p>


                    <div
                        id="reviewsList"
                        class="reviews-list"
                    >

                        <p class="empty-reviews">
                            Loading reviews…
                        </p>

                    </div>


                    <form
                        class="detail-review-form"
                        id="reviewForm"
                    >

                        <input
                            type="text"
                            name="reviewer"
                            placeholder="Your name"
                            required
                        />


                        <select
                            name="reviewType"
                            required
                        >

                            <option value="">
                                Bought or sampled?
                            </option>

                            <option value="Bought from GharSe Snacks">
                                Bought from GharSe Snacks
                            </option>

                            <option value="Tried a sample">
                                Tried a sample
                            </option>

                        </select>


                        <fieldset
                            class="rating-picker star-picker"
                        >

                            <legend>
                                Your rating
                            </legend>

                            ${
                                [1, 2, 3, 4, 5]
                                    .map(
                                        (n) => `

                                            <label
                                                class="star-choice"
                                            >

                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    value="${n}"
                                                    ${
                                                        n === 5
                                                            ? "checked"
                                                            : ""
                                                    }
                                                />

                                                ★

                                            </label>

                                        `
                                    )
                                    .join("")
                            }

                        </fieldset>


                        <textarea
                            name="comment"
                            rows="3"
                            placeholder="Tell others what you thought"
                            required
                        ></textarea>


                        <button
                            class="btn btn-primary"
                            type="submit"
                        >
                            Submit review
                        </button>

                    </form>

                </div>

            </div>

        </div>

    `;


    openModal(
        "productModal"
    );


    loadReviews(
        productId
    );
}

// =====================================================
// LOAD REVIEWS
// =====================================================

async function loadReviews(
    productId
) {

    const list =
        document.getElementById(
            "reviewsList"
        );


    if (!list) return;


    try {

        const data =
            await api(
                "/api/reviews"
            );


        const reviews =
            (data.reviews || [])
                .filter(
                    (r) =>
                        Number(
                            r.product_id
                        ) ===
                        Number(productId)
                );


        if (!reviews.length) {

            list.innerHTML =
                `<p class="empty-reviews">
                    No reviews yet — be the first to share one!
                </p>`;

            return;

        }


        list.innerHTML =
            reviews
                .map(
                    (r) => `

                        <div class="review-card">

                            <div class="review-card-head">

                                <strong>
                                    ${escapeHtml(
                                        r.reviewer
                                    )}
                                </strong>

                                <span class="review-type">
                                    ${escapeHtml(
                                        r.review_type
                                    )}
                                </span>

                            </div>


                            <p>
                                ${"★".repeat(
                                    Number(r.rating)
                                )}
                                ${"☆".repeat(
                                    5 -
                                    Number(r.rating)
                                )}
                            </p>


                            <p>
                                ${escapeHtml(
                                    r.comment
                                )}
                            </p>


                            <small>
                                ${new Date(
                                    r.created_at
                                ).toLocaleDateString(
                                    "en-IN"
                                )}
                            </small>

                        </div>

                    `
                )
                .join("");


    } catch (err) {

        list.innerHTML =
            `<p class="empty-reviews">
                Could not load reviews.
            </p>`;

    }
}

// =====================================================
// REVIEW SUBMISSION
// =====================================================

document.addEventListener(
    "submit",
    async (e) => {

        if (
            e.target.id !==
            "reviewForm"
        ) {
            return;
        }


        e.preventDefault();


        const form =
            e.target;

        const formData =
            new FormData(form);


        try {

            await api(
                "/api/reviews",
                {
                    method: "POST",

                    body: JSON.stringify({

                        productId:
                            ACTIVE_PRODUCT_ID,

                        userId:
                            CURRENT_USER?.id ||
                            null,

                        reviewer:
                            formData.get(
                                "reviewer"
                            ),

                        reviewType:
                            formData.get(
                                "reviewType"
                            ),

                        rating:
                            Number(
                                formData.get(
                                    "rating"
                                )
                            ),

                        comment:
                            formData.get(
                                "comment"
                            )

                    })
                }
            );


            form.reset();


            loadReviews(
                ACTIVE_PRODUCT_ID
            );


            showToast(
                "Thanks for your review!"
            );


        } catch (err) {

            showToast(
                err.message,
                true
            );

        }

    }
);

// =====================================================
// CART
// =====================================================

function persistCart() {

    localStorage.setItem(
        "gharse_cart",
        JSON.stringify(CART)
    );
}

function loadCart() {

    CART =
        JSON.parse(
            localStorage.getItem(
                "gharse_cart"
            ) || "[]"
        );

    renderCart();
}

async function addToCart(
    productId,
    quantity
) {

    const product =
        PRODUCTS.find(
            (p) =>
                Number(p.id) ===
                Number(productId)
        );


    if (!product) return;


    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        return;
    }


    // =============================================
    // COMING SOON / NOTIFY ME
    // =============================================

    if (
        Number(product.stock) <= 0
    ) {

        if (!CURRENT_USER) {

            showToast(
                "Please log in to get notified.",
                true
            );

            return;

        }


        try {

            await api(
                "/api/product-interest",
                {
                    method: "POST",

                    body: JSON.stringify({

                        productId,
                        userId:
                            CURRENT_USER.id,
                        quantity

                    })
                }
            );


            showToast(
                `You'll be notified when ${product.name} is available.`
            );


        } catch (error) {

            showToast(
                error.message,
                true
            );

        }


        return;

    }


    // =============================================
    // ADD TO CART
    // =============================================

    const existing =
        CART.find(
            (item) =>
                Number(item.id) ===
                Number(productId)
        );


    if (existing) {

        existing.quantity +=
            quantity;

        // Keep pack size synchronized
        existing.pack_size =
            product.pack_size || "";

    } else {

        CART.push({

            id: productId,

            name:
                product.name,

            price:
                Number(product.price),

            pack_size:
                product.pack_size || "",

            quantity

        });

    }


    persistCart();

    renderCart();


    showToast(
        `${product.name} added to cart.`
    );


    const qtyValue =
        Array.from(
            document.querySelectorAll(
                `[data-qty-for="${productId}"] [data-qty-value]`
            )
        ).find(
            (item) =>
                item.offsetParent !== null
        );


    if (qtyValue) {

        qtyValue.textContent =
            "0";

    }
}

function removeFromCart(
    productId
) {

    CART =
        CART.filter(
            (item) =>
                Number(item.id) !==
                Number(productId)
        );

    persistCart();

    renderCart();
}

// =====================================================
// RENDER CART
// =====================================================

function renderCart() {

    const countEl =
        document.getElementById(
            "cartCount"
        );

    const itemsEl =
        document.getElementById(
            "cartItems"
        );


    const totalItems =
        CART.reduce(
            (sum, item) =>
                sum +
                Number(item.quantity),
            0
        );


    if (countEl) {

        countEl.textContent =
            totalItems;

    }


    document
        .getElementById("cartTrigger")
        ?.setAttribute(
            "aria-label",
            `Shopping cart, ${totalItems} ${
                totalItems === 1
                    ? "item"
                    : "items"
            }`
        );


    if (itemsEl) {

        if (!CART.length) {

            itemsEl.innerHTML =
                `<p class="empty-reviews">
                    Your cart is empty. Add some snacks to get started!
                </p>`;

        } else {

            itemsEl.innerHTML =
                CART.map(
                    (item) => `

                        <div class="cart-item">

                            <div>

                                <h4>
                                    ${escapeHtml(
                                        item.name
                                    )}
                                </h4>

                                <p>
                                    ${money(
                                        item.price
                                    )}
                                    ×
                                    ${item.quantity}

                                    ${
                                        item.pack_size
                                            ? ` · ${escapeHtml(
                                                item.pack_size
                                            )} each`
                                            : ""
                                    }
                                </p>

                            </div>


                            <div class="qty-control">

                                <strong>
                                    ${money(
                                        item.price *
                                        item.quantity
                                    )}
                                </strong>

                                <button
                                    type="button"
                                    data-remove-from-cart="${item.id}"
                                    aria-label="Remove item"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                    `
                ).join("");

        }

    }


    // =============================================
    // GST REMOVED
    // =============================================

    const subtotal =
        CART.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                Number(item.quantity),
            0
        );


    const total =
        subtotal;


    const subtotalEl =
        document.getElementById(
            "subtotalValue"
        );

    const totalEl =
        document.getElementById(
            "totalValue"
        );


    if (subtotalEl) {

        subtotalEl.textContent =
            money(subtotal);

    }


    if (totalEl) {

        totalEl.textContent =
            money(total);

    }

}

// =====================================================
// REMOVE CART ITEM
// =====================================================

document.addEventListener(
    "click",
    (e) => {

        const removeBtn =
            e.target.closest(
                "[data-remove-from-cart]"
            );


        if (removeBtn) {

            removeFromCart(
                Number(
                    removeBtn.dataset
                        .removeFromCart
                )
            );

        }

    }
);

// =====================================================
// CHECKOUT — RAZORPAY
// =====================================================

document.addEventListener(
    "submit",
    async (e) => {

        if (
            e.target.id !==
            "checkoutForm"
        ) {
            return;
        }


        e.preventDefault();


        if (!CART.length) {

            showToast(
                "Your cart is empty.",
                true
            );

            return;

        }


        const form =
            e.target;


        const submitBtn =
            form.querySelector(
                "button[type=submit]"
            );


        if (submitBtn) {

            submitBtn.disabled =
                true;

        }


        try {

            const formData =
                new FormData(form);


            const data =
                await api(
                    "/api/create-order",
                    {
                        method: "POST",

                        body: JSON.stringify({

                            customer: {

                                userId:
                                    CURRENT_USER
                                        ? CURRENT_USER.id
                                        : null,

                                name:
                                    formData.get(
                                        "name"
                                    ),

                                email:
                                    formData.get(
                                        "email"
                                    ),

                                phone:
                                    formData.get(
                                        "phone"
                                    ),

                                address:
                                    formData.get(
                                        "address"
                                    ),

                                place:
                                    formData.get(
                                        "place"
                                    ),

                                state:
                                    formData.get(
                                        "state"
                                    )

                            },

                            items:
                                CART.map(
                                    (item) => ({

                                        id:
                                            item.id,

                                        quantity:
                                            item.quantity

                                    })
                                )

                        })

                    }
                );


            const options = {

                key:
                    data.key,

                amount:
                    data.amount,

                currency:
                    data.currency,

                name:
                    "GharSe Snacks",

                description:
                    "Order payment",

                order_id:
                    data.razorpayOrderId,


                handler:
                    async function (
                        response
                    ) {

                        try {

                            await api(
                                "/api/verify-payment",
                                {
                                    method: "POST",

                                    body:
                                        JSON.stringify(
                                            response
                                        )
                                }
                            );


                            CART = [];

                            persistCart();

                            renderCart();

                            closeModal(
                                "cartModal"
                            );


                            showSuccess(
                                "Payment successful!",
                                `Order ${data.orderNumber} is confirmed. We'll notify you with updates.`
                            );


                            form.reset();


                        } catch (err) {

                            showToast(
                                err.message,
                                true
                            );

                        }

                    },


                theme: {
                    color: "#a4100d"
                }

            };


            const rzp =
                new Razorpay(
                    options
                );


            rzp.open();


        } catch (err) {

            showToast(
                err.message,
                true
            );

        } finally {

            if (submitBtn) {

                submitBtn.disabled =
                    false;

            }

        }

    }
);

// =====================================================
// AUTH
// =====================================================

function setAuthMode(mode) {

    AUTH_MODE =
        mode;


    const modalCard =
        document.querySelector(
            "#authModal .modal-card"
        );


    const title =
        document.getElementById(
            "authTitle"
        );


    const switchText =
        document.getElementById(
            "authSwitchText"
        );


    const toggleBtn =
        document.getElementById(
            "toggleAuthMode"
        );


    const nameInput =
        document.querySelector(
            '#authForm [name="name"]'
        );


    if (modalCard) {

        modalCard.classList.toggle(
            "signup-mode",
            mode === "signup"
        );

    }


    document
        .querySelectorAll(
            "#authForm .signup-only"
        )
        .forEach((el) => {

            el.required =
                mode === "signup" &&
                [
                    "name",
                    "contact",
                    "place",
                    "address"
                ].includes(
                    el.name
                );

        });


    if (nameInput) {

        nameInput.required =
            mode === "signup";

    }


    if (mode === "signup") {

        if (title)
            title.textContent =
                "Create account";

        if (switchText)
            switchText.textContent =
                "Already have an account? ";

        if (toggleBtn)
            toggleBtn.textContent =
                "Login instead";

    } else {

        if (title)
            title.textContent =
                "Login";

        if (switchText)
            switchText.textContent =
                "New user? ";

        if (toggleBtn)
            toggleBtn.textContent =
                "Create account";

    }
}

// =====================================================
// AUTH BUTTON
// =====================================================

document
    .getElementById(
        "authTrigger"
    )
    ?.addEventListener(
        "click",
        () => {

            if (CURRENT_USER) {

                return openProfile();

            }


            setAuthMode(
                "login"
            );

            openModal(
                "authModal"
            );

        }
    );

// =====================================================
// STAR RATING
// =====================================================

document.addEventListener(
    "change",
    (e) => {

        if (
            !e.target.matches(
                'input[name="rating"]'
            )
        ) {
            return;
        }


        const selected =
            Number(
                e.target.value
            );


        const picker =
            e.target.closest(
                ".star-picker"
            );


        if (!picker) return;


        picker
            .querySelectorAll(
                ".star-choice"
            )
            .forEach(
                (star) => {

                    star.classList.toggle(
                        "selected",
                        Number(
                            star.querySelector(
                                "input"
                            ).value
                        ) <= selected
                    );

                }
            );

    }
);

// =====================================================
// LOGOUT
// =====================================================

document
    .getElementById(
        "logoutButton"
    )
    ?.addEventListener(
        "click",
        () => {

            CURRENT_USER =
                null;

            localStorage.removeItem(
                "gharse_user"
            );

            closeModal(
                "profileModal"
            );

            showToast(
                "You have been logged out."
            );

        }
    );

// =====================================================
// TOGGLE AUTH MODE
// =====================================================

document
    .getElementById(
        "toggleAuthMode"
    )
    ?.addEventListener(
        "click",
        () => {

            setAuthMode(
                AUTH_MODE === "login"
                    ? "signup"
                    : "login"
            );

        }
    );

// =====================================================
// LOGIN / SIGNUP
// =====================================================

document
    .getElementById(
        "authForm"
    )
    ?.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const form =
                e.target;


            const formData =
                new FormData(form);


            const submitBtn =
                form.querySelector(
                    "button[type=submit]"
                );


            if (submitBtn)
                submitBtn.disabled =
                    true;


            try {

                const endpoint =
                    AUTH_MODE === "signup"

                        ? "/api/auth/signup"

                        : "/api/auth/login";


                const payload =
                    AUTH_MODE === "signup"

                        ? {

                            name:
                                formData.get(
                                    "name"
                                ),

                            email:
                                formData.get(
                                    "email"
                                ),

                            password:
                                formData.get(
                                    "password"
                                ),

                            contact:
                                formData.get(
                                    "contact"
                                ),

                            place:
                                formData.get(
                                    "place"
                                ),

                            address:
                                formData.get(
                                    "address"
                                ),

                            preferredSnacks:
                                formData.get(
                                    "preferredSnacks"
                                )

                        }

                        : {

                            identifier:
                                formData.get(
                                    "email"
                                ),

                            password:
                                formData.get(
                                    "password"
                                )

                        };


                const data =
                    await api(
                        endpoint,
                        {
                            method: "POST",
                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                if (
                    AUTH_MODE ===
                    "signup"
                ) {

                    showToast(
                        "Account created! Please log in."
                    );

                    setAuthMode(
                        "login"
                    );

                    form.reset();


                } else {

                    CURRENT_USER =
                        data.user;


                    localStorage.setItem(
                        "gharse_user",
                        JSON.stringify(
                            CURRENT_USER
                        )
                    );


                    closeModal(
                        "authModal"
                    );


                    showToast(
                        `Welcome back, ${data.user.name}!`
                    );


                    form.reset();

                }


            } catch (err) {

                showToast(
                    err.message,
                    true
                );

            } finally {

                if (submitBtn)
                    submitBtn.disabled =
                        false;

            }

        }
    );

// =====================================================
// PARTNER FORM
// =====================================================

document
    .getElementById(
        "partnerForm"
    )
    ?.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const form =
                e.target;


            const formData =
                new FormData(form);


            const submitBtn =
                form.querySelector(
                    "button[type=submit]"
                );


            if (submitBtn)
                submitBtn.disabled =
                    true;


            try {

                const data =
                    await api(
                        "/api/partner-interest",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({

                                    name:
                                        formData.get(
                                            "name"
                                        ),

                                    contact:
                                        formData.get(
                                            "contact"
                                        ),

                                    email:
                                        formData.get(
                                            "email"
                                        ),

                                    state:
                                        formData.get(
                                            "state"
                                        ),

                                    details:
                                        formData.get(
                                            "details"
                                        )

                                })

                        }
                    );


                form.reset();


                showSuccess(
                    "Thank you!",
                    `We've received your partner application (${data.partnerId}). Our team will reach out soon.`
                );


            } catch (err) {

                showToast(
                    err.message,
                    true
                );

            } finally {

                if (submitBtn)
                    submitBtn.disabled =
                        false;

            }

        }
    );

// =====================================================
// SUBSCRIBE FORM
// =====================================================

document
    .getElementById(
        "subscribeForm"
    )
    ?.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const form =
                e.target;


            const formData =
                new FormData(form);


            const submitBtn =
                form.querySelector(
                    "button[type=submit]"
                );


            if (submitBtn)
                submitBtn.disabled =
                    true;


            try {

                const data =
                    await api(
                        "/api/subscriptions",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({

                                    email:
                                        formData.get(
                                            "email"
                                        ),

                                    userId:
                                        CURRENT_USER?.id ||
                                        null

                                })

                        }
                    );


                form.reset();


                showToast(
                    data.alreadySubscribed
                        ? "You're already on the list!"
                        : "Subscribed! Watch your inbox for updates."
                );


            } catch (err) {

                showToast(
                    err.message,
                    true
                );

            } finally {

                if (submitBtn)
                    submitBtn.disabled =
                        false;

            }

        }
    );

// =====================================================
// MODAL WIRING
// =====================================================

document
    .getElementById(
        "cartTrigger"
    )
    ?.addEventListener(
        "click",
        () =>
            openModal(
                "cartModal"
            )
    );

document
    .getElementById(
        "forgotPasswordTrigger"
    )
    ?.addEventListener(
        "click",
        () => {

            closeModal(
                "authModal"
            );

            openModal(
                "resetPasswordModal"
            );

        }
    );

// =====================================================
// PASSWORD RESET REQUEST
// =====================================================

document
    .getElementById(
        "resetRequestForm"
    )
    ?.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const form =
                e.target;


            const email =
                new FormData(form)
                    .get("email");


            try {

                await api(
                    "/api/auth/password-reset/request",
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                email
                            })

                    }
                );


                const emailInput =
                    document.querySelector(
                        '#resetConfirmForm [name="email"]'
                    );


                if (emailInput) {

                    emailInput.value =
                        email;

                }


                const confirmForm =
                    document.getElementById(
                        "resetConfirmForm"
                    );


                if (confirmForm) {

                    confirmForm.classList.remove(
                        "is-hidden"
                    );

                }


                showToast(
                    "Reset code sent if that email has an account."
                );


            } catch (error) {

                showToast(
                    error.message,
                    true
                );

            }

        }
    );

// =====================================================
// PASSWORD RESET CONFIRM
// =====================================================

document
    .getElementById(
        "resetConfirmForm"
    )
    ?.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const form =
                e.target;


            const data =
                new FormData(form);


            try {

                await api(
                    "/api/auth/password-reset/confirm",
                    {
                        method: "POST",

                        body:
                            JSON.stringify(
                                Object.fromEntries(
                                    data
                                )
                            )

                    }
                );


                form.reset();


                closeModal(
                    "resetPasswordModal"
                );


                openModal(
                    "authModal"
                );


                showToast(
                    "Password updated. Please log in."
                );


            } catch (error) {

                showToast(
                    error.message,
                    true
                );

            }

        }
    );

// =====================================================
// SUGGESTIONS
// =====================================================

document
    .getElementById(
        "suggestionTrigger"
    )
    ?.addEventListener(
        "click",
        () =>
            openModal(
                "suggestionModal"
            )
    );

document
    .getElementById(
        "suggestionForm"
    )
    ?.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const form =
                e.target;


            const data =
                new FormData(form);


            try {

                await api(
                    "/api/suggestions",
                    {
                        method: "POST",

                        body:
                            JSON.stringify({

                                userId:
                                    CURRENT_USER?.id ||
                                    null,

                                name:
                                    data.get(
                                        "name"
                                    ),

                                email:
                                    data.get(
                                        "email"
                                    ),

                                suggestion:
                                    data.get(
                                        "suggestion"
                                    )

                            })

                    }
                );


                form.reset();


                closeModal(
                    "suggestionModal"
                );


                showSuccess(
                    "Thank you!",
                    "Your suggestion has been saved."
                );


            } catch (error) {

                showToast(
                    error.message,
                    true
                );

            }

        }
    );

// =====================================================
// CLOSE MODALS
// =====================================================

document.addEventListener(
    "click",
    (e) => {

        const closeBtn =
            e.target.closest(
                "[data-close]"
            );


        if (closeBtn) {

            closeModal(
                closeBtn.dataset.close
            );

        }


        if (
            e.target.classList.contains(
                "modal"
            ) ||
            e.target.classList.contains(
                "success-modal"
            )
        ) {

            e.target.classList.remove(
                "open"
            );

            e.target.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }
);

// =====================================================
// ESCAPE KEY
// =====================================================

document.addEventListener(
    "keydown",
    (e) => {

        if (e.key === "Escape") {

            document
                .querySelectorAll(
                    ".modal.open, .success-modal.open"
                )
                .forEach(
                    (m) => {

                        m.classList.remove(
                            "open"
                        );

                        m.setAttribute(
                            "aria-hidden",
                            "true"
                        );

                    }
                );

        }

    }
);

// =====================================================
// INIT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initReveal();

        initCarousel();

        loadProducts();

        loadCart();

        setAuthMode(
            "login"
        );

    }
);

// =====================================================
// CITY CLICK → SCROLL TO FIRST PRODUCT
// =====================================================

document.addEventListener(
    "click",
    (e) => {

        const cityChip =
            e.target.closest(
                ".city-chip"
            );


        if (!cityChip) return;


        const city =
            cityChip.dataset.city;


        if (!city) return;


        const firstProduct =
            PRODUCTS.find(
                (product) =>
                    String(
                        product.city || ""
                    ).toLowerCase() ===
                    city.toLowerCase()
            );


        if (!firstProduct) return;


        const productCard =
            document.querySelector(
                `.product-card[data-id="${firstProduct.id}"]`
            );


        if (!productCard) return;


        productCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
);