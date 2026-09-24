"use client";

import { useRouter } from "next/navigation";

export default function ProductNotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-xl bg-white p-10 text-center shadow">

        <div className="mb-4 text-6xl">
          🔍
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Product Not Found
        </h1>

        <p className="mb-8 text-gray-600">
          The product you are looking for does not exist.
          Please check the product ID and try again.
        </p>

        <button
          onClick={() => router.push("/products")}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Back to Products
        </button>

      </div>
    </main>
  );
}