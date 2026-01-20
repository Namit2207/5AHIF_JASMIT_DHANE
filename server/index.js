import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --------------------
// 1) MongoDB verbinden
// --------------------
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(" MongoDB error:", err));

// --------------------
// 2) Models
// --------------------
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

async function getOrCreateCart() {
    let cart = await Cart.findOne();
    if (!cart) cart = await Cart.create({ items: [] });
    return cart;
}

// --------------------
// 3) Routes
// --------------------
app.get("/", (req, res) => {
    res.send("LEGO Server läuft");
});

// GET Produkte
app.get("/api/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// POST: Demo-Produkte in DB schreiben
app.post("/api/seed", async (req, res) => {
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
    res.json({ message: "Seed done", inserted });
});

// GET Warenkorb (mit Produktdaten)
app.get("/api/cart", async (req, res) => {
    const cart = await getOrCreateCart();
    const fullCart = await Cart.findById(cart._id).populate("items.productId");
    res.json(fullCart);
});

// POST add to cart { productId }
app.post("/api/cart/add", async (req, res) => {
    const { productId } = req.body;

    const cart = await getOrCreateCart();
    const existing = cart.items.find((it) => it.productId.toString() === productId);

    if (existing) existing.quantity += 1;
    else cart.items.push({ productId, quantity: 1 });

    await cart.save();

    const fullCart = await Cart.findById(cart._id).populate("items.productId");
    res.json(fullCart);
});

// POST remove one { productId }
app.post("/api/cart/remove", async (req, res) => {
    const { productId } = req.body;

    const cart = await getOrCreateCart();
    const existing = cart.items.find((it) => it.productId.toString() === productId);

    if (existing) {
        existing.quantity -= 1;
        if (existing.quantity <= 0) {
            cart.items = cart.items.filter((it) => it.productId.toString() !== productId);
        }
    }

    await cart.save();

    const fullCart = await Cart.findById(cart._id).populate("items.productId");
    res.json(fullCart);
});

// --------------------
// 4) Start
// --------------------
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server: http://localhost:${port}`));
