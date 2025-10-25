import { Request, Response } from "express";
import prisma from "../db/prisma";
import { agentSchema } from "../lib/types";
import bcrypt from "bcrypt";
import { Readable } from "stream";
import csv from "csv-parser";

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
    const EXPECTED_HEADERS = ["FirstName", "Phone", "Notes"];

    const buffer = file.buffer;
    const readableCSVStream = Readable.from(buffer.toString());
    const results: CSVData[] = [];
    let headersValidated = false;
    let headersError: string | null = null;

    const csvStream = readableCSVStream.pipe(csv());

    csvStream
      .on("headers", (headers) => {
        const actualHeaders = headers.map((h: string) => h.trim());

        const missingHeaders = EXPECTED_HEADERS.filter(
          (expectedHeader) => !actualHeaders.includes(expectedHeader)
        );

        if (missingHeaders.length > 0) {
          headersError = `CSV file is missing required columns`;
          csvStream.destroy();
          return res.status(400).json({ success: false, error: headersError });
        } else {
          headersValidated = true;
        }
      })
      .on("data", (data) => {
        if (headersValidated) {
          results.push(data);
        }
      })
      .on("error", (err) => {
        console.error("CSV Parsing Error:", err);
        return res
          .status(500)
          .json({ success: false, error: "Error parsing CSV file." });
      });

    const agents = await prisma.agent.findMany({
      select: {
        id: true,
      },
    });

    if (agents.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No agents found." });
    }

    const distribution: Record<string, CSVData[]> = {};
    agents.forEach((agent) => (distribution[agent.id] = []));

    results.forEach((task, index) => {
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
            phone: t.Phone,
            notes: t.Notes,
            agentId,
          })),
        });
      }
    }

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
