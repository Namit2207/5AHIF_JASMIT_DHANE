import ProductCard from "./ProductCard";

export default function ProductList({ products, onAddToCart }) {
  return (
    <section className="product-section">
      <h2>Product Overview</h2>
      <div className="card-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
