"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "../../../../components/ProductForm";
import {
  getProductById,
  updateProduct,
} from "../../../../lib/api";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] =
    useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoadingProduct(true);
        setError("");

        const data = await getProductById(params.id);

        setProduct(data);
      } catch (error) {
        console.error(
          "Failed to load product:",
          error
        );

        if (error.response?.status === 404) {
          setError("Product not found.");
        } else {
          setError(
            error.response?.data?.message ||
              "Failed to load product."
          );
        }
      } finally {
        setLoadingProduct(false);
      }
    }

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  async function handleUpdateProduct(productData) {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateProduct(params.id, productData);

      router.push(`/products/${params.id}`);
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingProduct) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading product...
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <h1 className="mb-3 text-2xl font-bold">
            Product Not Found
          </h1>

          <p className="mb-5 text-gray-600">
            The product you are trying to edit does not
            exist.
          </p>

          <button
            onClick={() => router.push("/products")}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() =>
            router.push(`/products/${params.id}`)
          }
          className="mb-6 rounded-lg border bg-white px-4 py-2 hover:bg-gray-100"
        >
          ← Back to Product
        </button>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <ProductForm
          product={product}
          onSubmit={handleUpdateProduct}
          loading={saving}
          onCancel={() =>
            router.push(`/products/${params.id}`)
          }
        />

      </div>
    </main>
  );
}