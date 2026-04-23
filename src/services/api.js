// ─── Delay helper ───────────────────────────────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Seed data ───────────────────────────────────────────────────────────────
const SEED_PRODUCTS = [
  { id: 1,  title: 'Classic White T-Shirt',  price: 19.99,  description: 'A simple and clean white t-shirt made from 100% cotton. Perfect for everyday wear.',                         category: "men's clothing",   imageUrl: 'https://i.imgur.com/YXofSze.jpeg' },
  { id: 2,  title: 'Slim Fit Jeans',         price: 49.99,  description: 'Modern slim fit jeans in dark blue wash. Comfortable stretch fabric.',                                        category: "men's clothing",   imageUrl: 'https://i.imgur.com/3D5rxiP.jpeg' },
  { id: 3,  title: 'Oversized Hoodie',       price: 39.99,  description: 'Cozy oversized hoodie in grey. Soft fleece interior, kangaroo pocket.',                                       category: "men's clothing",   imageUrl: 'https://i.imgur.com/R2sSZa4.jpeg' },
  { id: 4,  title: 'Floral Summer Dress',    price: 34.99,  description: 'Light floral print dress perfect for summer. Flowy silhouette, midi length.',                                 category: "women's clothing", imageUrl: 'https://i.imgur.com/pkfuHNr.jpeg' },
  { id: 5,  title: 'Cropped Blazer',         price: 69.99,  description: 'Structured cropped blazer in beige. Great for both casual and office looks.',                                 category: "women's clothing", imageUrl: 'https://i.imgur.com/AXgFRL6.jpeg' },
  { id: 6,  title: 'High-Waist Leggings',    price: 24.99,  description: 'Stretchy high-waist leggings with side pockets. Ideal for gym or lounging.',                                 category: "women's clothing", imageUrl: 'https://i.imgur.com/xnZpvPZ.jpeg' },
  { id: 7,  title: 'Leather Belt',           price: 14.99,  description: 'Genuine leather belt with silver buckle. Available in black and brown.',                                      category: 'accessories',      imageUrl: 'https://i.imgur.com/sHjBCdG.jpeg' },
  { id: 8,  title: 'Canvas Tote Bag',        price: 12.99,  description: 'Durable canvas tote bag with inner pocket. Fits everything you need.',                                        category: 'accessories',      imageUrl: 'https://i.imgur.com/R3iobJA.jpeg' },
  { id: 9,  title: 'Running Sneakers',       price: 89.99,  description: 'Lightweight running sneakers with cushioned sole. Breathable mesh upper.',                                    category: 'sport',            imageUrl: 'https://i.imgur.com/qNOjJje.jpeg' },
  { id: 10, title: 'Sports Shorts',          price: 22.99,  description: 'Quick-dry sports shorts with elastic waistband. Great for workouts.',                                         category: 'sport',            imageUrl: 'https://i.imgur.com/1vV4Ugo.jpeg' },
  { id: 11, title: 'Wool Coat',              price: 129.99, description: 'Elegant wool blend coat in camel color. Double-breasted, knee length.',                                       category: "women's clothing", imageUrl: 'https://i.imgur.com/DMQA1Ki.jpeg' },
  { id: 12, title: 'Graphic Tee',            price: 17.99,  description: 'Bold graphic print t-shirt in black. 100% organic cotton.',                                                  category: "men's clothing",   imageUrl: 'https://i.imgur.com/aJGMQQt.jpeg' },
];

// ─── In-memory store ─────────────────────────────────────────────────────────
let _products = [...SEED_PRODUCTS];
let _nextId   = 100;

// ─── Products CRUD ───────────────────────────────────────────────────────────
export async function getProducts() {
  await delay(rand(300, 600));
  return [..._products];
}

export async function getProductById(id) {
  await delay(rand(200, 400));
  const product = _products.find((p) => p.id === Number(id));
  if (!product) throw new Error('Product not found');
  return { ...product };
}

export async function createProduct(data) {
  await delay(rand(500, 900));
  const newProduct = { ...data, id: _nextId++, price: parseFloat(data.price) };
  _products.push(newProduct);
  return { ...newProduct };
}

export async function updateProduct(id, data) {
  await delay(rand(500, 900));
  const index = _products.findIndex((p) => p.id === Number(id));
  if (index === -1) throw new Error('Product not found');
  _products[index] = { ..._products[index], ...data, id: Number(id), price: parseFloat(data.price) };
  return { ..._products[index] };
}

export async function deleteProduct(id) {
  await delay(rand(300, 600));
  const index = _products.findIndex((p) => p.id === Number(id));
  if (index === -1) throw new Error('Product not found');
  _products = _products.filter((p) => p.id !== Number(id));
  removeMyItem(Number(id));
  return true;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getUser()?.role === 'admin';
}

// ─── Favorites ───────────────────────────────────────────────────────────────
export function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(id) {
  const ids  = getFavoriteIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem('favorites', JSON.stringify(next));
  return next;
}

export function isFavorite(id) {
  return getFavoriteIds().includes(id);
}

// ─── My items ────────────────────────────────────────────────────────────────
export function getMyItemIds() {
  try {
    return JSON.parse(localStorage.getItem('myItems') || '[]');
  } catch {
    return [];
  }
}

export function addMyItem(id) {
  const ids = getMyItemIds();
  if (!ids.includes(id)) {
    localStorage.setItem('myItems', JSON.stringify([...ids, id]));
  }
}

export function removeMyItem(id) {
  const ids = getMyItemIds().filter((x) => x !== Number(id));
  localStorage.setItem('myItems', JSON.stringify(ids));
}

export function isMyItem(id) {
  return getMyItemIds().includes(Number(id));
}

// ─── Admin: users mock ───────────────────────────────────────────────────────
export function getAllUsers() {
  try {
    const stored = localStorage.getItem('allUsers');
    if (stored) return JSON.parse(stored);
  } catch {
    // fall through
  }
  const defaults = [
    {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com',
      // пароль хранится в открытом виде — это mock, не продакшн
      password: 'password',
      role: 'admin',
      createdAt: '2024-01-01',
    },
  ];
  localStorage.setItem('allUsers', JSON.stringify(defaults));
  return defaults;
}

export function updateUserRole(userId, role) {
  const users   = getAllUsers();
  const updated = users.map((u) => (u.id === userId ? { ...u, role } : u));
  localStorage.setItem('allUsers', JSON.stringify(updated));

  const current = getUser();
  if (current && current.id === userId) {
    const next = { ...current, role };
    localStorage.setItem('user', JSON.stringify(next));
  }

  return updated;
}

export function deleteUser(userId) {
  const users = getAllUsers().filter((u) => u.id !== userId);
  localStorage.setItem('allUsers', JSON.stringify(users));
  return users;
}

// ─── Auth flow ────────────────────────────────────────────────────────────────
export async function loginUser({ email, password }) {
  await delay(rand(400, 700));

  const users = getAllUsers();
  const found = users.find((u) => u.email === email);

  if (!found) {
    throw new Error('Пользователь с таким email не найден');
  }

  if (found.password !== password) {
    throw new Error('Неверный пароль');
  }

  // возвращаем без поля password
  const { password: _pw, ...userWithoutPassword } = found;
  return userWithoutPassword;
}

export async function registerUser({ name, email, password }) {
  await delay(rand(500, 900));

  if (password.length < 6) {
    throw new Error('Пароль должен быть не менее 6 символов');
  }

  const users = getAllUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error('Email уже зарегистрирован');
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password, // сохраняем пароль чтобы потом войти
    role: 'user',
    createdAt: new Date().toISOString().slice(0, 10),
  };

  users.push(newUser);
  localStorage.setItem('allUsers', JSON.stringify(users));

  // возвращаем без поля password
  const { password: _pw, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}