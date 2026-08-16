// =====================================================
// CONFIG
// =====================================================

const API_BASE =
    window.location.protocol === "file:" ||
    (window.location.hostname === "localhost" && window.location.port !== "3001") ||
    (window.location.hostname === "127.0.0.1" && window.location.port !== "3001") ?
    "http://127.0.0.1:3001" :
    "";


// =====================================================
// STATE
// =====================================================

let PRODUCTS = [];
let ORDERABLE_PRODUCTS = [];
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

    "spicy parmal / murmure": "Images/Spicy Parmal (Murmure).jpeg",

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
        name: "Spicy Parmal (Murmure)",
        city: "Indore",
        price: 69,
        pack_size: "100g / packet",
        image_url: "Images/Spicy Parmal (Murmure).jpeg",
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

    if (product.is_coming_soon || product.isComingSoon) {
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

    if (!("IntersectionObserver" in window)) {
        items.forEach((item) => item.classList.add("is-visible"));
        return;
    }

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
                ".carousel-slide:not(.is-hidden)"
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
        const rawProducts = data.products.map(dbProduct => ({
            product_id: String(dbProduct.product_id),
            category_id: String(dbProduct.category_id),
            name: dbProduct.name,
            description: dbProduct.description,
            price: Number(dbProduct.price),
            stock: Number(dbProduct.stock),
            image_url: dbProduct.image_url || "Images/Coming Soon.jpeg",
            is_coming_soon: Boolean(dbProduct.is_coming_soon),
            city: dbProduct.city,
            category: dbProduct.category_name,
            pack_size: dbProduct.pack_size || ""
        }));
        ORDERABLE_PRODUCTS = rawProducts;
        PRODUCTS = buildDisplayProducts(rawProducts);
    } catch (err) {
        console.error("Product API failed:", err);
        // Keep the storefront browseable if the API or local database is
        // temporarily unavailable.  These preview cards cannot be checked
        // out until the server is back, so do not put them in the orderable
        // product list.
        ORDERABLE_PRODUCTS = [];
        PRODUCTS = PRODUCT_CATALOG.map((product, index) => ({
            ...product,
            product_id: `preview-${index + 1}`,
            category_id: "",
            is_preview: true
        }));
        showToast("Showing catalogue preview while the product service reconnects.");
    }
    renderProducts();
}

function buildDisplayProducts(rawProducts) {
    // Every pack/variant is a real product: keep the catalogue in category
    // ID then product ID order, rather than moving variants into end-of-list
    // collection cards.
    const sequence = product => Number((String(product.product_id).match(/_(\d+)$/) || [0, 0])[1]);
    return [...rawProducts].sort((a, b) =>
        String(a.category_id).localeCompare(String(b.category_id), undefined, { numeric: true }) ||
        sequence(a) - sequence(b) ||
        String(a.product_id).localeCompare(String(b.product_id), undefined, { numeric: true })
    );
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
            ORDERABLE_PRODUCTS.map(
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
            ORDERABLE_PRODUCTS.map(
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
                        p.variants?.[0]?.product_id || productId
                    );


                const ratingText =
                    rating ?
                    `${rating.average.toFixed(1)} / 5 (${rating.count})` :
                    "No ratings yet";


                return `

                    <article class="product-card reveal is-visible" id="city-${escapeHtml(p.city.toLowerCase())}" data-id="${escapeHtml(productId)}">

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
                                        : p.is_coming_soon ? "Coming soon" : "Out of stock"
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
                                            ? `${Number(p.stock)} packs available`
                                            : p.is_coming_soon ? "Will be available soon" : "Currently out of stock"
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


                            ${p.is_preview ? "" : `<button
                                class="btn btn-primary"
                                type="button"
                                data-add-to-cart="${escapeHtml(productId)}"
                            >

                                ${
                                    Number(p.stock) > 0
                                        ? "Add to cart"
                                        : "Notify me"
                                }

                            </button>`}

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

        const variantBtn =
            e.target.closest("[data-add-variant]");

        if (variantBtn) {
            addToCart(String(variantBtn.dataset.addVariant), 1);
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
        ) || ORDERABLE_PRODUCTS.find(p => String(p.product_id || "") === id);


    if (!product) {

        console.error(
            "Product not found:",
            id
        );

        return;

    }

    if (product.is_collection) {
        openCollectionDetail(product);
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
                            ? `${Number(product.stock)} packs available`
                            : product.is_coming_soon ? "Coming soon" : "Out of stock"
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

                <p class="detail-stock" aria-live="polite">
                    ${
                        available
                            ? `Stock vault: ${Number(product.stock)} pack${Number(product.stock) === 1 ? "" : "s"} ready to ship`
                            : product.is_coming_soon
                                ? "This product is launching soon and cannot be ordered yet."
                                : "This product is currently sold out. Use Notify me to receive an availability alert."
                    }
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


                    ${product.is_preview ? `
                        <p class="form-note">Live availability and checkout will return when the product service reconnects.</p>
                    ` : `
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
                    `}

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

function openCollectionDetail(product) {
    const detail = document.getElementById("productDetail");
    if (!detail) return;
    const available = product.variants.filter(v => Number(v.stock) > 0).length;
    detail.innerHTML = `
        <div class="product-detail-layout">
            <div class="product-image-panel"><img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.name)}" /><span class="detail-availability coming-soon">${product.variants.length} flavour choices</span></div>
            <div class="product-detail-copy">
                <h2>${escapeHtml(product.name)}</h2>
                <div class="detail-meta"><span>${escapeHtml(product.category)}</span><span>${escapeHtml(product.city)} specialities</span></div>
                <p class="detail-description">${escapeHtml(product.description)}</p>
                <div class="detail-story"><span>Pick a flavour</span><span>Check pack size</span><span>${available ? "Availability updates live" : "Launching soon"}</span></div>
                <div class="variant-grid">${product.variants.map(v => `<article class="variant-card"><div><h4>${escapeHtml(v.name)}</h4><p>${escapeHtml(v.pack_size || "Pack details coming soon")} · ${Number(v.stock) > 0 ? `${Number(v.stock)} packs available` : "Coming soon"}</p></div><strong>${Number(v.price) > 0 ? money(v.price) : "Coming soon"}</strong>${Number(v.stock) > 0 ? `<button class="btn btn-primary" type="button" data-add-variant="${escapeHtml(v.product_id)}">Add this variety</button>` : `<button class="btn btn-secondary" type="button" data-view="${escapeHtml(v.product_id)}">See flavour details</button>`}</article>`).join("")}</div>
                <div class="product-reviews"><h3>Flavour stories & ratings</h3><p class="detail-rating">Reviews are collected separately for each flavour, so every rating stays useful.</p><button class="btn btn-secondary" type="button" data-view="${escapeHtml(product.variants[0].product_id)}">Read and write reviews</button></div>
            </div>
        </div>`;
    openModal("productModal");
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
        ORDERABLE_PRODUCTS.find(
            (p) =>
                String(
                    p.product_id || ""
                ) === id
        );


    if (!product) {

        showToast(
            "Live checkout is temporarily unavailable while the product service reconnects.",
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
                "/api/product-interest",
                {
                    method: "POST",

                    body:
                        JSON.stringify({

                            productId:
                                id,

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


    // =================================================
    // ADD TO CART
    // =================================================

    const existing =
        CART.find(
            (item) =>
                String(
                    item.product_id || ""
                ) === id
        );


    if (existing) {

        existing.quantity +=
            quantity;

        existing.pack_size =
            product.pack_size || "";

        existing.category_id =
            product.category_id || "";

    } else {

        CART.push({

            product_id:
                id,

            category_id:
                String(
                    product.category_id ||
                    ""
                ),

            name:
                product.name,

            price:
                Number(
                    product.price
                ),

            pack_size:
                product.pack_size ||
                "",

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
                `[data-qty-for="${CSS.escape(id)}"] [data-qty-value]`
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

    const id =
        String(productId);


    CART =
        CART.filter(
            (item) =>
                String(
                    item.product_id || ""
                ) !== id
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
                Number(
                    item.quantity
                ),
            0
        );


    if (countEl) {

        countEl.textContent =
            totalItems;

    }


    document
        .getElementById(
            "cartTrigger"
        )
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
                `
                <p class="empty-reviews">
                    Your cart is empty. Add some snacks to get started!
                </p>
                `;

        } else {

            itemsEl.innerHTML =
                CART
                    .map(
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
                                            Number(
                                                item.price
                                            ) *
                                            Number(
                                                item.quantity
                                            )
                                        )}

                                    </strong>


                                    <button
                                        type="button"
                                        data-remove-from-cart="${escapeHtml(
                                            String(
                                                item.product_id
                                            )
                                        )}"
                                        aria-label="Remove item"
                                    >
                                        ×
                                    </button>

                                </div>

                            </div>

                        `
                    )
                    .join("");

        }

    }


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
                removeBtn.dataset
                    .removeFromCart
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

        let paymentWindowOpen = false;


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

                        body:
                            JSON.stringify({

                                customer: {

                                    // Guests must stay null; only real database user IDs are sent.
                                    userId: CURRENT_USER ? CURRENT_USER.id : null,

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
                                                item.product_id,

                                            product_id:
                                                item.product_id,

                                            category_id:
                                                item.category_id,

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

                        } finally {

                            paymentWindowOpen = false;

                            if (submitBtn) submitBtn.disabled = false;

                        }

                    },


                theme: {

                    color:
                        "#a4100d"

                },

                modal: {
                    ondismiss: () => {
                        paymentWindowOpen = false;
                        if (submitBtn) submitBtn.disabled = false;
                    }
                }

            };


            if (typeof Razorpay !== "function") {
                throw new Error("The payment window could not load. Please check your internet connection and try again.");
            }

            const rzp = new Razorpay(options);

            rzp.on("payment.failed", (response) => {
                showToast(response.error?.description || "Payment was not completed. Your cart is still saved.", true);
                paymentWindowOpen = false;
                if (submitBtn) submitBtn.disabled = false;
            });


            paymentWindowOpen = true;
            rzp.open();


        } catch (err) {

            showToast(
                err.message,
                true
            );

        } finally {

            if (submitBtn && !paymentWindowOpen) {

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

                    showSuccess(
                        "Welcome to GharSe Snacks!",
                        `Your customer ID is ${data.user.customerId}. A welcome email is on its way; you can now log in.`
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


                showSuccess(
                    data.alreadySubscribed ? "You're already subscribed" : "You're on the GharSe list!",
                    data.alreadySubscribed ? "This email is already signed up for snack drops and offers." : "Please check your inbox for your welcome email and upcoming snack drops."
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


// =====================================================
// BULK / WHOLESALE ORDER ENQUIRY
// =====================================================

document
    .getElementById(
        "bulkOrderTrigger"
    )
    ?.addEventListener(
        "click",
        () => openModal("bulkOrderModal")
    );


document
    .getElementById(
        "bulkOrderForm"
    )
    ?.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');

            if (submitBtn) submitBtn.disabled = true;

            try {

                const data = new FormData(form);

                const response = await api(
                    "/api/bulk-order-enquiries",
                    {
                        method: "POST",
                        body: JSON.stringify(Object.fromEntries(data))
                    }
                );

                form.reset();
                closeModal("bulkOrderModal");
                showSuccess(
                    "Bulk enquiry received!",
                    `Your reference is ${response.enquiryId}. Your customer ID is ${response.customerId}. ${response.accountCreated ? "We sent a password-setup code to your email." : "Our team will contact you within seven days with availability and pricing."}`
                );

            } catch (error) {

                showToast(error.message, true);

            } finally {

                if (submitBtn) submitBtn.disabled = false;

            }

        }
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

        loadProductRatings();

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


        const citySection = document.getElementById(`city-${city.toLowerCase()}`);
if (!citySection) return;
citySection.scrollIntoView({ behavior: "smooth", block: "start" });

    }
);
