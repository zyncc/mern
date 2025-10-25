import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/get-session";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddAgent from "./_components/add-agent";
import UploadFile from "./_components/upload-file";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

type Agent = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type Task = {
  id: string;
  firstName: string;
  phone: string;
  notes: string;
  agent: Agent;
};

export default async function Page() {
  const token = (await cookies()).get("auth_token")?.value;
  const session = await getSession(token);
  if (!session) {
    return redirect("/signin");
  }

  const allAgents = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/agent`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const agents = await allAgents.json();

  const allTasks = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/tasks`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const tasks = await allTasks.json();
  const noAgents = agents.data.length === 0;
  const noTasks = tasks.data.length === 0;
  return (
    <div className="container mx-auto px-2 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl">Dashboard</h1>
        <div className="flex gap-x-3">
          <UploadFile />
          <AddAgent />
        </div>
      </div>
      <h2 className="font-bold text-xl mt-5">Agents</h2>
      {noAgents ? (
        <EmptyAgents />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {agents.data.map((agent: Agent) => (
            <Card key={agent.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/dashboard/agent/${agent.id}`}>{agent.id}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{agent.name}</p>
                <p>{agent.email}</p>
                <p>{agent.phone}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <h2 className="font-bold text-xl mt-5">Tasks</h2>
      {noTasks ? (
        <EmptyTasks />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {tasks.data.map((task: Task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>{task.firstName}</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/agent/${task.agent.id}`}>
                  <p>Assigned Agent: {task.agent.name}</p>
                </Link>
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

function EmptyAgents() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No Agents Created</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any agents yet.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <AddAgent />
        </div>
      </EmptyContent>
    </Empty>
  );
}

function EmptyTasks() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No Tasks Created</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any tasks yet.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <UploadFile />
        </div>
      </EmptyContent>
    </Empty>
  );
}
