// 1. SHOP CONFIGURATION
const CONFIG = {
  viber: "960998-5786", // Put Infancy Kids 7-digit Viber number after 960
  ig: "https://instagram.com",
  fb: "https://facebook.com",
  ownerPin: "1234"
};

const igEl = document.getElementById("igLink");
const fbEl = document.getElementById("fbLink");
if (igEl) igEl.href = CONFIG.ig;
if (fbEl) fbEl.href = CONFIG.fb;

// 2. REAL MPOS INVENTORY
const DEFAULT_PRODUCTS = [
  { code: "00030", name: "Drypers Diapers NB (Newborn)", cat: "Diapers", price: 200, icon: "🧷" },
  { code: "00031", name: "Drypers Diapers Small", cat: "Diapers", price: 200, icon: "🧷" },
  { code: "00032", name: "Drypers Diapers M", cat: "Diapers", price: 200, icon: "🧷" },
  { code: "00029", name: "Drypers Diapers L", cat: "Diapers", price: 200, icon: "🧷" },
  { code: "00028", name: "Drypers Diapers XL", cat: "Diapers", price: 200, icon: "🧷" },
  { code: "00033", name: "Drypers Baby Wipes S", cat: "Diapers", price: 35, icon: "🧻" },
  { code: "00034", name: "Drypers Baby Wipes B", cat: "Diapers", price: 65, icon: "🧻" },
  { code: "00020", name: "Baby Bottle (S)", cat: "Feeding", price: 150, icon: "🍼" },
  { code: "00008", name: "Water Bottle (Big)", cat: "Feeding", price: 140, icon: "🥤" },
  { code: "00009", name: "Water Bottle (Small)", cat: "Feeding", price: 120, icon: "🥤" },
  { code: "00016", name: "Breast Pump Chica", cat: "Feeding", price: 450, icon: "🤱" },
  { code: "00017", name: "Breast Pump (Big)", cat: "Feeding", price: 480, icon: "🤱" },
  { code: "00006", name: "Baby Monitor Video B.Monitor", cat: "Gear", price: 1150, icon: "📡" },
  { code: "00010", name: "Baby Monitor Wireless", cat: "Gear", price: 950, icon: "📡" },
  { code: "00013", name: "Baby Monitor Indoor PT Cam", cat: "Gear", price: 1150, icon: "📡" },
  { code: "00015", name: "WiFi Smart Camera", cat: "Gear", price: 1100, icon: "📷" },
  { code: "00018", name: "Seat Belt Hip (L)", cat: "Gear", price: 435, icon: "👶" },
  { code: "00019", name: "Potty Normal", cat: "Gear", price: 295, icon: "🚽" },
  { code: "00027", name: "Potty With Neck", cat: "Gear", price: 285, icon: "🚽" },
  { code: "00001", name: "Scooter", cat: "Gear", price: 550, icon: "🛴" },
  { code: "00026", name: "Helicopter", cat: "Gear", price: 1250, icon: "🚁" },
  { code: "00021", name: "Blocks Bag Red", cat: "Gear", price: 210, icon: "🧱" },
  { code: "00025", name: "Blocks In A Car", cat: "Gear", price: 125, icon: "🚗" },
  { code: "00022", name: "Bouncing Ball", cat: "Gear", price: 123, icon: "⚽" },
  { code: "00024", name: "Rubber Duck Toy", cat: "Gear", price: 123, icon: "🦆" },
  { code: "00011", name: "Flamingo Bubble Stick", cat: "Gear", price: 200, icon: "🫧" },
  { code: "00012", name: "Duck Bubble Stick", cat: "Gear", price: 109, icon: "🫧" },
  { code: "00023", name: "Bubble Bottle F&D", cat: "Gear", price: 35, icon: "🫧" }
];

// 3. APP STATE & STORAGE
const STORAGE_KEY = "ik_mpos_v1";
let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_PRODUCTS;
let currentUser = JSON.parse(localStorage.getItem("ik_user")) || null;
let activeTab = "All";
let cart = [];

function getBucketKey() {
  return currentUser && currentUser.phone ? "ik_bucket_" + currentUser.phone : "ik_bucket_guest";
}

function loadUserBucket() {
  cart = JSON.parse(localStorage.getItem(getBucketKey())) || [];
  updateBar();
  render();
}

function saveUserBucket() {
  localStorage.setItem(getBucketKey(), JSON.stringify(cart));
}

// 4. TWO-PAGE NAVIGATION
function switchPage(page) {
  const homeEl = document.getElementById("pageHome");
  const shopEl = document.getElementById("pageShop");
  const navHome = document.getElementById("navHome");
  const navShop = document.getElementById("navShop");

  if (homeEl) homeEl.style.display = page === "home" ? "block" : "none";
  if (shopEl) shopEl.style.display = page === "shop" ? "block" : "none";
  if (navHome) navHome.classList.toggle("active", page === "home");
  if (navShop) navShop.classList.toggle("active", page === "shop");

  if (page === "shop") render();
}

// 5. CUSTOMER SIGN IN
function updateAuthUI() {
  const btn = document.getElementById("authBtn");
  if (!btn) return;
  btn.innerText = currentUser ? "Hi, " + currentUser.name.split(" ") : "Sign In";
}

function openAuth() {
  if (currentUser) {
    if (confirm("Signed in as " + currentUser.name + " (" + currentUser.phone + "). Sign out?")) {
      currentUser = null;
      localStorage.removeItem("ik_user");
      updateAuthUI();
      loadUserBucket();
    }
    return;
  }
  const modal = document.getElementById("authModal");
  if (modal) modal.style.display = "flex";
}

function saveUser() {
  const name = document.getElementById("userName").value.trim();
  const phone = document.getElementById("userPhone").value.trim();
  const island = document.getElementById("userIsland").value.trim();

  if (!name || !phone) {
    alert("Please enter your Name and Phone / Viber number.");
    return;
  }

  currentUser = { name: name, phone: phone, island: island };
  localStorage.setItem("ik_user", JSON.stringify(currentUser));
  document.getElementById("authModal").style.display = "none";
  updateAuthUI();
  loadUserBucket();
}

// 6. CATALOG FILTERING & RENDERING
function setTab(cat, el) {
  activeTab = cat;
  document.querySelectorAll(".tab").forEach(function(t) {
    t.classList.remove("active");
  });
  if (el) el.classList.add("active");
  render();
}

function render() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  const searchEl = document.getElementById("searchInput");
  const q = searchEl ? searchEl.value.toLowerCase().trim() : "";

  const filtered = products.filter(function(p) {
    const matchTab = activeTab === "All" || p.cat === activeTab;
    const matchQuery = p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    return matchTab && matchQuery;
  });

  if (!filtered.length) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#6b7280; padding:24px 0;">No items found.</p>';
    return;
  }

  let html = "";
  filtered.forEach(function(p) {
    const inCart = cart.find(function(c) { return c.code === p.code; });
    const qty = inCart ? inCart.qty : 0;

    let actionHTML = "";
    if (qty > 0) {
      actionHTML =
        '<div class="card-qty">' +
          '<button type="button" onclick="changeQty(\'' + p.code + '\', -1)">-</button>' +
          '<span>' + qty + ' in bucket</span>' +
          '<button type="button" onclick="changeQty(\'' + p.code + '\', 1)">+</button>' +
        '</div>';
    } else {
      actionHTML = '<button type="button" class="plus-btn" onclick="changeQty(\'' + p.code + '\', 1)">+ Pick</button>';
    }

    const pickedClass = qty > 0 ? " picked" : "";
    const pickedBadge = qty > 0 ? '<span class="picked-badge">Picked: ' + qty + '</span>' : "";
    const iconFallback = p.icon || "🧸";

    html +=
      '<div class="card' + pickedClass + '">' +
        '<div class="img-wrap">' +
          '<span class="code-badge">' + p.code + '</span>' +
          pickedBadge +
          '<img src="images/' + p.code + '.jpg" alt="' + p.name + '" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';" />' +
          '<span class="fallback-icon" style="display:none;">' + iconFallback + '</span>' +
        '</div>' +
        '<div class="card-info">' +
          '<div class="title">' + p.name + '</div>' +
          '<div class="price">MVR ' + p.price + '</div>' +
          actionHTML +
        '</div>' +
      '</div>';
  });

  grid.innerHTML = html;
}
// 7. BUCKET MANAGEMENT
function changeQty(code, delta) {
  const item = products.find(function(p) { return p.code === code; });
  if (!item) return;

  const idx = cart.findIndex(function(c) { return c.code === code; });
  if (idx === -1 && delta > 0) {
    cart.push({ code: item.code, name: item.name, cat: item.cat, price: item.price, icon: item.icon, qty: 1 });
  } else if (idx !== -1) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) {
      cart.splice(idx, 1);
    }
  }

  saveUserBucket();
  updateBar();
  render();

  const bucketModal = document.getElementById("bucketModal");
  if (bucketModal && bucketModal.style.display === "flex") {
    openBucket();
  }
}

function updateBar() {
  let count = 0;
  let total = 0;
  cart.forEach(function(item) {
    count += item.qty;
    total += item.price * item.qty;
  });

  const navCount = document.getElementById("navBucketCount");
  if (navCount) navCount.innerText = count;

  const pill = document.getElementById("cartPill");
  if (!pill) return;

  if (count === 0) {
    pill.style.display = "none";
    return;
  }

  pill.style.display = "flex";
  document.getElementById("itemCount").innerText = count + (count > 1 ? " items" : " item");
  document.getElementById("barTotal").innerText = "MVR " + total;
}

function openBucket() {
  const list = document.getElementById("orderList");
  if (list) {
    if (!cart.length) {
      list.innerHTML = '<p style="color:#6b7280; font-size:0.9rem; padding:12px 0;">Your bucket is empty. Tap Browse Items to pick products.</p>';
    } else {
      let listHTML = "";
      cart.forEach(function(i) {
        listHTML +=
          '<div class="order-item">' +
            '<div>' +
              '<strong>[' + i.code + ']</strong> ' + i.name + '<br/>' +
              '<small style="color:#6b7280;">MVR ' + i.price + ' each • Subtotal: MVR ' + (i.price * i.qty) + '</small>' +
            '</div>' +
            '<div class="qty-controls">' +
              '<button type="button" class="qty-btn" onclick="changeQty(\'' + i.code + '\', -1)">-</button>' +
              '<strong>' + i.qty + '</strong>' +
              '<button type="button" class="qty-btn" onclick="changeQty(\'' + i.code + '\', 1)">+</button>' +
            '</div>' +
          '</div>';
      });
      list.innerHTML = listHTML;
    }
  }

  if (currentUser) {
    const nameEl = document.getElementById("custName");
    const islandEl = document.getElementById("custIsland");
    const phoneEl = document.getElementById("custPhone");
    if (nameEl && !nameEl.value) nameEl.value = currentUser.name || "";
    if (islandEl && !islandEl.value) islandEl.value = currentUser.island || "";
    if (phoneEl && !phoneEl.value) phoneEl.value = currentUser.phone || "";
  }

  document.getElementById("bucketModal").style.display = "flex";
}

// 8. CONFIRM PURCHASE -> VIBER
function sendViber() {
  if (!cart.length) {
    alert("Your bucket is empty!");
    return;
  }

  const nameEl = document.getElementById("custName");
  const islandEl = document.getElementById("custIsland");
  const phoneEl = document.getElementById("custPhone");
  const methodEl = document.getElementById("deliveryType");
  const deadlineEl = document.getElementById("deliveryDeadline") || document.getElementById("deliveryNote");

  const name = nameEl ? nameEl.value.trim() : "";
  const island = islandEl ? islandEl.value.trim() : "";
  const phone = phoneEl ? phoneEl.value.trim() : (currentUser ? currentUser.phone : "");
  const method = methodEl ? methodEl.value : "Shop Pickup";
  const deadline = deadlineEl ? deadlineEl.value.trim() : "";

  if (!name || !deadline) {
    alert("Please fill in your Name and Delivery/Pickup Deadline before confirming.");
    return;
  }

  let total = 0;
  let orderLines = "";
  cart.forEach(function(i) {
    const sub = i.price * i.qty;
    total += sub;
    orderLines += "• " + i.qty + "x [" + i.code + "] " + i.name + " — MVR " + sub + "\n";
  });

  const locationPart = island ? " from " + island : "";
  const phonePart = phone ? "\nPhone: " + phone : "";

  const message =
    "Hi, my name is " + name + locationPart + "." + phonePart + "\n\n" +
    "I ordered:\n" + orderLines + "\n" +
    "Total: MVR " + total + "\n" +
    "Method: " + method + "\n" +
    "Deadline: " + deadline + "\n\n" +
    "Thank you!";

    if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message).catch(function() {});
  }

  alert("Order copied! Viber will open now — select Infancy Kids (or paste into our chat) and hit Send.");
  window.location.href = "viber://forward?text=" + encodeURIComponent(message);


// 9. OWNER ADD-ITEM MODE
function openOwnerModal() {
  const pin = prompt("Enter Owner PIN to add items:");
  if (pin !== CONFIG.ownerPin) {
    alert("Incorrect PIN.");
    return;
  }
  document.getElementById("ownerModal").style.display = "flex";
}

function addNewProduct() {
  const code = document.getElementById("newCode").value.trim().toUpperCase();
  const name = document.getElementById("newName").value.trim();
  const cat = document.getElementById("newCat").value;
  const price = Number(document.getElementById("newPrice").value);
  const icon = document.getElementById("newIcon").value.trim() || "🧸";

  if (!code || !name || !price) {
    alert("Please fill in POS Code, Product Name, and Price.");
    return;
  }

  products.unshift({ code: code, name: name, cat: cat, price: price, icon: icon });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

  document.getElementById("newCode").value = "";
  document.getElementById("newName").value = "";
  document.getElementById("newPrice").value = "";
  document.getElementById("ownerModal").style.display = "none";

  render();
  alert(name + " added to Infancy Kids!");
}

// 10. INITIALIZE
updateAuthUI();
loadUserBucket();}