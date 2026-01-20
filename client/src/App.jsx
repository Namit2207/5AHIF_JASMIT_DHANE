import { useState, useEffect } from "react";
import { products } from "./data/products";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";

export default function App() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (count === 0) {
      document.title = "LEGO Store";
    } else {
      document.title = `LEGO Store (${count})`;
    }
  }, [cartItems]);

  function handleAddToCart(product) {
    setCartItems((prevItems) => {
      const existing = prevItems.find((it) => it.product.id === product.id);
      if (existing) {
        return prevItems.map((it) =>
          it.product.id === product.id
            ? { ...it, quantity: it.quantity + 1 }
            : it
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  }

  function handleRemoveOne(productId) {
    setCartItems((prevItems) => {
      return prevItems
        .map((it) =>
          it.product.id === productId
            ? { ...it, quantity: it.quantity - 1 }
            : it
        )
        .filter((it) => it.quantity > 0);
    });
  }

  function handleRemoveAll(productId) {
    setCartItems((prevItems) =>
      prevItems.filter((it) => it.product.id !== productId)
    );
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="logo-area">
          <div className="lego-square">LEGO</div>
          <span className="store-title">Store</span>
        </div>

        <nav className="nav">
          <a href="#products">Products</a>
          <a href="#cart">
            Cart <span className="cart-badge">{cartCount}</span>
          </a>
        </nav>
      </header>

      <main>
        <div id="products">
          <ProductList products={products} onAddToCart={handleAddToCart} />
        </div>

        <div id="cart">
          <Cart
            items={cartItems}
            onRemoveOne={handleRemoveOne}
            onRemoveAll={handleRemoveAll}
          />
        </div>
      </main>

      <footer className="footer">
        LEGO Webshop DHANE
      </footer>
    </div>
  );
}
