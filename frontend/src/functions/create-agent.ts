"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().min(10, "Phone number must be at least 10 characters long"),
});

export async function createAgent(values: z.infer<typeof formSchema>) {
  const token = (await cookies()).get("auth_token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/agent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    }
  );
  const data = await response.json();
  revalidatePath("/dashboard");
  return data;
}
