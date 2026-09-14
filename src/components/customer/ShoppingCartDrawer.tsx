import type { CartItem } from '../../types';
import { resolveAssetUrl } from '../../config';

interface ShoppingCartDrawerProps {
  cartItems: CartItem[];
  onClose: () => void;
  onContinueShopping: () => void;
  onRemoveItem: (key: string) => void;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onViewCart: () => void;
  onCheckout: () => void;
}

const itemKey = (item: CartItem) => `${item.product.id}:${item.variation?.id || 'default'}`;
const itemPrice = (item: CartItem) => Number(item.variation?.salePrice || item.variation?.price || item.product.salePrice || item.product.price);

const LegacyShoppingCartDrawer = ({ cartItems, onClose, onContinueShopping, onRemoveItem, onUpdateQuantity }: ShoppingCartDrawerProps) => (
  <div className="shopping-cart-overlay" role="dialog" aria-modal="true" aria-label="Shopping Cart">
    <button className="shopping-cart-backdrop" type="button" aria-label="Close shopping cart" onClick={onClose} />
    <aside className="shopping-cart-drawer">
      <header><h2>Shopping Cart</h2><button type="button" aria-label="Close" onClick={onClose}>×</button></header>
      <div className="shopping-cart-content">
        {!cartItems.length ? <p>No products in the cart.</p> : cartItems.map((item) => {
          const key = itemKey(item);
          return <article className="shopping-cart-item" key={key}>
            <div><strong>{item.product.name}</strong><span>₹{itemPrice(item) * item.quantity}</span></div>
            <div className="shopping-cart-controls"><button type="button" onClick={() => onUpdateQuantity(key, item.quantity - 1)}>−</button><b>{item.quantity}</b><button type="button" onClick={() => onUpdateQuantity(key, item.quantity + 1)}>+</button><button className="remove" type="button" onClick={() => onRemoveItem(key)}>Remove</button></div>
          </article>;
        })}
      </div>
      <footer><button type="button" onClick={onContinueShopping}>CONTINUE SHOPPING</button></footer>
    </aside>
  </div>
);

const itemVariation = (item: CartItem) => Object.values(item.variation?.attributes || {}).filter(Boolean).join(' / ') || item.variation?.title || '';

const ShoppingCartDrawer = ({ cartItems, onClose, onRemoveItem, onViewCart, onCheckout }: ShoppingCartDrawerProps) => {
  const subtotal = cartItems.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);
  return <div className="shopping-cart-overlay" role="dialog" aria-modal="true" aria-label="Shopping Cart">
    <button className="shopping-cart-backdrop" type="button" aria-label="Close shopping cart" onClick={onClose} />
    <aside className="shopping-cart-drawer marketplace-cart-drawer">
      <header><h2>Shopping Cart</h2><button type="button" aria-label="Close" onClick={onClose}>×</button></header>
      <div className="shopping-cart-content">
        {!cartItems.length ? <p>No products in the cart.</p> : cartItems.map((item) => {
          const key = itemKey(item);
          const image = resolveAssetUrl(item.product.imageUrl);
          const label = itemVariation(item);
          return <article className="marketplace-cart-item" key={key}>
            <button type="button" className="marketplace-cart-remove" aria-label={`Remove ${item.product.name}`} onClick={() => onRemoveItem(key)}>×</button>
            <div className="marketplace-cart-image">{image ? <img src={image} alt="" /> : null}</div>
            <div><strong>{item.product.name}{label ? ` - ${label}` : ''}</strong><p>Store:</p><b>{item.product.vendor?.storeName || 'Store unavailable'}</b><span>{item.quantity} × ₹{itemPrice(item).toFixed(2)}</span></div>
          </article>;
        })}
      </div>
      {cartItems.length ? <footer className="marketplace-cart-footer"><p><span>Subtotal:</span><b>₹{subtotal.toFixed(2)}</b></p><button type="button" className="view-cart" onClick={onViewCart}>VIEW CART</button><button type="button" onClick={onCheckout}>CHECKOUT</button></footer> : <footer><button type="button" onClick={onClose}>CONTINUE SHOPPING</button></footer>}
    </aside>
  </div>;
};

export default ShoppingCartDrawer;
