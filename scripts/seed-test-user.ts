const BASE_URL = "http://localhost:3000";

async function seed() {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "test",
      password: "test",
    }),
    credentials: "include",
  });

  const data = await res.json();

  console.log("✔ seeded user:", data);
}

seed();