export default function CartItem({ item, onRemoveOne, onRemoveAll }) {
  const lineTotal = item.quantity * item.product.price;

  return (
    <tr>
      <td className="cart-item-info">
        <img
          className="cart-item-image"
          src={item.product.image}
          alt={item.product.name}
        />
        <span>{item.product.name}</span>
      </td>
      <td>{item.quantity}</td>
      <td>{item.product.price.toFixed(2)} €</td>
      <td>{lineTotal.toFixed(2)} €</td>
      <td>
        <button className="btn-secondary" onClick={() => onRemoveOne(item.product.id)}>
          -1
        </button>
        <button className="btn-danger" onClick={() => onRemoveAll(item.product.id)}>
          Remove
        </button>
      </td>
    </tr>
  );
}
