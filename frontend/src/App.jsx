import { Route, Routes } from "react-router-dom";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutResult from "./pages/CheckoutResult";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import {PrivateRoute} from "./context/PrivateRoute";
import {AuthProvider} from "./context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <PrivateRoute>
              <CheckoutResult result="success" />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout/failed"
          element={
            <PrivateRoute>
              <CheckoutResult result="failed" />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
