"use client";

import Link from "next/link";

export default function ProductTable({
  products,
  onDelete,
  deletingId,
}) {
  return (
    <div className="hidden overflow-hidden rounded-xl bg-white shadow md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Product
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Category
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Price
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Rating
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Stock
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-14 w-14 rounded-lg object-cover"
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.title}
                      </p>

                      <p className="text-sm text-gray-500">
                        ID: {product.id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {product.category}
                </td>

                <td className="px-6 py-4 font-medium">
                  ${Number(product.price).toFixed(2)}
                </td>

                <td className="px-6 py-4">
                  ⭐ {product.rating}
                </td>

                <td className="px-6 py-4">
                  {product.stock}
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      View
                    </Link>

                    <Link
                      href={`/products/${product.id}/edit`}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => onDelete(product)}
                      disabled={
                        deletingId === product.id
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === product.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}