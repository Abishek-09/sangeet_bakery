/* ==========================================================================
   Sangeet Bakery And Sweets — script.js
   Vanilla ES6+ · no libraries · every interaction in a named init function
   ========================================================================== */
'use strict';

/* ----------------------------- Utilities ------------------------------- */

/** True when the user prefers reduced motion (used to disable autoplay etc.) */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Sangeet Bakery WhatsApp ordering number (VK Puram / Ambasamudram) */
const BAKERY_WHATSAPP_NUMBER = '918825543938';

/** Tiny selector helpers. */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

/** Image URL helper: supports categorized local assets as well as external links. */
const uimg = (path, w = 800) => {
    if (!path) return 'assets/cake-logo.jpg';
    if (path.startsWith('assets/') || path.startsWith('/') || path.startsWith('http')) {
        return path;
    }
    return `https://images.unsplash.com/${path}?auto=format&fit=crop&w=${w}&q=70`;
};

/** Fallback if an image is ever unavailable. */
const FALLBACK = seed => `this.onerror=null;this.src='assets/cake-logo.jpg'`;

/**
 * Show a transient toast notification (client-side only).
 * @param {string} message
 * @param {'success'|'error'} type
 */
function showToast(message, type = 'success') {
    const region = $('#toast-region');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i><span></span>`;
    toast.querySelector('span').textContent = message;   // textContent = XSS-safe
    region.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-showing'));
    setTimeout(() => {
        toast.classList.remove('is-showing');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3800);
}

/* ------------------------- Local "database" ---------------------------- */
/* Hard-coded content only — this site has no backend and sends nothing.   */

const MENU_ITEMS = [
    {
        id: 0, category: 'cakes', name: 'Custom Birthday Theme Cake', price: 450, popular: true,
        img: 'assets/cakes/custom-birthday-cake.jpg',
        short: '100% fresh cream sponge customized with your theme or photo.',
        full: "Baked fresh with delicate vanilla or chocolate sponge, multi-layer fresh cream, fruit coulis or rich chocolate fillings. Fully customizable with your loved one's photo, theme design, or personalized message."
    },
    {
        id: 1, category: 'cakes', name: 'Classic Black Forest Cake', price: 380, popular: true,
        img: 'assets/cakes/black-forest-cake.jpg',
        short: 'Dark chocolate sponge, whipped cream & sour cherries.',
        full: 'Moist chocolate sponge layers soaked in cherry syrup, filled with light whipped cream and dark cherry compote, enveloped in chocolate shavings.'
    },
    {
        id: 2, category: 'cakes', name: 'Red Velvet Celebration Pastry', price: 65, popular: false,
        img: 'assets/cakes/red-velvet-pastry.jpg',
        short: 'Velvety crimson sponge with smooth cream cheese frosting.',
        full: 'Rich cocoa-infused red velvet sponge layered with silky cream cheese frosting and dusted with red velvet crumbs.'
    },
    {
        id: 3, category: 'cakes', name: 'Butterscotch Crunch Cake', price: 400, popular: false,
        img: 'assets/cakes/butterscotch-crunch-cake.jpg',
        short: 'Vanilla sponge, butterscotch caramel & praline crunch.',
        full: 'Soft vanilla sponge generously coated with butterscotch cream, drizzled with golden caramel, and crowned with crunchy praline nuts.'
    },
    {
        id: 4, category: 'fastfood', name: 'Cheesy Paneer Tikka Pizza', price: 160, popular: true,
        img: 'assets/fastfood/paneer-tikka-pizza.jpg',
        short: 'Hand-tossed crust, spiced paneer, bell peppers & mozzarella.',
        full: 'Oven-baked crust topped with rich tomato herb sauce, marinated spiced paneer cubes, crisp capsicum, red onion, and generous melted mozzarella cheese.'
    },
    {
        id: 5, category: 'fastfood', name: 'Crispy Veg Loaded Burger', price: 95, popular: false,
        img: 'assets/fastfood/crispy-veg-burger.jpg',
        short: 'Golden veggie patty, fresh lettuce, tomato & house sauce.',
        full: 'Crisp seasoned vegetable patty layered with crisp green lettuce, ripe tomatoes, sliced onions, creamy mayonnaise, and tangy burger relish inside a toasted sesame bun.'
    },
    {
        id: 6, category: 'fastfood', name: 'Grilled Cheese Club Sandwich', price: 90, popular: false,
        img: 'assets/fastfood/grilled-club-sandwich.jpg',
        short: 'Double-decker grilled sandwich with cheese, veggies & mint chutney.',
        full: 'Toasted bread packed with fresh cucumber, tomato, spiced potato filling, shredded cheese, and zesty home-style coriander-mint chutney.'
    },
    {
        id: 7, category: 'fastfood', name: 'Crispy Chicken Burger', price: 120, popular: true,
        img: 'assets/fastfood/crispy-chicken-burger.jpg',
        short: 'Crispy seasoned chicken patty, creamy mayo & pickles.',
        full: 'Golden fried chicken patty topped with fresh iceberg lettuce, sliced tomatoes, creamy pepper mayo, and crunchy gherkins in a soft brioche-style bun.'
    },
    {
        id: 8, category: 'snacks', name: 'Crispy Egg Samosa (2 pcs)', price: 30, popular: true,
        img: 'assets/snacks/crispy-egg-samosa.jpg',
        short: 'Golden crispy pastry stuffed with spiced onion and egg filling.',
        full: "VK Puram's favorite tea-time snack! Flaky deep-fried triangle pastry loaded with a savoury, spiced egg and onion masala. Served with spicy green and sweet date chutney."
    },
    {
        id: 9, category: 'snacks', name: 'Hot Chicken Pepper Puff', price: 35, popular: true,
        img: 'assets/snacks/chicken-pepper-puff.jpg',
        short: 'Multi-layered flaky bakery puff stuffed with peppery chicken.',
        full: 'Freshly baked golden puff pastry with dozens of crisp buttery layers, filled with aromatic South Indian black pepper spiced chicken masala.'
    },
    {
        id: 10, category: 'snacks', name: 'Crispy Vegetable Puff', price: 20, popular: false,
        img: 'assets/snacks/vegetable-curry-puff.jpg',
        short: 'Flaky golden crust stuffed with spiced potato, peas & carrots.',
        full: 'The classic evening companion with hot chai — layered puff pastry packed with seasoned potatoes, green peas, carrots, and warm ground spices.'
    },
    {
        id: 11, category: 'sweets', name: 'Pure Ghee Mysore Pak', price: 160, popular: true,
        img: 'assets/sweets/pure-ghee-mysore-pak.jpg',
        short: 'Melt-in-mouth traditional sweet made with 100% pure desi ghee.',
        full: 'Our hallmark sweet! Crafted with roasted gram flour (besan), pure desi ghee, and fragrant cardamom. Melts instantly on your tongue with rich, buttery sweetness.'
    },
    {
        id: 12, category: 'sweets', name: 'Tirunelveli Wheat Halwa', price: 140, popular: true,
        img: 'assets/sweets/tirunelveli-wheat-halwa.jpg',
        short: 'Authentic glossy wheat halwa slow-cooked with pure ghee & cashews.',
        full: 'A regional legend! Slow-cooked fermented wheat milk with pure ghee and palm jaggery, studded with roasted cashew nuts and served warm and glossy.'
    },
    {
        id: 13, category: 'sweets', name: 'Cashew Kaju Katli', price: 240, popular: false,
        img: 'assets/sweets/cashew-kaju-katli.jpg',
        short: 'Delicate diamond-cut sweet made from premium Goan cashews.',
        full: 'Finely ground cashew paste simmered into a tender fudge, cut into festive diamonds and finished with edible silver leaf. Subtle, nutty, and mildly sweet.'
    },
    {
        id: 14, category: 'beverages', name: 'KitKat Thick Milkshake', price: 85, popular: true,
        img: 'assets/beverages/kitkat-thick-milkshake.jpg',
        short: 'Thick shake blended with crisp KitKat wafer and rich ice cream.',
        full: 'Thick, creamy milkshake blended with crunchy KitKat bars, vanilla ice cream, and drizzled with melted chocolate fudge sauce.'
    },
    {
        id: 15, category: 'beverages', name: 'South Indian Filter Coffee', price: 30, popular: false,
        img: 'assets/beverages/south-indian-filter-coffee.jpg',
        short: 'Traditional chicory-blend decoction frothed with fresh boiled milk.',
        full: 'Slow-dripped dark roast coffee decoction blended with steaming boiled fresh milk, served piping hot with golden froth in brass davarah & tumbler.'
    },
];

const GALLERY_ITEMS = [
    { img: 'assets/cakes/custom-birthday-cake.jpg', alt: 'Custom birthday theme cake with rich fresh cream' },
    { img: 'assets/fastfood/paneer-tikka-pizza.jpg', alt: 'Freshly baked cheesy paneer tikka pizza with bell peppers' },
    { img: 'assets/sweets/pure-ghee-mysore-pak.jpg', alt: 'Traditional pure ghee Mysore Pak sweets' },
    { img: 'assets/snacks/crispy-egg-samosa.jpg', alt: 'Golden crispy egg samosas and evening savouries' },
    { img: 'assets/beverages/kitkat-thick-milkshake.jpg', alt: 'Chilled KitKat and Oreo thick milkshakes' },
    { img: 'assets/fastfood/crispy-veg-burger.jpg', alt: 'Loaded crispy veg burger with fresh toppings' },
    { img: 'assets/cakes/black-forest-cake.jpg', alt: 'Black Forest celebration cake slice' },
    { img: 'assets/sweets/tirunelveli-wheat-halwa.jpg', alt: 'Authentic Tirunelveli ghee wheat halwa with cashews' },
];

/* ------------------------- Modal helpers ------------------------------- */

let lastFocusedElement = null;

/** Open a modal dialog: show, fade+scale in, lock scroll, move focus. */
function openModal(modal) {
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.classList.add('no-scroll');
    const focusTarget = $('[data-autofocus]', modal) || $('button, input, a', modal);
    if (focusTarget) focusTarget.focus();
}

/** Close a modal dialog: fade out, restore scroll and focus. */
function closeModal(modal) {
    modal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => {
        modal.hidden = true;
        if (lastFocusedElement) lastFocusedElement.focus();
    }, REDUCED_MOTION ? 0 : 320);
}

/** Wire backdrop buttons + Escape for every [data-close-modal] dialog. */
function initModalClosers() {
    $$('[data-close-modal]').forEach(el =>
        el.addEventListener('click', () => closeModal(el.closest('.modal'))));
}

/* ------------------------- 1. Preloader -------------------------------- */
function initPreloader() {
    const preloader = $('#preloader');
    if (!preloader) return;
    let done = false;
    const hide = () => {
        if (done) return;
        done = true;
        preloader.classList.add('is-done');
        setTimeout(() => {
            if (preloader.parentNode) preloader.remove();
        }, 700);
    };

    if (document.readyState === 'complete') {
        setTimeout(hide, 300);
    } else {
        window.addEventListener('load', hide, { once: true });
        setTimeout(hide, 1200);   // safety net: never trap the user
    }
}

/* ------------------------- 2. Navbar ----------------------------------- */
function initNavbar() {
    const navbar = $('#navbar');
    const toggle = $('#nav-toggle');
    const navMenu = $('#nav-menu');
    const links = $$('.navbar__link');
    if (!navbar) return;

    /* Shrink + shadow on scroll */
    const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Mobile hamburger: morph to X + slide/fade the menu panel */
    const setMenu = open => {
        if (!toggle || !navMenu) return;
        toggle.classList.toggle('is-open', open);
        navMenu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        document.body.classList.toggle('no-scroll', open);
    };
    if (toggle && navMenu) {
        toggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('is-open')));
        links.forEach(link => link.addEventListener('click', () => setMenu(false)));
    }

    /* Multi-page active link detection */
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    let pageMatched = false;

    links.forEach(l => {
        const href = l.getAttribute('href');
        const isCurrent = href === currentFile || 
            (currentFile === 'index.html' && (href === 'index.html' || href === './' || href === '#home')) ||
            (currentFile === '' && (href === 'index.html' || href === './'));
        if (isCurrent && !href.startsWith('#')) {
            links.forEach(other => other.classList.remove('is-active'));
            l.classList.add('is-active');
            pageMatched = true;
        }
    });

    /* Scroll-spy only when in-page anchor targets exist on index.html */
    if (!pageMatched && (currentFile === 'index.html' || currentFile === '')) {
        const spyTargets = ['home', 'about', 'menu', 'gallery', 'testimonials', 'contact']
            .map(id => document.getElementById(id))
            .filter(Boolean);

        if (spyTargets.length > 0) {
            const spy = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    links.forEach(l => {
                        const href = l.getAttribute('href');
                        if (href === `#${entry.target.id}`) {
                            links.forEach(other => other.classList.remove('is-active'));
                            l.classList.add('is-active');
                        }
                    });
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            spyTargets.forEach(section => spy.observe(section));
        }
    }
}

/* --------------------- 3. Scroll reveal (IO-based) --------------------- */
function initScrollReveal() {
    const elements = $$('.reveal');
    if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);              // reveal once
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    elements.forEach(el => observer.observe(el));
}

/* --------------------- 4. Animated stat counters ----------------------- */
function initCounters() {
    const numbers = $$('.stat__number');
    const run = el => {
        const target = parseInt(el.dataset.count, 10);
        if (REDUCED_MOTION) { el.textContent = target.toLocaleString(); return; }
        const duration = 1800;
        const start = performance.now();
        const tick = now => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);   // ease-out cubic
            el.textContent = Math.round(target * eased).toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            run(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.6 });
    numbers.forEach(el => observer.observe(el));
}

/* --------------------- 5. Menu render + filter ------------------------- */
function renderMenu() {
    const grid = $('#menu-grid');
    if (!grid) return;
    grid.innerHTML = MENU_ITEMS.map((item, i) => `
    <article class="menu-card" data-category="${item.category}"
             data-id="${item.id}" tabindex="0" role="button"
             style="animation-delay: ${Math.min((i % 8) * 45, 320)}ms"
             aria-label="View details for ${item.name}">
      <div class="menu-card__media">
        <img src="${uimg(item.img)}" alt="${item.name} — ${item.short}" loading="lazy"
             onerror="${FALLBACK(item.id)}">
        ${item.popular ? '<span class="menu-card__badge">Popular</span>' : ''}
      </div>
      <div class="menu-card__body">
        <div class="menu-card__row">
          <h3 class="menu-card__name">${item.name}</h3>
          <span class="menu-card__price">₹${item.price}</span>
        </div>
        <p class="menu-card__desc">${item.short}</p>
        <span class="menu-card__more">View details <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
      </div>
    </article>
  `).join('');
}

function initMenuFilter() {
    const filters = $$('.menu__filter');
    const cards = $$('.menu-card');
    if (!filters.length || !cards.length) return;

    const applyFilter = category => {
        let visibleCount = 0;
        cards.forEach(card => {
            const matches = category === 'all' || card.dataset.category === category;
            if (matches) {
                card.classList.remove('is-filtered-out');
                card.style.display = '';
                card.style.animation = 'none';
                void card.offsetWidth;
                card.style.animation = `menu-card-in 0.35s cubic-bezier(.22, .61, .36, 1) ${Math.min(visibleCount * 45, 280)}ms both`;
                visibleCount++;
            } else {
                card.classList.add('is-filtered-out');
                card.style.display = 'none';
                card.style.animation = 'none';
            }
        });
    };

    filters.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('is-active')) return;
            filters.forEach(f => {
                const isActive = f === button;
                f.classList.toggle('is-active', isActive);
                f.setAttribute('aria-pressed', String(isActive));
            });
            const category = button.dataset.filter || button.dataset.category || 'all';
            applyFilter(category);
        });
    });
}

/* --------------------- 6. Menu item modal ------------------------------ */
function initMenuModal() {
    const modal = $('#menu-modal');
    const resModal = $('#reservation-modal');
    const img = $('#modal-img');
    const badge = $('#modal-badge');
    const name = $('#modal-name');
    const desc = $('#modal-desc');
    const price = $('#modal-price');
    const grid = $('#menu-grid');
    const orderBtn = $('#modal-order-btn');
    if (!modal || !grid) return;
    let currentItem = null;

    const openItem = id => {
        const item = MENU_ITEMS.find(m => m.id === Number(id));
        if (!item) return;
        currentItem = item;
        img.src = uimg(item.img, 1000);
        img.alt = `${item.name} — ${item.short}`;
        img.onerror = function () { this.onerror = null; this.src = 'assets/cake-logo.jpg'; };
        badge.hidden = !item.popular;
        name.textContent = item.name;
        desc.textContent = item.full;
        price.textContent = `₹${item.price}`;

        const waDirectBtn = $('#modal-wa-btn');
        if (waDirectBtn) {
            const waMsg = [
                '🎂 *DIRECT ORDER INQUIRY — SANGEET BAKERY & SWEETS* 🎂',
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                `🍰 *Item:* ${item.name}`,
                `💰 *Price:* ₹${item.price}`,
                `📌 *Details:* ${item.short}`,
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                'Hello Sangeet Bakery! I would like to order this item. Please let me know today\'s availability and delivery details.'
            ].join('\n');
            waDirectBtn.href = `https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
        }

        openModal(modal);
    };

    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            closeModal(modal);
            if (currentItem) {
                const itemSelect = $('#res-item');
                if (itemSelect) {
                    let matched = false;
                    for (const opt of itemSelect.options) {
                        if (opt.value === currentItem.name || opt.text.toLowerCase().includes(currentItem.name.toLowerCase())) {
                            itemSelect.value = opt.value;
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        itemSelect.value = 'Other Custom Order';
                        const notes = $('#res-notes');
                        if (notes && !notes.value) {
                            notes.value = `Item: ${currentItem.name} (₹${currentItem.price})`;
                        }
                    }
                    itemSelect.dispatchEvent(new Event('change'));
                }
            }
            if (resModal) setTimeout(() => openModal(resModal), 180);
        });
    }

    /* Delegate: click + keyboard (Enter / Space) on any card */
    grid.addEventListener('click', e => {
        const card = e.target.closest('.menu-card');
        if (card) openItem(card.dataset.id);
    });
    grid.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.menu-card');
        if (card) { e.preventDefault(); openItem(card.dataset.id); }
    });
}

/* ------------- 7. Generic slider factory (carousel w/ swipe) ----------- */
function createSlider(root, { slideSelector, interval = 5000, autoplay = true } = {}) {
    if (!root) return null;
    const track = $('.js-slider-track', root);
    const slides = $$(slideSelector, root);
    const dotsWrap = $('.js-slider-dots', root);
    let index = 0;
    let timer = null;

    /* Dot indicators */
    const dots = slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i, true));
        dotsWrap.appendChild(dot);
        return dot;
    });

    function goTo(i, userAction = false) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;   // transform-only slide
        dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
        if (userAction) restart();
    }
    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    $('.js-slider-next', root).addEventListener('click', () => goTo(index + 1, true));
    $('.js-slider-prev', root).addEventListener('click', () => goTo(index - 1, true));

    /* Autoplay with pause-on-hover */
    function start() { if (autoplay && !REDUCED_MOTION && !timer) timer = setInterval(next, interval); }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    /* Pointer swipe (mouse drag + touch) */
    let startX = 0, deltaX = 0, dragging = false;
    const viewport = $('.js-slider-viewport', root);
    viewport.addEventListener('pointerdown', e => {
        dragging = true; startX = e.clientX; deltaX = 0; stop();
    });
    window.addEventListener('pointermove', e => { if (dragging) deltaX = e.clientX - startX; });
    window.addEventListener('pointerup', () => {
        if (!dragging) return;
        dragging = false;
        if (Math.abs(deltaX) > 40) (deltaX < 0 ? goTo(index + 1, true) : goTo(index - 1, true));
        start();
    });

    start();
    return { goTo, next, prev, stop, start };
}

/* --------------------- 8. Daily specials carousel ---------------------- */
function initSpecialsCarousel() {
    createSlider($('#specials-carousel'), {
        slideSelector: '.special-card',
        interval: 5500,
    });
}

/* --------------------- 9. Testimonials slider (fade) ------------------- */
function initTestimonials() {
    const root = $('#testimonial-slider');
    if (!root) return;
    const slides = $$('.testimonial', root);
    const dotsWrap = $('#testimonial-dots');
    let index = 0;
    let timer = null;

    if (!slides.length) return;

    const dots = slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
        dot.addEventListener('click', () => goTo(i, true));
        if (dotsWrap) dotsWrap.appendChild(dot);
        return dot;
    });

    function goTo(i, userAction = false) {
        index = (i + slides.length) % slides.length;
        slides.forEach((slide, si) => {
            slide.classList.toggle('is-active', si === index);
            slide.classList.toggle('is-prev', si === (index - 1 + slides.length) % slides.length);
            slide.setAttribute('aria-hidden', String(si !== index));
        });
        dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
        if (userAction) restart();
    }

    const start = () => { if (!REDUCED_MOTION && !timer) timer = setInterval(() => goTo(index + 1), 6000); };
    const stop = () => { clearInterval(timer); timer = null; };
    const restart = () => { stop(); start(); };

    const nextBtn = $('#testimonial-next');
    const prevBtn = $('#testimonial-prev');
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1, true));
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1, true));

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    /* Swipe support */
    let startX = 0, deltaX = 0, dragging = false;
    root.addEventListener('pointerdown', e => { dragging = true; startX = e.clientX; deltaX = 0; stop(); });
    window.addEventListener('pointermove', e => { if (dragging) deltaX = e.clientX - startX; });
    window.addEventListener('pointerup', () => {
        if (!dragging) return;
        dragging = false;
        if (Math.abs(deltaX) > 40) (deltaX < 0 ? goTo(index + 1, true) : goTo(index - 1, true));
        start();
    });

    goTo(0);
    start();
}

/* --------------------- 10. Gallery render + lightbox ------------------- */
function renderGallery() {
    const grid = $('#gallery-grid');
    if (!grid) return;
    grid.innerHTML = GALLERY_ITEMS.map((item, i) => `
    <button class="gallery__item reveal reveal--scale" data-index="${i}"
            style="--reveal-delay:${(i % 4) * 80}ms"
            aria-label="Open image: ${item.alt}">
      <img src="${uimg(item.img, 600)}" alt="${item.alt}" loading="lazy"
           onerror="${FALLBACK(`g${i}`)}">
      <span class="gallery__overlay" aria-hidden="true"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
    </button>
  `).join('');
}

function initLightbox() {
    const lightbox = $('#lightbox');
    const grid = $('#gallery-grid');
    if (!lightbox || !grid) return;
    const img = $('#lightbox-img');
    const caption = $('#lightbox-caption');
    let current = 0;

    const render = () => {
        const item = GALLERY_ITEMS[current];
        if (!item || !img || !caption) return;
        img.src = uimg(item.img, 1400);
        img.alt = item.alt;
        caption.textContent = item.alt;
    };

    const open = i => { current = i; render(); openModal(lightbox); };
    const goToLight = step => { current = (current + step + GALLERY_ITEMS.length) % GALLERY_ITEMS.length; render(); };

    grid.addEventListener('click', e => {
        const item = e.target.closest('.gallery__item');
        if (item) open(Number(item.dataset.index));
    });

    const prevBtn = $('#lightbox-prev');
    const nextBtn = $('#lightbox-next');
    if (prevBtn) prevBtn.addEventListener('click', () => goToLight(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToLight(1));
    $$('[data-close-lightbox]').forEach(el =>
        el.addEventListener('click', () => closeModal(lightbox)));

    /* Swipe support inside the lightbox */
    let startX = 0;
    lightbox.addEventListener('pointerdown', e => { startX = e.clientX; });
    lightbox.addEventListener('pointerup', e => {
        const deltaX = e.clientX - startX;
        if (Math.abs(deltaX) > 40) goToLight(deltaX < 0 ? 1 : -1);
    });
}

/* --------------------- 11. Reservation & Order via WhatsApp (No Backend) ----------- */
function initReservation() {
    const modal = $('#reservation-modal');
    const form = $('#reservation-form');
    if (!form) return;

    /* Any [data-open-reservation] trigger opens the modal if present, or scrolls to the on-page form */
    $$('[data-open-reservation]').forEach(trigger =>
        trigger.addEventListener('click', e => {
            e.preventDefault();
            if (modal) {
                openModal(modal);
            } else {
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const nameInput = $('#res-name');
                if (nameInput) nameInput.focus();
            }
        }));

    /* Bestseller "Order Now" buttons pre-select item in order modal */
    $$('.bestseller-btn-order').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const itemName = btn.dataset.item;
            const itemSelect = $('#res-item');
            if (itemSelect && itemName) {
                let matched = false;
                for (const opt of itemSelect.options) {
                    if (opt.value === itemName || opt.text.toLowerCase().includes(itemName.toLowerCase())) {
                        itemSelect.value = opt.value;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    itemSelect.value = 'Other Custom Order';
                    const notes = $('#res-notes');
                    if (notes && !notes.value) {
                        notes.value = `Order Item: ${itemName}`;
                    }
                }
                itemSelect.dispatchEvent(new Event('change'));
            }
            if (modal) {
                openModal(modal);
            } else {
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const nameInput = $('#res-name');
                if (nameInput) nameInput.focus();
            }
        });
    });

    /* Date min = today */
    const dateInput = $('#res-date');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    const setError = (id, message) => {
        const input = $(`#${id}`);
        const error = $(`#${id}-error`);
        const hasError = Boolean(message);
        if (input) {
            input.classList.toggle('is-invalid', hasError);
            input.classList.toggle('is-valid', !hasError && input.value.trim().length > 0);
            input.setAttribute('aria-invalid', String(hasError));
        }
        if (error) {
            error.innerHTML = message
                ? `<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> <span>${message}</span>`
                : '';
        }
        return !hasError;
    };

    const validators = {
        'res-name': v => {
            const val = v.trim();
            if (!val) return 'Please enter your full name.';
            if (val.length < 2) return 'Full name must be at least 2 characters.';
            if (/\d/.test(val)) return 'Name should not contain numbers.';
            return true;
        },
        'res-phone': v => {
            const raw = v.trim();
            if (!raw) return 'Please enter your mobile number.';

            // Check if there are illegal characters (letters or prohibited symbols)
            if (/[^\d\s\-\+\(\)]/.test(raw)) {
                return 'Phone number should only contain digits and formatting (+, -, spaces).';
            }

            // Extract pure digits
            const digits = raw.replace(/\D/g, '');
            if (!digits) return 'Please enter your mobile number.';

            // Handle country code +91 / 91 prefix (12 digits) or STD 0 prefix (11 digits)
            let coreDigits = digits;
            if (coreDigits.startsWith('91') && coreDigits.length === 12) {
                coreDigits = coreDigits.slice(2);
            } else if (coreDigits.startsWith('0') && coreDigits.length === 11) {
                coreDigits = coreDigits.slice(1);
            }

            if (coreDigits.length !== 10) {
                return 'Please enter a valid 10-digit mobile number (e.g., +91 88255 43938).';
            }

            if (!/^[6-9]/.test(coreDigits)) {
                return 'Indian mobile numbers start with 6, 7, 8, or 9.';
            }

            return true;
        },
        'res-email': v => {
            const val = v.trim();
            if (!val) return 'Please enter your email address.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) return 'Please enter a valid email address (e.g., name@example.com).';
            return true;
        },
        'res-item': v => {
            if (!v || !v.trim()) return 'Please select an item or cake from the menu.';
            return true;
        },
        'res-guests': v => {
            const val = v.trim();
            if (!val) return 'Please enter quantity or cake weight (e.g., 1 kg / 20 pcs).';
            return true;
        },
        'res-date': v => {
            if (!v) return 'Please pick a delivery / pickup date.';
            const today = new Date().toISOString().split('T')[0];
            if (v < today) return 'Selected date cannot be in the past.';
            return true;
        },
        'res-time': v => {
            if (!v) return 'Please pick a preferred time.';
            if (v < '08:30' || v > '22:00') return 'Bakery hours are between 8:30 AM and 10:00 PM.';
            return true;
        },
        'res-notes': v => {
            const item = $('#res-item')?.value;
            if (item === 'Other Custom Order' && !v.trim()) {
                return 'Please describe your custom order requirements in the notes.';
            }
            return true;
        }
    };

    /* Allow phone formatting characters: digits, +, spaces, dashes, and parentheses */
    const phoneInput = $('#res-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            // Keep digits, plus sign, spaces, hyphens, and parentheses; block letters
            phoneInput.value = phoneInput.value.replace(/[^\d\s\-\+\(\)]/g, '').slice(0, 18);
        });
    }

    /* Real-time validation: on blur, and live cleanup on input/change */
    Object.keys(validators).forEach(id => {
        const el = $(`#${id}`);
        if (!el) return;

        // When leaving field (blur), validate if non-empty
        el.addEventListener('blur', () => {
            if (el.value.trim() !== '') {
                const res = validators[id](el.value);
                setError(id, res === true ? '' : res);
            }
        });

        // When user types or changes value, re-check immediately if field already has error
        const evt = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(evt, () => {
            if (el.classList.contains('is-invalid')) {
                const res = validators[id](el.value);
                setError(id, res === true ? '' : res);
            } else if (el.value.trim() !== '') {
                const res = validators[id](el.value);
                if (res === true) setError(id, '');
            }
        });
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        let firstInvalid = null;
        let invalidCount = 0;

        Object.entries(validators).forEach(([id, validate]) => {
            const el = $(`#${id}`);
            if (!el) return;
            const result = validate(el.value);
            const ok = setError(id, result === true ? '' : result);
            if (!ok) {
                invalidCount++;
                if (!firstInvalid) firstInvalid = el;
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast(`Please check the ${invalidCount} highlighted field${invalidCount > 1 ? 's' : ''} to continue.`, 'error');
            return;
        }

        const nameVal = $('#res-name')?.value.trim() || '';
        const phoneVal = $('#res-phone')?.value.trim() || '';
        const emailVal = $('#res-email')?.value.trim() || '';
        const serviceSelect = $('#res-service');
        const serviceVal = serviceSelect ? (serviceSelect.options[serviceSelect.selectedIndex]?.text || serviceSelect.value) : 'Takeout / Store Pickup';
        const itemSelect = $('#res-item');
        const itemVal = itemSelect ? itemSelect.value : 'Custom Bakery Order';
        const guestsVal = $('#res-guests')?.value.trim() || '1 kg';
        const dateVal = $('#res-date')?.value || '';
        const timeVal = $('#res-time')?.value || '';
        const notesVal = $('#res-notes')?.value.trim() || '';

        // Format 12-hour time (e.g. 17:30 -> 5:30 PM)
        let formattedTime = timeVal;
        if (timeVal && timeVal.includes(':')) {
            const [h, m] = timeVal.split(':').map(Number);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            formattedTime = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
        }

        // Format human-friendly date (e.g. 2026-09-20 -> 20 Sep 2026)
        let formattedDate = dateVal;
        if (dateVal && dateVal.includes('-')) {
            try {
                const [y, m, d] = dateVal.split('-');
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                formattedDate = `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
            } catch (err) {
                formattedDate = dateVal;
            }
        }

        // Construct structured WhatsApp order message
        const messageLines = [
            '🎂 *NEW ORDER / INQUIRY — SANGEET BAKERY & SWEETS* 🎂',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            `👤 *Customer Name:* ${nameVal}`,
            `📱 *Phone Number:* ${phoneVal}`,
            emailVal ? `📧 *Email Address:* ${emailVal}` : null,
            `🛍️ *Order Service:* ${serviceVal}`,
            '',
            `🍰 *Item / Cake:* ${itemVal}`,
            `⚖️ *Quantity / Weight:* ${guestsVal}`,
            `📅 *Required Date:* ${formattedDate}`,
            `⏰ *Required Time:* ${formattedTime}`,
            '',
            '📝 *Cake Message / Special Instructions:*',
            notesVal ? notesVal : 'None (Standard Preparation)',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            '📍 *Store:* 982, Upper Dam Rd, VK Puram 627425',
            '🌐 *Order sent via Sangeet Bakery Website*'
        ].filter(line => line !== null).join('\n');

        const waUrl = `https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encodeURIComponent(messageLines)}`;

        // Open WhatsApp directly without backend server
        const waWin = window.open(waUrl, '_blank');
        if (!waWin || waWin.closed || typeof waWin.closed === 'undefined') {
            window.location.href = waUrl;
        }

        form.reset();
        $$('.form__error', form).forEach(el => { el.innerHTML = ''; });
        $$('.is-invalid, .is-valid', form).forEach(el => el.classList.remove('is-invalid', 'is-valid'));
        if (modal) closeModal(modal);

        showToast(`Opening WhatsApp to send your order for "${itemVal}"! Thank you, ${nameVal.split(' ')[0]}!`, 'success');
    });
}

/* --------------------- 12. Newsletter (client-side) -------------------- */
function initNewsletter() {
    const form = $('#newsletter-form');
    const input = $('#newsletter-email');
    if (!form || !input) return;
    const isValid = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

    input.addEventListener('input', () => {
        if (isValid(input.value)) input.classList.remove('is-invalid');
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!isValid(input.value)) {
            input.classList.add('is-invalid');
            input.focus();
            showToast('Please enter a valid email address.', 'error');
            return;
        }
        input.classList.remove('is-invalid');
        showToast("You're on the fresh sheet! First bake letter lands Friday.");
        form.reset();
    });
}

/* --------------------- 13. Back to top --------------------------------- */
function initBackToTop() {
    const button = $('#back-to-top');
    if (!button) return;
    const onScroll = () => button.classList.toggle('is-visible', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    button.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' }));
}

/* --------------------- 14. Escape key (global) ------------------------- */
function initEscapeKey() {
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        $$('.modal.is-open').forEach(closeModal);
        const lightbox = $('#lightbox');
        if (lightbox && lightbox.classList.contains('is-open')) closeModal(lightbox);
        const navMenu = $('#nav-menu');
        if (navMenu && navMenu.classList.contains('is-open')) $('#nav-toggle')?.click();
    });

    /* Arrow keys navigate the lightbox when it is open */
    document.addEventListener('keydown', e => {
        const lightbox = $('#lightbox');
        if (!lightbox || !lightbox.classList.contains('is-open')) return;
        if (e.key === 'ArrowRight') $('#lightbox-next')?.click();
        if (e.key === 'ArrowLeft') $('#lightbox-prev')?.click();
    });
}

/* --------------------- 15. FAQ Accordion (Contact Page) ---------------- */
function initFaqAccordion() {
    $$('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            if (!item) return;
            const isOpen = item.classList.contains('is-open');
            $$('.faq-item.is-open').forEach(other => other.classList.remove('is-open'));
            if (!isOpen) item.classList.add('is-open');
        });
    });
}

/* --------------------- 16. Video Players Auto-Pause (About Page) -------- */
function initVideoPlayers() {
    const videos = $$('video');
    videos.forEach(vid => {
        vid.addEventListener('play', () => {
            videos.forEach(other => {
                if (other !== vid && !other.paused) other.pause();
            });
        });
    });
}

/* --------------------- 17. Testimonial Filter (Testimonials Page) ------- */
function initTestimonialFilter() {
    const pills = $$('.review-filter-pill');
    const cards = $$('.review-card');
    if (!pills.length || !cards.length) return;

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('is-active'));
            pill.classList.add('is-active');
            const cat = pill.dataset.filter;
            cards.forEach(card => {
                const match = cat === 'all' || card.dataset.category === cat;
                card.style.display = match ? '' : 'none';
            });
        });
    });
}

/* --------------------- Boot -------------------------------------------- */
function boot() {
    renderMenu();
    renderGallery();

    initPreloader();
    initNavbar();
    initScrollReveal();
    initCounters();
    initMenuFilter();
    initMenuModal();
    initSpecialsCarousel();
    initTestimonials();
    initLightbox();
    initReservation();
    initNewsletter();
    initBackToTop();
    initModalClosers();
    initEscapeKey();
    initFaqAccordion();
    initVideoPlayers();
    initTestimonialFilter();

    /* Footer year */
    const footerYear = $('#footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}