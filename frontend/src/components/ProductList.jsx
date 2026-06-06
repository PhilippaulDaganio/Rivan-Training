import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {BASE_URL} from "../api/base";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  const ProductData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}products/`);
      setProducts(response.data);
    } catch (err) {
      console.log(err);

    }
  };

  useEffect(() => {
    ProductData();
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-1"
        >
          <Link to={`/products/${product.id}`} className="block">
            <img
              src={`${BASE_URL}${product.image}`}
              alt={product.product_name}
              className="h-56 w-full object-cover"
            />
          </Link>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-950">
                {product.product_name}
              </h3>
              <p className="shrink-0 font-semibold text-[#061947]">
                PHP {product.product_price}
              </p>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
              {product.description}
            </p>
            <Link
              to={`/products/${product.id}`}
              className="mt-5 inline-flex items-center rounded-lg bg-[#061947] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0b255f]"
            >
              View details
            </Link>


          </div>
        </article>
      ))}
    </div>
  );
};

export default ProductList;



