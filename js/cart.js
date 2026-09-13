// ==========================================================================
// MedLink — cart.js
// A simple client-side cart, stored in localStorage, keyed to the logged-in
// user so different accounts on the same browser don't share a cart.
// Load this before any page-specific script that adds to or reads the cart.
// ==========================================================================

function cartKey() {
  const user = getUser();
  return `medlink-cart-${user ? user.id : 'guest'}`;
}

function getCart() {
  const raw = localStorage.getItem(cartKey());
  return raw ? JSON.parse(raw) : [];
}

function saveCart(items) {
  localStorage.setItem(cartKey(), JSON.stringify(items));
}

function addToCart(medicine, quantity) {
  const items = getCart();
  const existing = items.find(i => i.medicineId === medicine.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      medicineId: medicine.id,
      name: medicine.name,
      manufacturer: medicine.manufacturer,
      price: Number(medicine.price),
      distributorName: medicine.distributor ? medicine.distributor.businessName : '',
      quantity,
    });
  }

  saveCart(items);
}

function updateCartQuantity(medicineId, quantity) {
  const items = getCart();
  const item = items.find(i => i.medicineId === medicineId);
  if (!item) return;

  if (quantity <= 0) {
    saveCart(items.filter(i => i.medicineId !== medicineId));
  } else {
    item.quantity = quantity;
    saveCart(items);
  }
}

function removeFromCart(medicineId) {
  saveCart(getCart().filter(i => i.medicineId !== medicineId));
}

function clearCart() {
  saveCart([]);
}

function cartTotal(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
