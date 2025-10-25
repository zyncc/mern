import { Request, Response } from "express";
import { signInSchema, signupSchema } from "../lib/types";
import prisma from "../db/prisma";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/jwt";

export async function signup(req: Request, res: Response) {
  try {
    const body = req.body;
    const { success, data } = signupSchema.safeParse(body);

    if (!success) {
      return res.status(400).json({ success: false, error: "Invalid data" });
    }

    const findUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (findUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
    return res
      .status(200)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const body = req.body;
    const { success, data } = signInSchema.safeParse(body);

    if (!success) {
      return res.status(400).json({ success: false, error: "Invalid data" });
    }

    const findUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!findUser) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      findUser.password
    );

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid password" });
    }

    const { password, ...userWithoutPassword } = findUser;
    const token = await generateToken(userWithoutPassword);

    return res
      .status(200)
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })
      .json({ success: true, message: "User signed in successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
