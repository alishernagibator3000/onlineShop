export function validateLogin({ email, password }) {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export function validateRegister({ name, email, password }) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
}

export function validateProduct({ title, price, description, category }) {
  const errors = {};
  if (!title || title.trim().length < 2) errors.title = 'Title must be at least 2 characters';
  if (price === '' || price === undefined) errors.price = 'Price is required';
  else if (isNaN(price) || Number(price) < 0) errors.price = 'Price must be a positive number';
  if (!description || description.trim().length < 10) errors.description = 'Description must be at least 10 characters';
  if (!category || category.trim().length < 2) errors.category = 'Category is required';
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}