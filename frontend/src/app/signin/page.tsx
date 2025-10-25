import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegisterForm from "./_components/register-form";
import LoginForm from "./_components/login-form";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page() {
  const token = (await cookies()).get("auth_token")?.value;
  const session = await getSession(token);
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Register or Login</CardTitle>
        </CardHeader>
        <CardContent className="min-w-[400px]">
          <Tabs defaultValue="register">
            <TabsList className="w-full">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
