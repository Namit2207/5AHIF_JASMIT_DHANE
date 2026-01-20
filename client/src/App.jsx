import { useState, useEffect } from "react";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";

export default function App() {
  //  1) Fallback Produkte (damit Shop immer funktioniert)- weil die datenbank noch ned funktioniert
  const localProducts = [
    {
      id: "p1",
      name: "LEGO City Police Station",
      price: 89.99,
      image:
          "https://www.lego.com/cdn/cs/set/assets/blt4a1e324a58b9981e/60246_alt1.png",
    },
    {
      id: "p2",
      name: "LEGO City Fire Truck",
      price: 24.99,
      image:
          "https://www.lego.com/cdn/cs/set/assets/blt912fb5b1a9ad7b7b/60280_alt1.png",
    },
    {
      id: "p3",
      name: "LEGO City Passenger Train",
      price: 149.99,
      image:
          "https://www.lego.com/cdn/cs/set/assets/blt1f4d7e6b7c8e64b5/60197_alt1.png",
    },
  ];

  // 2) Produkte, die angezeigt werden (kommen entweder vom Server oder fallback)
  const [products, setProducts] = useState(localProducts);

  //  3) Warenkorb
  const [cartItems, setCartItems] = useState([]);

  // 4) DB/Backend START
  useEffect(() => {
    async function loadProductsFromServer() {
      try {
        const res = await fetch("/api/products"); // <-- GET Endpoint (Backend)
        if (!res.ok) throw new Error("API not available");
        const serverProducts = await res.json();

        // Wenn Server Produkte liefert, verwenden ich
        if (Array.isArray(serverProducts) && serverProducts.length > 0) {
          // mappen auf ein "einheitliches" Format: id, name, price, image
          const mapped = serverProducts.map((p) => ({
            id: p._id || p.id, // Mongo liefert _id
            name: p.name,
            price: p.price,
            image: p.image,
          }));
          setProducts(mapped);
        }
      } catch (err) {
        // Wenn Backend/DB nicht läuft: egal -> fallback bleibt aktiv
        console.log("Backend noch nicht verfügbar, nutze lokale Produkte.");
      }
    }

    loadProductsFromServer();
  }, []);

  //  5) Titel im Tab: LEGO Store (Anzahl)
  useEffect(() => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    document.title = count === 0 ? "LEGO Store" : `LEGO Store (${count})`;
  }, [cartItems]);

  //6) Add to cart
  function handleAddToCart(product) {
    setCartItems((prevItems) => {
      const existing = prevItems.find((it) => it.product.id === product.id);

      if (existing) {
        return prevItems.map((it) =>
            it.product.id === product.id
                ? { ...it, quantity: it.quantity + 1 }
                : it
        );
      }

      return [...prevItems, { product, quantity: 1 }];
    });
  }

  // 7) Minus 1 (wenn 0 -> entfernen)
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

  //  8) Komplett entfernen
  function handleRemoveAll(productId) {
    setCartItems((prevItems) =>
        prevItems.filter((it) => it.product.id !== productId)
    );
  }

  // 9) Anzahl Items
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  //  10) Gesamtsumme
  const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
  );

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
            {/* Produkte funktionieren immer (fallback oder server) */}
            <ProductList products={products} onAddToCart={handleAddToCart} />
          </div>

          <div id="cart">
            {/*  totalPrice */}
            <Cart
                items={cartItems}
                onRemoveOne={handleRemoveOne}
                onRemoveAll={handleRemoveAll}
                totalPrice={totalPrice}
            />
          </div>
        </main>

        <footer className="footer">LEGO Webshop DHANE</footer>
      </div>
  );
}
