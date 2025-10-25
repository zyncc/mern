"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function uploadFile(formData: FormData) {
  const token = (await cookies()).get("auth_token")?.value;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  const data = await response.json();
  revalidatePath("/dashboard");
  return data;
}
