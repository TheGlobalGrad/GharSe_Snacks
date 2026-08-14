// =====================================================
// CONFIG
// =====================================================

const API_BASE = window.location.hostname.includes('onrender.com') ? "https://dep-d9v4jm5bedkc73c6b41g.onrender.com" : "http://127.0.0.1:3001";


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
// LOCAL PRODUCT CATALOG
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
    // AHMEDABAD
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

];


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
            () =>
            toast.classList.remove("show"),
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


function escapeHtml(str) {

    const div =
        document.createElement("div");

    div.textContent =
        str == null ?
        "" :
        String(str);

    return div.innerHTML;

}


function productImage(product) {
    const name = String(product.name || "")
        .trim()
        .toLowerCase();

    if (
        Number(product.stock) <= 0 ||
        product.price == null
    ) {
        return "Images/Coming Soon.jpeg";
    }

    const imagePath =
        PRODUCT_IMAGE_FILES[name] ||
        product.image_url ||
        "Images/Coming Soon.jpeg";

    // Make image paths work correctly from the frontend root
    return imagePath.replace(/^\/?Images\//i, "Images/");
}


function openProfile() {

    if (!CURRENT_USER) return;

    const nameEl =
        document.getElementById(
            "profileName"
        );

    if (nameEl) {

        nameEl.textContent =
            CURRENT_USER.name ||
            "GharSe member";

    }

    const email =
        document.getElementById(
            "profileEmail"
        );

    if (email) {

        email.textContent =
            CURRENT_USER.email || "";

        email.href =
            `mailto:${CURRENT_USER.email || ""}`;

    }

    const customerId =
        document.getElementById(
            "profileCustomerId"
        );

    if (customerId) {

        customerId.textContent =
            CURRENT_USER.customerId ?
            `Member ID: ${CURRENT_USER.customerId}` :
            "";

    }

    openModal("profileModal");

}


async function api(path, options = {}) {

    const res =
        await fetch(
            `${API_BASE}${path}`, {
                headers: {
                    "Content-Type": "application/json"
                },
                ...options
            }
        );

    let data;

    try {

        data =
            await res.json();

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
    const grid = document.getElementById("productGrid");
    if (!grid) return;
    try {
        const data = await api("/api/products");
        PRODUCTS = data.products.map(dbProduct => ({
            product_id: String(dbProduct.product_id),
            category_id: String(dbProduct.category_id),
            name: dbProduct.name,
            description: dbProduct.description,
            price: Number(dbProduct.price),
            image_url: dbProduct.image_url || "Images/Coming Soon.jpeg",
            city: dbProduct.city,
            pack_size: "100g / packet",
            stock: dbProduct.price == null ? 0 : 100
        }));
    } catch (err) {
        console.error("Product API failed:", err);
        PRODUCTS = [];
    }
    renderProducts();
}


// =====================================================
// PRODUCT RATINGS
// =====================================================

async function loadProductRatings() {

    try {

        const data =
            await api(
                "/api/reviews"
            );

        const grouped =
            new Map();


        (data.reviews || [])
        .forEach((review) => {

            const productId =
                String(
                    review.product_id || ""
                );


            if (!productId) return;


            const ratings =
                grouped.get(
                    productId
                ) || [];


            ratings.push(
                Number(
                    review.rating
                )
            );


            grouped.set(
                productId,
                ratings
            );

        });


        PRODUCT_RATINGS =
            new Map(
                [...grouped].map(
                    ([id, ratings]) => [

                        id,

                        {
                            average: ratings.reduce(
                                    (
                                        sum,
                                        rating
                                    ) =>
                                    sum +
                                    rating,
                                    0
                                ) /
                                ratings.length,

                            count: ratings.length
                        }

                    ]
                )
            );


        renderProducts();

    } catch (error) {

        console.warn(
            "Product ratings are unavailable.",
            error
        );

    }

}


// =====================================================
// RECONCILE CART
// =====================================================

function reconcileCartWithProducts() {

    const productsById =
        new Map(
            PRODUCTS.map(
                (product) => [

                    String(
                        product.product_id || ""
                    ),

                    product

                ]
            )
        );


    const productsByName =
        new Map(
            PRODUCTS.map(
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


    const previousCart =
        JSON.stringify(CART);


    CART =
        CART
        .map((item) => {

            const product =
                productsById.get(
                    String(
                        item.product_id || ""
                    )
                ) ||
                productsByName.get(
                    String(
                        item.name || ""
                    )
                    .trim()
                    .toLowerCase()
                );


            if (!product ||
                !product.product_id
            ) {

                return null;

            }


            return {

                ...item,

                product_id: String(
                    product.product_id
                ),

                category_id: String(
                    product.category_id ||
                    ""
                ),

                name: product.name,

                price: Number(
                    product.price
                ),

                pack_size: product.pack_size ||
                    ""

            };

        })
        .filter(
            (item) =>
            item &&
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
            `
            <p class="empty-reviews">
                No snacks available yet. Check back soon!
            </p>
            `;

        return;

    }


    grid.innerHTML =
        PRODUCTS
        .map((p) => {

            const productId =
                String(
                    p.product_id || ""
                );


            const rating =
                PRODUCT_RATINGS.get(
                    productId
                );


            const ratingText =
                rating ?
                `${rating.average.toFixed(1)} / 5 (${rating.count})` :
                "No ratings yet";


            return `

                    <article class="product-card reveal" id="city-${escapeHtml(p.city.toLowerCase())}" data-id="${escapeHtml(productId)}">

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
                            data-view="${escapeHtml(productId)}"
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
                                    Number(p.stock) > 0
                                        ? ""
                                        : "coming-soon"
                                }"
                            >

                                ${
                                    Number(p.stock) > 0
                                        ? "In stock"
                                        : "Will be available soon"
                                }

                            </span>


                            <button
                                class="product-view-btn text-link"
                                data-view="${escapeHtml(productId)}"
                                type="button"
                            >
                                View details
                            </button>

                        </div>


                        <div class="product-actions">

                            <div
                                class="qty-control"
                                data-qty-for="${escapeHtml(productId)}"
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
                                data-add-to-cart="${escapeHtml(productId)}"
                            >

                                ${
                                    Number(p.stock) > 0
                                        ? "Add to cart"
                                        : "Notify me"
                                }

                            </button>

                        </div>

                    </article>

                `;

        })
        .join("");


    requestAnimationFrame(
        initReveal
    );

}


// =====================================================
// QUANTITY
// =====================================================

function getQtyFor(productId) {

    const id =
        String(productId);


    const elements =
        Array.from(
            document.querySelectorAll(
                `[data-qty-for="${CSS.escape(id)}"] [data-qty-value]`
            )
        );


    const el =
        elements.find(
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

            if (!wrap) return;


            const valueEl =
                wrap.querySelector(
                    "[data-qty-value]"
                );


            if (!valueEl) return;


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

            const productId =
                String(
                    addBtn.dataset.addToCart
                );


            const quantity =
                getQtyFor(
                    productId
                );


            if (quantity < 1) {

                showToast(
                    "Please select a quantity first.",
                    true
                );

                return;

            }


            addToCart(
                productId,
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
                String(
                    viewBtn.dataset.view
                )
            );

        }

    }
);


// =====================================================
// PRODUCT DETAIL
// =====================================================

async function openProductDetail(
    productId
) {

    const id =
        String(productId);


    const product =
        PRODUCTS.find(
            (p) =>
            String(
                p.product_id || ""
            ) === id
        );


    if (!product) {

        console.error(
            "Product not found:",
            id
        );

        return;

    }


    ACTIVE_PRODUCT_ID =
        id;


    const rating =
        PRODUCT_RATINGS.get(
            id
        );


    const ratingText =
        rating ?
        `${rating.average.toFixed(1)} / 5 (${rating.count} review${
                rating.count === 1
                    ? ""
                    : "s"
            })` :
        "No ratings yet";


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
                            product.category_id ||
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
                            product.product_id ||
                            "Unavailable"
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
                                        )}
                                        for
                                        ${escapeHtml(
                                            product.pack_size
                                        )}

                                    </div>

                                `

                                : ""
                        }

                    </div>


                    <div
                        class="qty-control"
                        data-qty-for="${escapeHtml(
                            product.product_id
                        )}"
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
                        data-add-to-cart="${escapeHtml(
                            product.product_id
                        )}"
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
        id
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


    const id =
        String(productId);


    try {

        const data =
            await api(
                "/api/reviews"
            );


        const reviews =
            (data.reviews || [])
                .filter(
                    (r) =>
                        String(
                            r.product_id || ""
                        ) === id
                );


        if (!reviews.length) {

            list.innerHTML =
                `
                <p class="empty-reviews">
                    No reviews yet — be the first to share one!
                </p>
                `;

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
                                    Number(
                                        r.rating
                                    )
                                )}

                                ${"☆".repeat(
                                    Math.max(
                                        0,
                                        5 -
                                        Number(
                                            r.rating
                                        )
                                    )
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

        console.error(
            "Could not load reviews:",
            err
        );


        list.innerHTML =
            `
            <p class="empty-reviews">
                Could not load reviews.
            </p>
            `;

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

                    body:
                        JSON.stringify({

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

    try {

        CART =
            JSON.parse(
                localStorage.getItem(
                    "gharse_cart"
                ) || "[]"
            );

        if (!Array.isArray(CART)) {

            CART = [];

        }

    } catch (error) {

        CART = [];

    }


    renderCart();

}


async function addToCart(
    productId,
    quantity
) {

    const id =
        String(productId);


    const product =
        PRODUCTS.find(
            (p) =>
                String(
                    p.product_id || ""
                ) === id
        );


    if (!product) {

        showToast(
            "Product could not be found.",
            true
        );

        return;

    }


    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {

        return;

    }


    // =================================================
    // COMING SOON / NOTIFY ME
    // =================================================

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
                "/api/