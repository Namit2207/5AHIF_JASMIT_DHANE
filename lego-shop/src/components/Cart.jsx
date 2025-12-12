import CartItem from "./CartItem";

export default function Cart({ items, onRemoveOne, onRemoveAll }) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  return (
    <section className="cart-section">
      <h2>Your Shopping Cart</h2>

      {items.length === 0 ? (
        <p>Your cart is empty. Add some LEGO bricks! 😄</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price / piece</th>
                <th>Item total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <CartItem
                  key={item.product.id}
                  item={item}
                  onRemoveOne={onRemoveOne}
                  onRemoveAll={onRemoveAll}
                />
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <span>{totalItems} item(s)</span>
            <span className="cart-total">
              Total: {totalPrice.toFixed(2)} €
            </span>
            <button className="btn-primary">Checkout</button>
          </div>
        </>
      )}
    </section>
  );
}
