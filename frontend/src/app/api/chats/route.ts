import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const chats = await prisma.chat.findMany({
    where: { userId: user.id },
    include: { messages: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ chats });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, question, answer, chatId } = await req.json();
  let chat;
  if (chatId) {
    chat = await prisma.chat.findUnique({ where: { id: chatId } });
  }
  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        userId: user.id,
        title: url,
        messages: {
          create: [
            { role: "user", content: question },
            { role: "ai", content: answer },
          ],
        },
      },
      include: { messages: true },
    });
  } else {
    await prisma.message.create({
      data: { chatId: chat.id, role: "user", content: question },
    });
    await prisma.message.create({
      data: { chatId: chat.id, role: "ai", content: answer },
    });
    chat = await prisma.chat.findUnique({
      where: { id: chat.id },
      include: { messages: true },
    });
  }
  return NextResponse.json({ chat });
}

export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { chatId } = await req.json();
  if (!chatId)
    return NextResponse.json({ error: "No chatId provided" }, { status: 400 });
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || chat.userId !== user.id) {
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  }
  await prisma.message.deleteMany({ where: { chatId } });
  await prisma.chat.delete({ where: { id: chatId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { chatId, title } = await req.json();
  if (!chatId || !title)
    return NextResponse.json(
      { error: "Missing chatId or title" },
      { status: 400 }
    );
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || chat.userId !== user.id) {
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  }
  await prisma.chat.update({ where: { id: chatId }, data: { title } });
  return NextResponse.json({ success: true });
}
