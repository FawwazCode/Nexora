import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingAddress = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existingAddress) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }

    const body = await request.json();
    const { label, receiverName, phone, province, city, district, postalCode, fullAddress, isDefault } = body;

    return await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const updated = await tx.address.update({
        where: { id },
        data: {
          ...(typeof label === "string" ? { label: label.trim() } : {}),
          ...(typeof receiverName === "string" ? { receiverName: receiverName.trim() } : {}),
          ...(typeof phone === "string" ? { phone: phone.trim() } : {}),
          ...(typeof province === "string" ? { province: province.trim() } : {}),
          ...(typeof city === "string" ? { city: city.trim() } : {}),
          ...(typeof district === "string" ? { district: district.trim() } : {}),
          ...(typeof postalCode === "string" ? { postalCode: postalCode.trim() } : {}),
          ...(typeof fullAddress === "string" ? { fullAddress: fullAddress.trim() } : {}),
          ...(typeof isDefault === "boolean" ? { isDefault } : {}),
        },
      });

      return NextResponse.json(updated);
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update address" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingAddress = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existingAddress) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete address" },
      { status: 400 }
    );
  }
}
