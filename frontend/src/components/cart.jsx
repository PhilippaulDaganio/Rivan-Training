import { useEffect, useState } from "react";
import { BASE_URL } from "../api/base";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");

  // 👇 dito mo ilalagay yung fetchCart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("access_token"); // ✅ galing sa login
        if (!token) {
          setError("You must be logged in to view your cart.");
          return;
        }

        const response = await fetch(`${BASE_URL}/cart/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token, // 👈 dito mo ilalagay
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load cart");
        }

        const data = await response.json();
        setCartItems(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCart();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id}>
              {item.product.product_name} — Qty: {item.qty}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
