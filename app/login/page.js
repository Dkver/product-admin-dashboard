"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    console.log("LOGIN STARTED");

    try {
      const response = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          expiresInMins: 30,
        }),
      });

      console.log("STATUS:", response.status);

      const data = await response.json();

      console.log("RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data));

      alert("Login successful!");

      window.location.href = "/products";
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-8">
          Product Admin Login
        </h1>

        <form onSubmit={handleSubmit}>

          <div className="mb-5">
            <label className="block mb-2 font-medium">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          {error && (
            <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </main>
  );
}