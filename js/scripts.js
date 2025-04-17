const cart = [];
let currentProduct = null;

function showProductDetails(name, price, description) {
  currentProduct = { name, price, description };
  
  document.getElementById('product-modal-name').textContent = name;
  document.getElementById('product-modal-price').textContent = `$${price}`;
  document.getElementById('product-modal-description').textContent = description;
  
  // Resetear selectores
  document.getElementById('product-size').value = 'M';
  document.getElementById('product-quantity').value = 1;
  
  // Asignar imagen (asumiendo que tiene el mismo nombre que el producto en minúsculas)
  const imageName = name.toLowerCase().replace('ó', 'o') + '.jpg';
  document.getElementById('product-modal-image').src = `assets/img/${imageName}`;
}

function addSelectedToCart() {
  const quantity = parseInt(document.getElementById('product-quantity').value);
  const size = document.getElementById('product-size').value;
  const { name, price } = currentProduct;
  
  for (let i = 0; i < quantity; i++) {
    cart.push({ 
      name, 
      price,
      size,
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    });
  }
  
  renderCart();
  updateCartBadge();
  
  // Cerrar modal de producto
  const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
  modal.hide();
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = '';
  let total = 0;

  // Agrupar productos iguales (mismo nombre, precio y talla)
  const groupedItems = cart.reduce((acc, item) => {
    const key = `${item.name}-${item.price}-${item.size}`;
    if (!acc[key]) {
      acc[key] = { 
        ...item, 
        quantity: 0,
        ids: []
      };
    }
    acc[key].quantity++;
    acc[key].ids.push(item.id);
    return acc;
  }, {});

  // Renderizar cada grupo de productos
  Object.values(groupedItems).forEach(item => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    
    const itemContainer = document.createElement('div');
    itemContainer.className = 'd-flex justify-content-between align-items-center';
    
    // Información del producto (nombre, talla, precio unitario)
    const itemInfo = document.createElement('div');
    itemInfo.className = 'me-3';
    itemInfo.innerHTML = `
      <strong>${item.name}</strong> (Talla: ${item.size})<br>
      <small>$${item.price} c/u</small>
    `;
    
    // Controles de cantidad y eliminación
    const itemActions = document.createElement('div');
    itemActions.className = 'cart-item-actions';
    
    // Botón para disminuir cantidad
    const decreaseBtn = document.createElement('button');
    decreaseBtn.className = 'btn btn-outline-secondary';
    decreaseBtn.innerHTML = '-';
    decreaseBtn.onclick = () => updateCartItemQuantity(item.ids, -1);
    
    // Input de cantidad
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.className = 'form-control quantity-input';
    quantityInput.value = item.quantity;
    quantityInput.min = 1;
    quantityInput.onchange = (e) => {
      const newQuantity = parseInt(e.target.value);
      if (newQuantity > 0) {
        updateCartItemQuantity(item.ids, newQuantity - item.quantity);
      }
    };
    
    // Botón para aumentar cantidad
    const increaseBtn = document.createElement('button');
    increaseBtn.className = 'btn btn-outline-secondary';
    increaseBtn.innerHTML = '+';
    increaseBtn.onclick = () => updateCartItemQuantity(item.ids, 1);
    
    // Botón para eliminar el producto
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-trash';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.onclick = () => removeCartItem(item.ids);
    
    // Subtotal del producto
    const itemSubtotal = document.createElement('div');
    itemSubtotal.className = 'ms-3';
    itemSubtotal.innerHTML = `<strong>$${item.price * item.quantity}</strong>`;
    
    // Construir la estructura
    itemActions.appendChild(decreaseBtn);
    itemActions.appendChild(quantityInput);
    itemActions.appendChild(increaseBtn);
    itemActions.appendChild(deleteBtn);
    
    itemContainer.appendChild(itemInfo);
    itemContainer.appendChild(itemActions);
    itemContainer.appendChild(itemSubtotal);
    
    li.appendChild(itemContainer);
    cartItems.appendChild(li);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = total;
}

function updateCartItemQuantity(itemIds, change) {
  if (change < 0) {
    // Disminuir cantidad - eliminar items
    const toRemove = Math.abs(change);
    for (let i = 0; i < toRemove && itemIds.length > 0; i++) {
      const idToRemove = itemIds.pop();
      const index = cart.findIndex(item => item.id === idToRemove);
      if (index !== -1) {
        cart.splice(index, 1);
      }
    }
  } else if (change > 0) {
    // Aumentar cantidad - agregar items
    const itemToAdd = cart.find(item => item.id === itemIds[0]);
    if (itemToAdd) {
      for (let i = 0; i < change; i++) {
        cart.push({
          ...itemToAdd,
          id: Date.now() + Math.random().toString(36).substr(2, 9)
        });
        itemIds.push(cart[cart.length - 1].id);
      }
    }
  }
  
  renderCart();
  updateCartBadge();
}

function removeCartItem(itemIds) {
  // Eliminar todos los items con los IDs proporcionados
  itemIds.forEach(id => {
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
      cart.splice(index, 1);
    }
  });
  
  renderCart();
  updateCartBadge();
}

function clearCart() {
  if (cart.length === 0) return;
  
  if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
    cart.length = 0;
    renderCart();
    updateCartBadge();
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  badge.textContent = cart.length;
  badge.style.display = cart.length > 0 ? 'inline-block' : 'none';
}

function checkout() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  let message = '¡Hola! Quiero comprar lo siguiente:%0A%0A';
  
  // Agrupar productos para el mensaje (mismo nombre, precio y talla)
  const groupedItems = cart.reduce((acc, item) => {
    const key = `${item.name}-${item.price}-${item.size}`;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: 0 };
    }
    acc[key].quantity++;
    return acc;
  }, {});

  // Construir mensaje con tallas
  Object.values(groupedItems).forEach(item => {
    message += `- ${item.name} (Talla: ${item.size}) x${item.quantity} - $${item.price * item.quantity}%0A`;
  });
  
  // Calcular y mostrar total
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  message += `%0ATotal: $${total}`;
  
  // Enviar por WhatsApp
  const phone = '+584146920733';
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// Inicializar el badge del carrito al cargar la página
document.addEventListener('DOMContentLoaded', updateCartBadge);