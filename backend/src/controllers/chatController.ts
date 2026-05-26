import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getChannels = async (req: Request, res: Response) => {
  try {
    const channels = await prisma.channel.findMany({
      include: {
        project: { select: { id: true, name: true } }
      }
    });
    res.json(channels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: { channelId: req.params.channelId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const message = await prisma.message.create({
      data: {
        ...req.body,
        senderId: req.user.id,
        channelId: req.params.channelId
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      }
    });
    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createChannel = async (req: Request, res: Response) => {
  try {
    const channel = await prisma.channel.create({
      data: req.body
    });
    res.status(201).json(channel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
