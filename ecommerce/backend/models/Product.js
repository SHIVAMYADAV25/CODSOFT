const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['lighting', 'kitchen', 'textiles', 'home-decor', 'stationery', 'furniture', 'electronics'],
    },
    brand: String,
    images: [String],
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    tags: [String],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    reviews: [reviewSchema],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
    },
  },
  { timestamps: true }
);

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });

// Update rating when review is added
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = { average: 0, count: 0 };
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = {
      average: Math.round((total / this.reviews.length) * 10) / 10,
      count: this.reviews.length,
    };
  }
};

// Discount percentage virtual
productSchema.virtual('discountPercent').get(function () {
  if (!this.originalPrice) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
