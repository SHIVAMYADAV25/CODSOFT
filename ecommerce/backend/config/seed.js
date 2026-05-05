require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const products = [
  {
    name: 'Minimal Oak Desk Lamp',
    slug: 'minimal-oak-desk-lamp',
    description: 'Handcrafted oak base with warm-tone LED. Perfect for late-night sessions.',
    price: 89.99,
    originalPrice: 120.00,
    category: 'lighting',
    brand: 'Luminos',
    stock: 45,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'],
    tags: ['desk', 'lamp', 'minimal', 'oak'],
    rating: { average: 4.7, count: 128 },
    featured: true,
  },
  {
    name: 'Ceramic Pour-Over Set',
    slug: 'ceramic-pour-over-set',
    description: 'Hand-thrown ceramic dripper + carafe. Brews clarity and ritual into every cup.',
    price: 64.00,
    originalPrice: null,
    category: 'kitchen',
    brand: 'BrewCraft',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'],
    tags: ['coffee', 'ceramic', 'pour-over', 'kitchen'],
    rating: { average: 4.9, count: 214 },
    featured: true,
  },
  {
    name: 'Merino Wool Throw',
    slug: 'merino-wool-throw',
    description: '100% ethically-sourced merino. Lightweight yet incredibly warm.',
    price: 148.00,
    originalPrice: 185.00,
    category: 'textiles',
    brand: 'WoolCo',
    stock: 18,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
    tags: ['wool', 'throw', 'blanket', 'cozy'],
    rating: { average: 4.8, count: 89 },
    featured: false,
  },
  {
    name: 'Brass Incense Holder',
    slug: 'brass-incense-holder',
    description: 'Solid brass, gently oxidized. Holds both stick and cone incense.',
    price: 32.00,
    originalPrice: null,
    category: 'home-decor',
    brand: 'Aether',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1601295198397-3e4e8e1e5e9f?w=600'],
    tags: ['brass', 'incense', 'decor', 'home'],
    rating: { average: 4.6, count: 312 },
    featured: false,
  },
  {
    name: 'Linen Apron',
    slug: 'linen-apron',
    description: 'Stonewashed Belgian linen with double-stitched pockets. For serious cooks.',
    price: 58.00,
    originalPrice: null,
    category: 'kitchen',
    brand: 'Tablier',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'],
    tags: ['linen', 'apron', 'kitchen', 'cooking'],
    rating: { average: 4.5, count: 67 },
    featured: false,
  },
  {
    name: 'Walnut Cutting Board',
    slug: 'walnut-cutting-board',
    description: 'End-grain American black walnut. Each board uniquely grained.',
    price: 95.00,
    originalPrice: 110.00,
    category: 'kitchen',
    brand: 'GrainWood',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'],
    tags: ['walnut', 'cutting board', 'kitchen', 'wood'],
    rating: { average: 4.9, count: 445 },
    featured: true,
  },
  {
    name: 'Wabi-Sabi Vase Set',
    slug: 'wabi-sabi-vase-set',
    description: 'Set of 3 irregular stoneware vases. Celebrates imperfection.',
    price: 76.00,
    originalPrice: null,
    category: 'home-decor',
    brand: 'Earthen',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=600'],
    tags: ['vase', 'stoneware', 'decor', 'set'],
    rating: { average: 4.7, count: 156 },
    featured: true,
  },
  {
    name: 'Mechanical Pencil Set',
    slug: 'mechanical-pencil-set',
    description: 'Set of 3 drafting-grade mechanical pencils. Timeless brass construction.',
    price: 42.00,
    originalPrice: null,
    category: 'stationery',
    brand: 'Drafthouse',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600'],
    tags: ['pencil', 'stationery', 'brass', 'drafting'],
    rating: { average: 4.6, count: 203 },
    featured: false,
  },
];

const seedDB = async () => {
  await connectDB();

  try {
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@shop.com',
      password: hashedPassword,
      role: 'admin',
    });

    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: userPassword,
      role: 'user',
    });

    // Seed products
    await Product.insertMany(products);

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin: admin@shop.com / admin123');
    console.log('👤 User: jane@example.com / user123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedDB();
