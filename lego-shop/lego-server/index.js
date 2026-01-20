import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1) MongoDB verbinden
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log(" MongoDB connected"))
    .catch((err) => console.log("❌ MongoDB error:", err.message));

// 2) Models (einfach gehalten)
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
});

const Product = mongoose.model("Product", productSchema);

const cartSchema = new mongoose.Schema({
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            quantity: Number,
        },
    ],
});

const Cart = mongoose.model("Cart", cartSchema);

// Hilfsfunktion: wir verwenden EINE Cart-Collection mit einem einzigen Cart-Dokument
async function getOrCreateCart() {
    let cart = await Cart.findOne();
    if (!cart) {
        cart = await Cart.create({ items: [] });
    }
    return cart;
}

// 3) ROUTES / ENDPOINTS

// Test-Route (optional)
app.get("/", (req, res) => {
    res.send("LEGO Server läuft git rm -r --cached lego-shop/node_modules\n" +
        "git rm -r --cached lego-server/node_modules\n");
});

// GET Produkte
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error loading products", error: err.message });
    }
});

// POST Seed (einmalig, um Produkte in DB zu speichern)
app.post("/api/seed", async (req, res) => {
    try {
        await Product.deleteMany();

        const demoProducts = [
            {
                name: "City Police Station",
                price: 89.99,
                image:
                    "https://www.lego.com/cdn/cs/set/assets/blt4a1e324a58b9981e/60246_alt1.png",
            },
            {
                name: "City Fire Truck",
                price: 24.99,
                image:
                    "https://www.lego.com/cdn/cs/set/assets/blt912fb5b1a9ad7b7b/60280_alt1.png",
            },
            {
                name: "City Passenger Train",
                price: 149.99,
                image:
                    "https://www.lego.com/cdn/cs/set/assets/blt1f4d7e6b7c8e64b5/60197_alt1.png",
            },
        ];

        const inserted = await Product.insertMany(demoProducts);
        res.json({ message: "Seed done ", inserted });
    } catch (err) {
        res.status(500).json({ message: "Seed failed", error: err.message });
    }
});

// GET Warenkorb (mit Produktinfos via populate)
app.get("/api/cart", async (req, res) => {
    try {
        const cart = await getOrCreateCart();
        const populatedCart = await cart.populate("items.productId");
        res.json(populatedCart);
    } catch (err) {
        res.status(500).json({ message: "Error loading cart", error: err.message });
    }
});

// POST add to cart { productId }
app.post("/api/cart/add", async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "productId is missing" });
        }

        const cart = await getOrCreateCart();

        const existing = cart.items.find(
            (it) => it.productId.toString() === productId
        );

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.items.push({ productId, quantity: 1 });
        }

        await cart.save();
        const populatedCart = await cart.populate("items.productId");
        res.json(populatedCart);
    } catch (err) {
        res.status(500).json({ message: "Error adding to cart", error: err.message });
    }
});

// POST remove one { productId }
app.post("/api/cart/remove", async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "productId is missing" });
        }

        const cart = await getOrCreateCart();

        const existing = cart.items.find(
            (it) => it.productId.toString() === productId
        );

        if (existing) {
            existing.quantity -= 1;

            if (existing.quantity <= 0) {
                cart.items = cart.items.filter(
                    (it) => it.productId.toString() !== productId
                );
            }
        }

        await cart.save();
        const populatedCart = await cart.populate("items.productId");
        res.json(populatedCart);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error removing from cart", error: err.message });
    }
});

// 4) Server starten
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(` Server running on http://localhost:${port}`);
});
