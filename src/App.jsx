import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Toast from './components/Toast.jsx';

// Pages
import Home       from './pages/Home.jsx';
import Login      from './pages/Login.jsx';
import Register   from './pages/Register.jsx';
import NotFound   from './pages/NotFound.jsx';
import Dashboard  from './pages/Dashboard.jsx';
import List       from './pages/Products/List.jsx';
import Details    from './pages/Products/Details.jsx';
import Create     from './pages/Products/Create.jsx';
import Edit       from './pages/Products/Edit.jsx';
import Profile    from './pages/Profile.jsx';
import Favorites  from './pages/Favorites.jsx';
import MyItems    from './pages/MyItems.jsx';
import Admin      from './pages/Admin.jsx';
import Cart       from './pages/Cart.jsx';

export default function App() {
  return (
    <BrowserRouter basename="/onlineShop">
      <Toast />
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/products" element={<List />} />
          <Route path="/products/:id" element={<Details />} />
          <Route path="/cart"     element={<Cart />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route path="/products/create"   element={<Create />} />
            <Route path="/products/:id/edit" element={<Edit />} />
            <Route path="/profile"           element={<Profile />} />
            <Route path="/favorites"         element={<Favorites />} />
            <Route path="/my-items"          element={<MyItems />} />
          </Route>

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}