import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getSession } from "@/lib/get-session";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type Params = {
  params: Promise<{ id: string }>;
};

type Task = {
  id: string;
  firstName: string;
  phone: string;
  notes: string;
};

export default async function Page({ params }: Params) {
  const { id } = await params;

  const token = (await cookies()).get("auth_token")?.value;
  const session = await getSession(token);
  if (!session) {
    return redirect("/signin");
  }

  const tasks = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/tasks/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const tasksData = await tasks.json();
  const noTasks = tasksData.data.length === 0;
  return (
    <div className="container mx-auto px-2 py-10">
      <h1 className="font-bold text-xl">All tasks for Agent - {id}</h1>
      {noTasks ? (
        <EmptyTasks />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {tasksData.data.map((task: Task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>{task.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>First Name: {task.firstName}</p>
                <p>Phone: {task.phone}</p>
                <p>Notes: {task.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyTasks() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No Tasks Found</EmptyTitle>
        <EmptyDescription>No tasks found for this agent.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Link href={"/dashboard"}>
            <Button>Create Task</Button>
          </Link>
        </div>
      </EmptyContent>
    </Empty>
  );
}
