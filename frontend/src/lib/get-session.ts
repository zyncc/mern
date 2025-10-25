export async function getSession(token: string | undefined) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  if (data.success && data.data) {
    return data.data;
  }
  return null;
}
