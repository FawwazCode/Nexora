import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const RegisterSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data Tidak Valid",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email Sudah Digunakan",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.CUSTOMER,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Register Berhasil",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("=============Register Error============");
    console.error(error);
    console.error("===================================");


    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}