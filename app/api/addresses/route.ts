import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { label, receiverName, phone, province, city, district, postalCode, fullAddress, isDefault } = body;

    if (!receiverName || !phone || !province || !city || !postalCode || !fullAddress) {
      return NextResponse.json(
        { message: "Receiver Name, Phone, Province, City, Postal Code, and Full Address are required." },
        { status: 400 }
      );
    }

    return await prisma.$transaction(async (tx) => {
      const existingCount = await tx.address.count({ where: { userId } });
      const makeDefault = Boolean(isDefault) || existingCount === 0;

      if (makeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const address = await tx.address.create({
        data: {
          userId,
          label: label?.trim() || "Shipping Address",
          receiverName: receiverName.trim(),
          phone: phone.trim(),
          province: province.trim(),
          city: city.trim(),
          district: district?.trim() || "District",
          postalCode: postalCode.trim(),
          fullAddress: fullAddress.trim(),
          isDefault: makeDefault,
        },
      });

      return NextResponse.json(address, { status: 201 });
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create address" },
      { status: 400 }
    );
  }
}
