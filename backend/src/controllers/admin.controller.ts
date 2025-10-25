import { Request, Response } from "express";
import prisma from "../db/prisma";
import { agentSchema } from "../lib/types";
import bcrypt from "bcrypt";
import * as XLSX from "xlsx";

export async function CreateAgent(req: Request, res: Response) {
  try {
    const body = req.body;
    const { success, data } = agentSchema.safeParse(body);

    if (!success) {
      return res.status(400).json({ success: false, error: data });
    }

    const findAgent = await prisma.agent.findUnique({
      where: {
        email: data.email,
      },
    });

    if (findAgent) {
      return res
        .status(400)
        .json({ success: false, error: "Agent already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    await prisma.agent.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Agent created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

type CSVData = {
  FirstName: string;
  Phone: string;
  Notes: string;
};

export async function ProcessList(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const allowedMimeTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid file type" });
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data: CSVData[] = XLSX.utils.sheet_to_json(sheet);

    if (!data.length) {
      return res
        .status(400)
        .json({ success: false, error: "No data found in file." });
    }

    const EXPECTED_HEADERS = ["FirstName", "Phone", "Notes"];
    const actualHeaders = Object.keys(data[0]);
    const missingHeaders = EXPECTED_HEADERS.filter(
      (header) => !actualHeaders.includes(header)
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required columns: ${missingHeaders.join(", ")}`,
      });
    }

    const agents = await prisma.agent.findMany({
      select: { id: true },
    });

    if (agents.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No agents found." });
    }

    const distribution: Record<string, CSVData[]> = {};
    agents.forEach((agent) => (distribution[agent.id] = []));

    data.forEach((task, index) => {
      const agentIndex = index % agents.length;
      const agentId = agents[agentIndex].id;
      distribution[agentId].push(task);
    });

    for (const agentId in distribution) {
      const tasks = distribution[agentId];
      if (tasks.length > 0) {
        await prisma.tasks.createMany({
          data: tasks.map((t) => ({
            firstName: t.FirstName,
            phone: String(t.Phone),
            notes: t.Notes,
            agentId,
          })),
        });
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Tasks created successfully" });
  } catch (error) {
    console.error("File Processing Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function GetAgents(req: Request, res: Response) {
  try {
    const agents = await prisma.agent.findMany({
      omit: {
        password: true,
      },
    });
    return res.status(200).json({ success: true, data: agents });
  } catch (error) {
    console.error("Get Agents Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function GetTasks(req: Request, res: Response) {
  try {
    const tasks = await prisma.tasks.findMany({
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function GetTasksByAgent(req: Request, res: Response) {
  try {
    const agentId = req.params.agentId;
    if (!agentId) {
      return res
        .status(400)
        .json({ success: false, error: "Agent ID is required" });
    }
    const tasks = await prisma.tasks.findMany({
      where: {
        agentId: agentId,
      },
    });
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
