const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

// @GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.getByUser(req.user.id);
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

// @POST /api/wishlist/:productId
const toggleWishlist = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const exists = await Wishlist.isWishlisted(req.user.id, productId);
    if (exists) {
      await Wishlist.remove(req.user.id, productId);
      return res.json({ success: true, message: 'Removed from wishlist', wishlisted: false });
    }
    await Wishlist.add(req.user.id, productId);
    res.json({ success: true, message: 'Added to wishlist', wishlisted: true });
  } catch (err) { next(err); }
};

module.exports = { getWishlist, toggleWishlist };
