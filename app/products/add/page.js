"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "../../../components/ProductForm";
import { addProduct } from "../../../lib/api";

export default function AddProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAddProduct(productData) {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await addProduct(productData);

      router.push("/products");
    } catch (error) {
      console.error("Add product error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to add product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() => router.push("/products")}
          className="mb-6 rounded-lg border bg-white px-4 py-2 hover:bg-gray-100"
        >
          ← Back to Products
        </button>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <ProductForm
          onSubmit={handleAddProduct}
          loading={loading}
          onCancel={() => router.push("/products")}
        />

      </div>
    </main>
  );
}