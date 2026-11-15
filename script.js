// 1. SHOP CONFIGURATION
const CONFIG = {
  shopPhone: "9609939405", // Digits only — no spaces or dashes!
  shopPhoneDisplay: "+960 993-9405",
  ig: "https://www.instagram.com/infancykidz?rpxt=Nnl6N2E5dHhzemtr",
  fb: "https://www.facebook.com/share/1dBooBQhTj/",
  ownerPin: "1234",
  tgBotToken: "PASTE_YOUR_BOTFATHER_TOKEN_HERE",
  tgChatId: "PASTE_DADS_CHAT_ID_HERE"
};

const igEl = document.getElementById("igLink");
const fbEl = document.getElementById("fbLink");
if (igEl) igEl.href = CONFIG.ig;
if (fbEl) fbEl.href = CONFIG.fb;
if (document.getElementById("displayShopPhone")) {
  document.getElementById("displayShopPhone").innerText = CONFIG.shopPhoneDisplay;
}

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
const STORAGE_KEY = "ik_mpos_v3";
let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_PRODUCTS;
let currentUser = JSON.parse(localStorage.getItem("ik_user")) || null;
let activeTab = "All";
let cart = [];
let pendingViberMessage = "";

function getUserSuffix() {
  return currentUser && currentUser.phone ? currentUser.phone : "guest";
}

function loadUserData() {
  cart = JSON.parse(localStorage.getItem("ik_bucket_" + getUserSuffix())) || [];
  updateBar();
  render();
  renderOrders();
}

function saveUserBucket() {
  localStorage.setItem("ik_bucket_" + getUserSuffix(), JSON.stringify(cart));
}

function getSavedOrders() {
  return JSON.parse(localStorage.getItem("ik_orders_" + getUserSuffix())) || [];
}

function saveOrderRecord(orderObj) {
  const orders = getSavedOrders();
  orders.unshift(orderObj);
  localStorage.setItem("ik_orders_" + getUserSuffix(), JSON.stringify(orders));
  renderOrders();
}

// 4. THREE-PAGE NAVIGATION
function switchPage(page) {
  document.getElementById("pageHome").style.display = page === "home" ? "block" : "none";
  document.getElementById("pageShop").style.display = page === "shop" ? "block" : "none";
  document.getElementById("pageOrders").style.display = page === "orders" ? "block" : "none";

  document.getElementById("navHome").classList.toggle("active", page === "home");
  document.getElementById("navShop").classList.toggle("active", page === "shop");
  document.getElementById("navOrders").classList.toggle("active", page === "orders");

  if (page === "shop") render();
  if (page === "orders") renderOrders();
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
      loadUserData();
    }
    return;
  }
  document.getElementById("authModal").style.display = "flex";
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
  loadUserData();
}
// 6. CATALOG FILTERING & RENDERING
function setTab(cat, el) {
  activeTab = cat;
  document.querySelectorAll(".tab").forEach(function(t) { t.classList.remove("active"); });
  if (el) el.classList.add("active");
  render();
}

function render() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  const q = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
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

    const actionHTML = qty > 0
      ? '<div class="card-qty">' +
          '<button type="button" onclick="changeQty(\'' + p.code + '\', -1)">-</button>' +
          '<span>' + qty + ' in bucket</span>' +
          '<button type="button" onclick="changeQty(\'' + p.code + '\', 1)">+</button>' +
        '</div>'
      : '<button type="button" class="plus-btn" onclick="changeQty(\'' + p.code + '\', 1)">+ Pick</button>';

    html +=
      '<div class="card' + (qty > 0 ? " picked" : "") + '">' +
        '<div class="img-wrap">' +
          '<span class="code-badge">' + p.code + '</span>' +
          (qty > 0 ? '<span class="picked-badge">Picked: ' + qty + '</span>' : "") +
          '<img src="images/' + p.code + '.jpg" alt="' + p.name + '" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';" />' +
          '<span class="fallback-icon" style="display:none;">' + (p.icon || "🧸") + '</span>' +
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
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
  }

  saveUserBucket();
  updateBar();
  render();
  if (document.getElementById("bucketModal").style.display === "flex") openBucket();
}

function updateBar() {
  let count = 0;
  let total = 0;
  cart.forEach(function(item) {
    count += item.qty;
    total += item.price * item.qty;
  });

  document.getElementById("navBucketCount").innerText = count;
  const pill = document.getElementById("cartPill");
  if (!count) {
    pill.style.display = "none";
    return;
  }
  pill.style.display = "flex";
  document.getElementById("itemCount").innerText = count + (count > 1 ? " items" : " item");
  document.getElementById("barTotal").innerText = "MVR " + total;
}

function openBucket() {
  const list = document.getElementById("orderList");
  if (!cart.length) {
    list.innerHTML = '<p style="color:#6b7280; font-size:0.9rem; padding:12px 0;">Your bucket is empty.</p>';
  } else {
    let listHTML = "";
    cart.forEach(function(i) {
      listHTML +=
        '<div class="order-item">' +
          '<div><strong>[' + i.code + ']</strong> ' + i.name + '<br/>' +
          '<small style="color:#6b7280;">MVR ' + i.price + ' each • Subtotal: MVR ' + (i.price * i.qty) + '</small></div>' +
          '<div class="qty-controls">' +
            '<button type="button" class="qty-btn" onclick="changeQty(\'' + i.code + '\', -1)">-</button>' +
            '<strong>' + i.qty + '</strong>' +
            '<button type="button" class="qty-btn" onclick="changeQty(\'' + i.code + '\', 1)">+</button>' +
          '</div>' +
        '</div>';
    });
    list.innerHTML = listHTML;
  }

  if (currentUser) {
    if (!document.getElementById("custName").value) document.getElementById("custName").value = currentUser.name || "";
    if (!document.getElementById("custPhone").value) document.getElementById("custPhone").value = currentUser.phone || "";
    if (!document.getElementById("custIsland").value) document.getElementById("custIsland").value = currentUser.island || "";
  }

  document.getElementById("bucketModal").style.display = "flex";
}
// 8. THREE-CHANNEL CHECKOUT WITH CONFIRMATION GUARD
function checkoutOption(channel) {
  if (!cart.length) {
    alert("Your bucket is empty!");
    return;
  }

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const island = document.getElementById("custIsland").value.trim();
  const method = document.getElementById("deliveryType").value;
  const deadline = document.getElementById("deliveryDeadline").value.trim();

  if (!name || !phone || !island || !deadline) {
    alert("Please fill in your Name, Phone Number, Atoll & Island, and Deadline.");
    return;
  }

  let total = 0;
  let count = 0;
  let orderLines = "";
  let summaryItems = [];
  cart.forEach(function(i) {
    const sub = i.price * i.qty;
    total += sub;
    count += i.qty;
    orderLines += "• " + i.qty + "x [" + i.code + "] " + i.name + " (MVR " + sub + ")\n";
    summaryItems.push(i.qty + "x " + i.name);
  });

  const confirmMsg =
    "CONFIRM ORDER?\n\n" +
    "Items: " + count + " item(s)\n" +
    "Total: MVR " + total + "\n" +
    "Method: " + method + "\n" +
    "Send via: " + channel.toUpperCase() + "\n\n" +
    "Press OK to send order, or Cancel to go back.";

  if (!confirm(confirmMsg)) {
    return;
  }

  const message =
    "Hi, my name is " + name + " from " + island + ".\n" +
    "Phone: " + phone + "\n\n" +
    "I ordered:\n" + orderLines + "\n" +
    "Total: MVR " + total + "\n" +
    "Method: " + method + "\n" +
    "Deadline: " + deadline + "\n\n" +
    "Thank you!";

  const orderRecord = {
    id: "IK-" + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toLocaleDateString(),
    custName: name,
    custPhone: phone,
    custIsland: island,
    items: summaryItems.join(", "),
    total: total,
    method: method,
    deadline: deadline,
    channel: channel.toUpperCase(),
    status: "process"
  };

  if (channel === "telegram") {
    const tgUrl = "https://telegram.org" + CONFIG.tgBotToken + "/sendMessage";
    fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CONFIG.tgChatId,
        text: "🛍️ NEW TELEGRAM ORDER (" + orderRecord.id + ")\n\n" + message
      })
    })
    .then(function(res) {
      if (!res.ok) throw new Error("Telegram failed");
      finalizeOrder(orderRecord);
      alert("✅ Order " + orderRecord.id + " Sent! If this was accidental, go to '3. My Orders' and tap Cancel Order immediately.");
    })
    .catch(function() {
      alert("Could not reach Telegram right now—please choose WhatsApp or Viber instead.");
    });
  }

      if (channel === "whatsapp") {
    finalizeOrder(orderRecord);
    window.location.href = "https://wa.me" + CONFIG.shopPhone + "?text=" + encodeURIComponent(message);
      }
  

  if (channel === "viber") {
    pendingViberMessage = message;
    finalizeOrder(orderRecord);
    document.getElementById("bucketModal").style.display = "none";
    document.getElementById("viberSaveModal").style.display = "flex";
  }
}

function finalizeOrder(orderRecord) {
  saveOrderRecord(orderRecord);
  cart = [];
  saveUserBucket();
  updateBar();
  render();
  document.getElementById("bucketModal").style.display = "none";
}

function copyShopPhone() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText("+" + CONFIG.shopPhone);
    alert("Copied +" + CONFIG.shopPhone + " to clipboard!");
  }
}

function proceedToViber() {
  document.getElementById("viberSaveModal").style.display = "none";

  // 1. Copy the full formatted order message to clipboard automatically
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(pendingViberMessage).catch(function() {});
  }

  // 2. Open Viber directly to the "Add Contact" screen with your dad's number pre-filled
  window.location.href = "viber://contact?number=%2B" + CONFIG.shopPhone;
}

// 9. MY ORDERS TRACKER (IN PROCESS, CANCEL/REVERSE, RECEIVED & REMOVE)
function renderOrders() {
  const processBox = document.getElementById("ordersInProcess");
  const receivedBox = document.getElementById("ordersReceived");
  const cancelledBox = document.getElementById("ordersCancelled");
  if (!processBox || !receivedBox) return;

  const orders = getSavedOrders();
  const inProcess = orders.filter(function(o) { return o.status === "process"; });
  const received = orders.filter(function(o) { return o.status === "received"; });
  const cancelled = orders.filter(function(o) { return o.status === "cancelled"; });

  if (!inProcess.length) {
    processBox.innerHTML = '<div class="info-card"><p>No orders currently in process.</p></div>';
  } else {
    let html = "";
    inProcess.forEach(function(o) {
      html +=
        '<div class="info-card" style="margin-bottom:10px; border-left:4px solid #f97316;">' +
          '<div style="display:flex; justify-content:space-between; margin-bottom:4px;">' +
            '<strong>' + o.id + ' • MVR ' + o.total + '</strong>' +
            '<span style="font-size:0.72rem; background:#fff7ed; color:#ea580c; padding:2px 8px; border-radius:999px; font-weight:700;">In Process (' + o.channel + ')</span>' +
          '</div>' +
          '<p style="margin-bottom:6px;">' + o.items + '</p>' +
          '<p style="font-size:0.78rem; margin-bottom:10px;"><strong>Delivery:</strong> ' + o.method + ' • <strong>Deadline:</strong> ' + o.deadline + '</p>' +
          '<div style="display:flex; flex-wrap:wrap; gap:8px;">' +
            '<button type="button" class="pill-btn orange-outline" onclick="markOrderReceived(\'' + o.id + '\')">✅ Mark Received</button>' +
            '<button type="button" class="pill-btn" style="color:#dc2626; background:#fef2f2;" onclick="cancelAndReverseOrder(\'' + o.id + '\')">❌ Cancel / Reverse Order</button>' +
          '</div>' +
        '</div>';
    });
    processBox.innerHTML = html;
  }

  if (!received.length) {
    receivedBox.innerHTML = '<div class="info-card"><p>No received orders yet.</p></div>';
  } else {
    let html = "";
    received.forEach(function(o) {
      html +=
        '<div class="info-card" style="margin-bottom:10px;">' +
          '<div style="display:flex; justify-content:space-between; margin-bottom:4px;">' +
            '<strong>' + o.id + ' • MVR ' + o.total + '</strong>' +
            '<span style="font-size:0.72rem; background:#dcfce7; color:#16a34a; padding:2px 8px; border-radius:999px; font-weight:700;">Received</span>' +
          '</div>' +
          '<p style="margin-bottom:8px;">' + o.items + '</p>' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<small style="color:#6b7280;">Ordered on ' + o.date + '</small>' +
            '<button type="button" class="pill-btn" style="color:#dc2626; background:#fef2f2;" onclick="deleteSingleOrder(\'' + o.id + '\')">Remove</button>' +
          '</div>' +
        '</div>';
    });
    receivedBox.innerHTML = html;
  }

  if (cancelledBox) {
    if (!cancelled.length) {
      cancelledBox.innerHTML = '<div class="info-card"><p>No cancelled orders.</p></div>';
    } else {
      let html = "";
      cancelled.forEach(function(o) {
        html +=
          '<div class="info-card" style="margin-bottom:10px; opacity:0.75;">' +
            '<div style="display:flex; justify-content:space-between; margin-bottom:4px;">' +
              '<strong>' + o.id + ' • MVR ' + o.total + '</strong>' +
              '<span style="font-size:0.72rem; background:#fef2f2; color:#dc2626; padding:2px 8px; border-radius:999px; font-weight:700;">Cancelled</span>' +
            '</div>' +
            '<p style="margin-bottom:8px;">' + o.items + '</p>' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<small style="color:#6b7280;">Reversed on ' + o.date + '</small>' +
              '<button type="button" class="pill-btn" style="color:#dc2626; background:#fef2f2;" onclick="deleteSingleOrder(\'' + o.id + '\')">Remove</button>' +
            '</div>' +
          '</div>';
      });
      cancelledBox.innerHTML = html;
    }
  }
}

function cancelAndReverseOrder(orderId) {
  const orders = getSavedOrders();
  const target = orders.find(function(o) { return o.id === orderId; });
  if (!target) return;

  if (!confirm("Cancel & reverse Order " + orderId + " (MVR " + target.total + ")? Do NOT make a BML transfer if you cancel.")) {
    return;
  }

  target.status = "cancelled";
  localStorage.setItem("ik_orders_" + getUserSuffix(), JSON.stringify(orders));
  renderOrders();

  const cancelText =
    "❌ ORDER CANCELLED / REVERSED — INFANCY KIDZ\n\n" +
    "Order ID: " + target.id + "\n" +
    "Customer: " + (target.custName || "Customer") + " (" + (target.custPhone || "") + ")\n" +
    "Items: " + target.items + "\n" +
    "Total: MVR " + target.total + "\n\n" +
    "Please DO NOT pack or dispatch this order.";

  if (target.channel === "TELEGRAM" && CONFIG.tgBotToken !== "PASTE_YOUR_BOTFATHER_TOKEN_HERE") {
    fetch("https://telegram.org" + CONFIG.tgBotToken + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CONFIG.tgChatId, text: cancelText })
    }).catch(function() {});
    alert("Order " + orderId + " has been cancelled and Infancy Kidz was notified automatically.");
  } else if (target.channel === "WHATSAPP") {
    window.location.href = "https://wa.me" + CONFIG.shopPhone + "?text=" + encodeURIComponent(cancelText);
  } else {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cancelText).catch(function() {});
    }
    alert("Order " + orderId + " marked as Cancelled! A cancellation notice was copied—please paste it in Viber if you already sent the order message.");
  }
}

function markOrderReceived(orderId) {
  const orders = getSavedOrders();
  const target = orders.find(function(o) { return o.id === orderId; });
  if (target) {
    target.status = "received";
    localStorage.setItem("ik_orders_" + getUserSuffix(), JSON.stringify(orders));
    renderOrders();
  }
}

function deleteSingleOrder(orderId) {
  if (!confirm("Remove order " + orderId + " from your list?")) return;
  const updated = getSavedOrders().filter(function(o) { return o.id !== orderId; });
  localStorage.setItem("ik_orders_" + getUserSuffix(), JSON.stringify(updated));
  renderOrders();
}

function clearOrderHistory() {
  if (!getSavedOrders().length) return alert("Your order history is already empty.");
  if (!confirm("Clear all your order history?")) return;
  localStorage.removeItem("ik_orders_" + getUserSuffix());
  renderOrders();
}

// 10. OWNER ADD-ITEM MODE
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
  alert(name + " added to Infancy Kidz!");
}

// 11. INITIALIZE
updateAuthUI();
loadUserData();
