document.addEventListener('DOMContentLoaded', () => {
    
    // --- STATE ---
    let cart = [];
    const WHATSAPP_NUMBER = '526143938498'; // Mexico prefix + 614 393 8498

    // --- DOM ELEMENTS ---
    // Nav & Sections
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.menu-section');
    const navContainer = document.querySelector('.nav-container');
    
    // Status Badge
    const statusBadge = document.getElementById('store-status');

    // Cart Drawer
    const cartDrawer = document.getElementById('cart-drawer');
    const cartTrigger = document.getElementById('floating-cart-trigger');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalValue = document.getElementById('cart-total-value');
    const cartBadgeCount = document.getElementById('cart-badge');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');

    // Customizer Elements
    const customPanOptions = document.querySelectorAll('input[name="pan-select"]');
    const customSalchichaOptions = document.querySelectorAll('input[name="salchicha-select"]');
    const customExtrasOptions = document.querySelectorAll('input[name="extra-select"]');
    
    const summaryPan = document.querySelector('#summary-pan span:last-child');
    const summarySalchicha = document.querySelector('#summary-salchicha span:last-child');
    const summaryExtras = document.querySelector('#summary-extras span:last-child');
    const customTotalPrice = document.getElementById('custom-total-price');
    const addCustomDogoBtn = document.getElementById('add-custom-dogo-btn');

    // Flag to lock Intersection Observer updates during custom tab click smooth scrolls
    let isAutoScrolling = false;
    let autoScrollTimeout = null;

    // --- 1. NAVIGATION & SCROLL LOGIC ---
    
    // Helper to center the active navigation tab button horizontally on mobile
    function centerActiveNavButton(activeBtn) {
        if (!navContainer || !activeBtn) return;
        const containerWidth = navContainer.offsetWidth;
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;
        
        navContainer.scrollTo({
            left: btnLeft - (containerWidth / 2) + (btnWidth / 2),
            behavior: 'smooth'
        });
    }

    // Attach click/tap event to navigation tabs
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.dataset.target;
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Lock observer during this smooth scroll sequence to prevent tab indicators from jumping
                isAutoScrolling = true;
                clearTimeout(autoScrollTimeout);

                // Update active tab class immediately for instant visual feedback
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                centerActiveNavButton(btn);

                // Perform hardware-friendly smooth scroll to the section
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Unlock observer after smooth scroll completes
                autoScrollTimeout = setTimeout(() => {
                    isAutoScrolling = false;
                }, 850);
            }
        });
    });

    // --- 2. INTERSECTION OBSERVER FOR AUTO-HIGHLIGHT TABS ---
    // Listens to which section is occupying the centered sweet-spot of the mobile viewport
    const observerOptions = {
        root: null, // Default viewport
        rootMargin: '-25% 0px -55% 0px', // Centered band to trigger section entrance
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        // Skip updates if user triggered an auto-scroll click
        if (isAutoScrolling) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                const correspondingBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
                
                if (correspondingBtn) {
                    navButtons.forEach(b => b.classList.remove('active'));
                    correspondingBtn.classList.add('active');
                    centerActiveNavButton(correspondingBtn);
                }
            }
        });
    }, observerOptions);

    // Observe each category section
    sections.forEach(sec => sectionObserver.observe(sec));

    // --- 3. DYNAMIC STORE STATUS INDICATOR (LATE NIGHT AWARE) ---
    function updateStoreStatus() {
        const now = new Date();
        const day = now.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour + (minute / 60);

        let isOpen = false;

        function isBetween(val, start, end) {
            if (start <= end) {
                return val >= start && val < end;
            } else {
                return val >= start || val < end;
            }
        }

        // Sunday
        if (day === 0) {
            isOpen = isBetween(currentTime, 18.5, 3) || isBetween(currentTime, 0, 3.5);
        }
        // Monday
        else if (day === 1) {
            isOpen = isBetween(currentTime, 18.5, 2) || isBetween(currentTime, 0, 3);
        }
        // Tuesday
        else if (day === 2) {
            isOpen = isBetween(currentTime, 19, 3) || isBetween(currentTime, 0, 2);
        }
        // Wednesday
        else if (day === 3) {
            isOpen = isBetween(currentTime, 0, 3); // Morning spillover only
        }
        // Thursday
        else if (day === 4) {
            isOpen = isBetween(currentTime, 19, 3);
        }
        // Friday
        else if (day === 5) {
            isOpen = isBetween(currentTime, 19, 3.5) || isBetween(currentTime, 0, 3);
        }
        // Saturday
        else if (day === 6) {
            isOpen = isBetween(currentTime, 19, 3.5) || isBetween(currentTime, 0, 3.5);
        }

        if (isOpen) {
            statusBadge.textContent = '🟢 Abierto Ahora';
            statusBadge.className = 'status-badge open';
        } else {
            statusBadge.textContent = '🔴 Cerrado (Abre en horario de servicio)';
            statusBadge.className = 'status-badge closed';
        }
    }

    updateStoreStatus();
    setInterval(updateStoreStatus, 60000); // Check once a minute

    // --- 4. CUSTOMIZER (ARMA TU DOGO) LOGIC ---
    function updateCustomDogoPrice() {
        const basePrice = 60;
        let panPrice = 0;
        let salchichaPrice = 0;
        let extrasPrice = 0;

        let panName = '';
        let salchichaName = '';
        let selectedExtras = [];

        // Pan select
        customPanOptions.forEach(opt => {
            if (opt.checked) {
                panName = opt.value;
                if (panName !== 'Tradicional Suave') {
                    panPrice = 15;
                }
                summaryPan.textContent = `${panName} (+$${panPrice.toFixed(2)})`;
            }
        });

        // Salchicha select
        customSalchichaOptions.forEach(opt => {
            if (opt.checked) {
                salchichaName = opt.value;
                if (salchichaName !== 'Clásica') {
                    salchichaPrice = 25;
                }
                summarySalchicha.textContent = `${salchichaName.split(' ')[0]} (+$${salchichaPrice.toFixed(2)})`;
            }
        });

        // Extras select
        customExtrasOptions.forEach(opt => {
            if (opt.checked) {
                const price = parseFloat(opt.dataset.price);
                extrasPrice += price;
                selectedExtras.push(`${opt.value} (+$${price})`);
            }
        });

        if (selectedExtras.length > 0) {
            summaryExtras.innerHTML = selectedExtras.join('<br>');
        } else {
            summaryExtras.textContent = 'Ninguno';
        }

        const totalPrice = basePrice + panPrice + salchichaPrice + extrasPrice;
        customTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;

        return {
            price: totalPrice,
            pan: panName,
            salchicha: salchichaName,
            extras: selectedExtras.map(e => e.split(' (')[0])
        };
    }

    // Bind change events
    customPanOptions.forEach(opt => opt.addEventListener('change', updateCustomDogoPrice));
    customSalchichaOptions.forEach(opt => opt.addEventListener('change', updateCustomDogoPrice));
    customExtrasOptions.forEach(opt => opt.addEventListener('change', updateCustomDogoPrice));
    
    // Init price check
    updateCustomDogoPrice();

    // --- 5. CART DRAWER OPERATIONS ---
    function openCart() {
        cartDrawer.classList.add('open');
        cartDrawer.setAttribute('aria-hidden', 'false');
        // Prevent body scrolling when cart is open for app-native overlay experience
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    cartTrigger.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);

    // Add standard menu item to cart
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            
            addItemToCart(name, price);
            
            // Pulse animation on trigger
            cartTrigger.style.transform = 'scale(1.15)';
            setTimeout(() => {
                cartTrigger.style.transform = '';
            }, 200);

            // Auto show cart drawer to verify addition
            openCart();
        });
    });

    // Add customized dogo to cart
    addCustomDogoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const details = updateCustomDogoPrice();
        const customName = '🌭 Dogo Personalizado';
        
        let customInfo = `• Pan: ${details.pan}\n• Salchicha: ${details.salchicha}`;
        if (details.extras.length > 0) {
            customInfo += `\n• Extras: ${details.extras.join(', ')}`;
        }

        addItemToCart(customName, details.price, customInfo);

        // Reset inputs
        customExtrasOptions.forEach(opt => opt.checked = false);
        customPanOptions[0].checked = true;
        customSalchichaOptions[0].checked = true;
        updateCustomDogoPrice();

        // Cart trigger feedback
        cartTrigger.style.transform = 'scale(1.15)';
        setTimeout(() => {
            cartTrigger.style.transform = '';
        }, 200);

        openCart();
    });

    function addItemToCart(name, price, customInfo = '') {
        const existingItem = cart.find(item => item.name === name && item.customInfo === customInfo);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
                name: name,
                price: price,
                quantity: 1,
                customInfo: customInfo
            });
        }

        renderCart();
    }

    function updateQuantity(itemId, newQty) {
        if (newQty <= 0) {
            cart = cart.filter(item => item.id !== itemId);
        } else {
            const item = cart.find(item => item.id === itemId);
            if (item) item.quantity = newQty;
        }
        renderCart();
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío. ¡Elige tus platillos favoritos!</p>';
            sendWhatsappBtn.disabled = true;
        } else {
            sendWhatsappBtn.disabled = false;
            
            cart.forEach(item => {
                total += item.price * item.quantity;
                totalCount += item.quantity;

                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                
                const customTextFormatted = item.customInfo 
                    ? item.customInfo.replace(/\n/g, '<br>') 
                    : '';

                itemEl.innerHTML = `
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        ${item.customInfo ? `<div class="cart-item-custom-info">${customTextFormatted}</div>` : ''}
                    </div>
                    <div class="cart-item-right">
                        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn minus-btn" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn plus-btn" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                        </div>
                    </div>
                `;

                cartItemsContainer.appendChild(itemEl);
            });
        }

        cartTotalValue.textContent = `$${total.toFixed(2)}`;
        cartBadgeCount.textContent = totalCount;

        // Re-bind quantity buttons
        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = btn.dataset.id;
                const item = cart.find(i => i.id === itemId);
                if (item) updateQuantity(itemId, item.quantity - 1);
            });
        });

        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = btn.dataset.id;
                const item = cart.find(i => i.id === itemId);
                if (item) updateQuantity(itemId, item.quantity + 1);
            });
        });
    }

    clearCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cart = [];
        renderCart();
    });

    // --- 6. CHECKOUT VIA WHATSAPP ---
    sendWhatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        let message = `🌭 *¡Hola Gourmands Hot-Dogs!*\nMe gustaría realizar el siguiente pedido:\n\n`;
        let total = 0;

        cart.forEach((item) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            message += `*${item.quantity}x ${item.name}* - $${subtotal.toFixed(2)}\n`;
            if (item.customInfo) {
                const formattedInfo = item.customInfo.split('\n').map(line => `   ${line}`).join('\n');
                message += `${formattedInfo}\n`;
            }
            message += `\n`;
        });

        message += `----------------------------\n`;
        message += `💰 *TOTAL A PAGAR:* $${total.toFixed(2)} MXN\n`;
        message += `----------------------------\n\n`;
        message += `📍 *Por favor, confírmenme si:* \n- Tienen servicio a domicilio disponible.\n- El tiempo aproximado de entrega.\n\n¡Gracias!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    });

});
