import Wishlist from "/models/wishlistModel.js";


export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [productId] });
    } else if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
