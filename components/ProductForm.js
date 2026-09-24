"use client";

import { useEffect, useState } from "react";

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  stock: "",
};

export default function ProductForm({
  product = null,
  onSubmit,
  loading = false,
  onCancel,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || "",
        description: product.description || "",
        price: product.price ?? "",
        category: product.category || "",
        stock: product.stock ?? "",
      });
    } else {
      setForm(initialForm);
    }
  }, [product]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function validate() {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.trim().length < 3) {
      newErrors.title =
        "Title must be at least 3 characters";
    }

    if (!form.description.trim()) {
      newErrors.description =
        "Description is required";
    }

    if (form.price === "") {
      newErrors.price = "Price is required";
    } else if (
      isNaN(Number(form.price)) ||
      Number(form.price) <= 0
    ) {
      newErrors.price =
        "Price must be greater than 0";
    }

    if (!form.category.trim()) {
      newErrors.category =
        "Category is required";
    }

    if (form.stock === "") {
      newErrors.stock = "Stock is required";
    } else if (
      isNaN(Number(form.stock)) ||
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      newErrors.stock =
        "Stock must be a non-negative integer";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (!validate()) {
      return;
    }

    const productData = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      stock: Number(form.stock),
    };

    onSubmit(productData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl bg-white p-6 shadow"
    >
      <h2 className="text-2xl font-bold text-gray-900">
        {product ? "Edit Product" : "Add Product"}
      </h2>

      {/* Title */}
      <div>
        <label className="mb-1 block font-medium">
          Title
        </label>

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter product title"
          className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
        />

        {errors.title && (
          <p className="mt-1 text-sm text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block font-medium">
          Description
        </label>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter product description"
          rows={4}
          className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="mb-1 block font-medium">
          Price
        </label>

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Enter price"
          min="0"
          step="0.01"
          className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
        />

        {errors.price && (
          <p className="mt-1 text-sm text-red-600">
            {errors.price}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block font-medium">
          Category
        </label>

        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Enter category"
          className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
        />

        {errors.category && (
          <p className="mt-1 text-sm text-red-600">
            {errors.category}
          </p>
        )}
      </div>

      {/* Stock */}
      <div>
        <label className="mb-1 block font-medium">
          Stock
        </label>

        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Enter stock"
          min="0"
          step="1"
          className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
        />

        {errors.stock && (
          <p className="mt-1 text-sm text-red-600">
            {errors.stock}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : product
            ? "Update Product"
            : "Add Product"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border px-5 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}