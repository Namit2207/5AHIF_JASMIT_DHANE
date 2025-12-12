export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="card">
      <img className="card-image" src={product.image} alt={product.name} />
      <h3 className="card-title">{product.name}</h3>
      <p className="card-price">{product.price.toFixed(2)} €</p>
      <button className="btn-primary" onClick={() => onAddToCart(product)}>
        Add to cart
      </button>
    </div>
  );
}
