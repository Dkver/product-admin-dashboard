import api from "./axios";

export async function login(username, password) {
  console.log("USERNAME:", username);
  console.log("PASSWORD:", password);
  console.log("LOGIN URL:", "https://dummyjson.com/auth/login");

  try {
    const response = await api.post("/auth/login", {
      username,
      password,
      expiresInMins: 30,
    });

    console.log("API STATUS:", response.status);
    console.log("API RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.log("API ERROR:", error);
    console.log("ERROR STATUS:", error.response?.status);
    console.log("ERROR DATA:", error.response?.data);

    throw error;
  }
}