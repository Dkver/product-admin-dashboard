"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProductTable from "../../components/ProductTable";
import { useAuth } from "../../components/AuthProvider";
import ProductCard from "../../components/ProductCard";
import {
    getProducts,
    searchProducts,
    getCategories,
    getProductsByCategory,
    deleteProduct,
} from "../../lib/api";

export default function ProductsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [total, setTotal] = useState(0);
    const [categories, setCategories] = useState([]);
    const [sortBy, setSortBy] = useState("");
    const [order, setOrder] = useState("");

    const [initialized, setInitialized] = useState(false);

    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    const abortControllerRef = useRef(null);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const pageValue = Number(params.get("page"));
        const pageSizeValue = Number(params.get("pageSize"));

        setPage(Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1);

        setPageSize([10, 20, 50].includes(pageSizeValue) ? pageSizeValue : 20);

        setSearch(params.get("search") || "");
        setCategory(params.get("category") || "");
        setSortBy(params.get("sortBy") || "");
        setOrder(params.get("order") || "");

        setInitialized(true);
    }, []);
    /*
     * Load categories
     */
    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await getCategories();

                setCategories(data);
            } catch (error) {
                console.error("CATEGORY ERROR:", error);
            }
        }

        loadCategories();
    }, []);

    /*
     * Load products
     *
     * Search is debounced by 500ms.
     */
    useEffect(() => {
        if (!initialized) {
            return;
        }

        const timer = setTimeout(
            () => {
                loadProducts();
            },
            search ? 500 : 0,
        );

        return () => {
            clearTimeout(timer);
        };
    }, [initialized, search, category, sortBy, order, page, pageSize]);

    async function loadProducts() {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new controller
        const controller = new AbortController();

        abortControllerRef.current = controller;

        try {
            setLoading(true);
            setError("");

            const skip = (page - 1) * pageSize;

            let data;

            if (search.trim()) {
                data = await searchProducts(
                    search.trim(),
                    pageSize,
                    skip,
                    controller.signal,
                );
            } else if (category) {
                data = await getProductsByCategory(
                    category,
                    pageSize,
                    skip,
                    sortBy,
                    order,
                    controller.signal,
                );
            } else {
                data = await getProducts(
                    pageSize,
                    skip,
                    sortBy,
                    order,
                    controller.signal,
                );
            }

            // Ignore old request
            if (abortControllerRef.current !== controller) {
                return;
            }

            setProducts(data.products || []);
            setTotal(data.total || 0);
        } catch (error) {
            // Ignore cancelled request
            if (
                error.name === "CanceledError" ||
                error.code === "ERR_CANCELED"
            ) {
                return;
            }

            console.error("PRODUCT ERROR:", error);

            if (abortControllerRef.current === controller) {
                setError(
                    error.response?.data?.message ||
                        error.message ||
                        "Failed to load products",
                );

                setProducts([]);
                setTotal(0);
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setLoading(false);
            }
        }
    }
    /**
     * Handle deletion
     */

    async function handleDelete(product) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.title}"?`,
        );

        if (!confirmed) {
            return;
        }

        if (deletingId) {
            return;
        }

        try {
            setDeletingId(product.id);
            setDeleteError("");

            await deleteProduct(product.id);

            setProducts((currentProducts) =>
                currentProducts.filter((item) => item.id !== product.id),
            );

            setTotal((currentTotal) => Math.max(0, currentTotal - 1));
        } catch (error) {
            console.error("Delete product error:", error);

            setDeleteError(
                error.response?.data?.message || "Failed to delete product.",
            );
        } finally {
            setDeletingId(null);
        }
    }

    /*
     * SEARCH
     */
    function updateURL(values) {
        const params = new URLSearchParams();

        const currentValues = {
            page,
            pageSize,
            search,
            category,
            sortBy,
            order,
            ...values,
        };

        if (currentValues.page > 1) {
            params.set("page", currentValues.page);
        }

        if (currentValues.pageSize !== 20) {
            params.set("pageSize", currentValues.pageSize);
        }

        if (currentValues.search.trim()) {
            params.set("search", currentValues.search.trim());
        }

        if (currentValues.category) {
            params.set("category", currentValues.category);
        }

        if (currentValues.sortBy) {
            params.set("sortBy", currentValues.sortBy);
        }

        if (currentValues.sortBy && currentValues.order) {
            params.set("order", currentValues.order);
        }

        const queryString = params.toString();

        router.replace(queryString ? `/products?${queryString}` : "/products");
    }
    function handleSearchChange(e) {
        const value = e.target.value;

        setSearch(value);
        setPage(1);

        if (value.trim()) {
            setCategory("");
        }

        updateURL({
            search: value,
            category: "",
            page: 1,
        });
    }

    /*
     * CATEGORY
     */
    function handleCategoryChange(e) {
        const value = e.target.value;

        setCategory(value);
        setPage(1);

        if (value) {
            setSearch("");
        }

        updateURL({
            category: value,
            search: "",
            page: 1,
        });
    }

    /*
     * SORT
     */
    function handleSortChange(e) {
        const value = e.target.value;

        const newOrder = value ? "asc" : "";

        setSortBy(value);
        setOrder(newOrder);
        setPage(1);

        updateURL({
            sortBy: value,
            order: newOrder,
            page: 1,
        });
    }
    /*
     * ASCENDING / DESCENDING
     */
    function handleOrderChange(e) {
        const value = e.target.value;

        setOrder(value);
        setPage(1);

        updateURL({
            order: value,
            page: 1,
        });
    }
    /*
     * PAGE SIZE
     */
    function handlePageSizeChange(e) {
        const newSize = Number(e.target.value);

        setPageSize(newSize);
        setPage(1);

        updateURL({
            pageSize: newSize,
            page: 1,
        });
    }

    /*
     * PREVIOUS
     */
    function handlePrevious() {
        if (page > 1) {
            const newPage = page - 1;

            setPage(newPage);

            updateURL({
                page: newPage,
            });
        }
    }

    /*
     * NEXT
     */
    function handleNext() {
        const totalPages = Math.ceil(total / pageSize);

        if (page < totalPages) {
            const newPage = page + 1;

            setPage(newPage);

            updateURL({
                page: newPage,
            });
        }
    }

    const totalPages = Math.ceil(total / pageSize);
    useEffect(() => {
        if (totalPages > 0 && page > totalPages) {
            setPage(totalPages);

            updateURL({
                page: totalPages,
            });
        }
    }, [totalPages, page]);

    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;

    const end = Math.min(page * pageSize, total);

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Product Admin Dashboard
                    </h1>

                    <p className="mt-1 text-gray-500">Manage your products</p>

                    {user && (
                        <p className="mt-2 text-sm text-gray-600">
                            Logged in as{" "}
                            <span className="font-semibold">
                                {user.username}
                            </span>
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => router.push("/products/add")}
                        className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700"
                    >
                        + Add Product
                    </button>

                    <button
                        onClick={() => {
                            logout();
                            router.push("/login");
                        }}
                        className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* DELETE ERROR */}
            {deleteError && (
                <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                    {deleteError}
                </div>
            )}

            {/* CONTROLS */}
            <div className="bg-white rounded-xl shadow p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* SEARCH */}
                    <div className="lg:col-span-2">
                        <label className="block font-medium mb-2">Search</label>

                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search products..."
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label className="block font-medium mb-2">
                            Category
                        </label>

                        <select
                            value={category}
                            onChange={handleCategoryChange}
                            className="w-full border rounded-lg px-4 py-3"
                        >
                            <option value="">All Categories</option>

                            {categories.map((item) => {
                                /*
                                 * Current DummyJSON can return
                                 * category objects in some versions.
                                 */
                                const value =
                                    typeof item === "string" ? item : item.slug;

                                const label =
                                    typeof item === "string" ? item : item.name;

                                return (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* PAGE SIZE */}
                    <div>
                        <label className="block font-medium mb-2">
                            Page Size
                        </label>

                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="w-full border rounded-lg px-4 py-3"
                        >
                            <option value={10}>10</option>

                            <option value={20}>20</option>

                            <option value={50}>50</option>
                        </select>
                    </div>

                    {/* SORT */}
                    <div>
                        <label className="block font-medium mb-2">
                            Sort By
                        </label>

                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="w-full border rounded-lg px-4 py-3"
                        >
                            <option value="">Default</option>

                            <option value="price">Price</option>

                            <option value="rating">Rating</option>

                            <option value="title">Title</option>
                        </select>
                    </div>

                    {/* ORDER */}
                    <div>
                        <label className="block font-medium mb-2">Order</label>

                        <select
                            value={order}
                            onChange={handleOrderChange}
                            disabled={!sortBy}
                            className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
                        >
                            <option value="asc">Ascending</option>

                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>

                {/* Active filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {search && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            Search: {search}
                        </span>
                    )}

                    {category && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            Category: {category}
                        </span>
                    )}

                    {sortBy && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                            Sort: {sortBy} ({order})
                        </span>
                    )}
                </div>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="bg-white rounded-xl shadow p-10 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

                        <p className="mt-4 text-gray-600">
                            Loading products...
                        </p>
                    </div>
                </div>
            )}

            {/* ERROR */}
            {!loading && error && (
                <div className="rounded-xl bg-white p-10 text-center shadow">
                    <div className="mb-4 text-5xl">⚠️</div>

                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        Something went wrong
                    </h2>

                    <p className="mb-5 text-red-600">{error}</p>

                    <button
                        onClick={loadProducts}
                        className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* EMPTY */}
            {!loading && !error && products.length === 0 && (
                <div className="rounded-xl bg-white p-10 text-center shadow">
                    <div className="mb-4 text-5xl">🔍</div>

                    <h2 className="text-xl font-semibold text-gray-900">
                        No products found
                    </h2>

                    <p className="mt-2 text-gray-500">
                        We couldn't find any products matching your search or
                        filters.
                    </p>
                </div>
            )}

            {/* PRODUCTS */}
            {!loading && !error && products.length > 0 && (
                <>
                    {/* SHOWING */}
                    <div className="bg-white rounded-xl shadow p-4 mb-6">
                        <p className="text-gray-600">
                            Showing{" "}
                            <span className="font-semibold">{start}</span>–
                            <span className="font-semibold">{end}</span> of{" "}
                            <span className="font-semibold">{total}</span>
                        </p>
                    </div>

                    {/* DESKTOP TABLE */}
                    <ProductTable
                        products={products}
                        onDelete={handleDelete}
                        deletingId={deletingId}
                    />

                    {/* MOBILE CARDS */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onDelete={handleDelete}
                                deletingId={deletingId}
                            />
                        ))}
                    </div>

                    {/* PAGINATION */}
                    <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            disabled={page === 1}
                            className="px-4 py-2 border rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        {Array.from(
                            {
                                length: totalPages,
                            },
                            (_, index) => index + 1,
                        ).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => {
                                    setPage(pageNumber);

                                    updateURL({
                                        page: pageNumber,
                                    });
                                }}
                                className={`px-4 py-2 rounded-lg border ${
                                    page === pageNumber
                                        ? "bg-blue-600 text-white"
                                        : "bg-white"
                                }`}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            onClick={handleNext}
                            disabled={page === totalPages}
                            className="px-4 py-2 border rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}
