"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "../../../lib/api";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data = await getProductById(params.id);

        setProduct(data);

        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (error) {
        console.error("Failed to load product:", error);

        if (error.response?.status === 404) {
          router.replace("/products/not-found");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadProduct();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-white p-8 shadow">
            <p className="text-center text-gray-600">
              Loading product...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <h1 className="mb-3 text-2xl font-bold text-red-600">
              Something went wrong
            </h1>

            <p className="mb-6 text-gray-600">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">

        {/* Back button */}
        <button
          onClick={() => router.push("/products")}
          className="mb-6 rounded-lg border bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          ← Back to Products
        </button>

        {/* Product Details */}
        <div className="rounded-xl bg-white p-6 shadow">

          <div className="grid gap-8 md:grid-cols-2">

            {/* LEFT - Images */}
            <div>
              {/* Main Image */}
              <div className="flex h-[400px] items-center justify-center rounded-xl bg-gray-100 p-6">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <p className="text-gray-500">
                    No image available
                  </p>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images &&
                product.images.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={image}
                        onClick={() =>
                          setSelectedImage(image)
                        }
                        className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                          selectedImage === image
                            ? "border-blue-600"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* RIGHT - Product Information */}
            <div>

              <p className="mb-2 text-sm font-medium uppercase text-blue-600">
                {product.category}
              </p>

              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-md bg-yellow-100 px-3 py-1 font-semibold text-yellow-700">
                  ★ {product.rating}
                </span>

                <span className="text-gray-500">
                  {product.reviews?.length || 0} reviews
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price}
                </span>

                {product.discountPercentage && (
                  <span className="ml-3 text-sm text-green-600">
                    {product.discountPercentage}% off
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold">
                  Description
                </h2>

                <p className="leading-7 text-gray-600">
                  {product.description}
                </p>
              </div>

              {/* Product information */}
              <div className="grid grid-cols-2 gap-4 border-t pt-6">

                <div>
                  <p className="text-sm text-gray-500">
                    Brand
                  </p>

                  <p className="font-medium">
                    {product.brand || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Stock
                  </p>

                  <p className="font-medium">
                    {product.stock}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    SKU
                  </p>

                  <p className="font-medium">
                    {product.sku || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Availability
                  </p>

                  <p className="font-medium">
                    {product.availabilityStatus ||
                      "N/A"}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-10 border-t pt-8">

            <h2 className="mb-6 text-2xl font-bold">
              Customer Reviews
            </h2>

            {!product.reviews ||
            product.reviews.length === 0 ? (
              <p className="text-gray-500">
                No reviews available.
              </p>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((review, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-5"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">

                      <div>
                        <p className="font-semibold">
                          {review.reviewerName}
                        </p>

                        <p className="text-sm text-gray-500">
                          {review.reviewerEmail}
                        </p>
                      </div>

                      <span className="rounded-md bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                        ★ {review.rating}/5
                      </span>
                    </div>

                    <p className="text-gray-700">
                      {review.comment}
                    </p>

                    {review.date && (
                      <p className="mt-2 text-sm text-gray-400">
                        {new Date(
                          review.date
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}