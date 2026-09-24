"use client";

import Link from "next/link";

export default function ProductCard({ product, onDelete, deletingId }) {
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-24 w-24 rounded-lg object-cover"
        />

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{product.title}</h2>

          <p className="mt-1 text-sm text-slate-500">{product.category}</p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <span>
              Price:
              <b>${Number(product.price).toFixed(2)}</b>
            </span>

            <span>
              Rating:
              <b>⭐ {product.rating}</b>
            </span>

            <span>
              Stock:
              <b>{product.stock}</b>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/products/${product.id}`}
          className="flex-1 rounded-lg border px-3 py-2 text-center text-sm"
        >
          View
        </Link>

        <Link
          href={`/products/${product.id}/edit`}
          className="flex-1 rounded-lg border px-3 py-2 text-center text-sm"
        >
          Edit
        </Link>

        <button
          onClick={() => onDelete(product)}
          disabled={deletingId === product.id}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deletingId === product.id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
