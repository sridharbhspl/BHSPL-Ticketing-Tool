import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getTickets = async (req: Request, res: Response) => {
  try {
    const { status, priority, projectId, assigneeId, search } = req.query;

    const where: any = {};
    if (status) where.status = { in: (status as string).split(',') };
    if (priority) where.priority = { in: (priority as string).split(',') };
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { id: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        project: true,
        assignee: { select: { id: true, name: true, avatar: true } },
        reporter: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true, subTasks: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        assignee: { select: { id: true, name: true, avatar: true } },
        reporter: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        },
        subTasks: {
          include: { assignedEngineer: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTicket = async (req: any, res: Response) => {
  try {
    const ticket = await prisma.ticket.create({
      data: {
        ...req.body,
        reporterId: req.user.id
      }
    });
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(ticket);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    await prisma.ticket.delete({ where: { id: req.params.id } });
    res.json({ message: 'Ticket deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// SubTasks
export const addSubTask = async (req: any, res: Response) => {
  try {
    const subTask = await prisma.subTask.create({
      data: {
        ...req.body,
        parentTicketId: req.params.id
      }
    });
    res.status(201).json(subTask);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Comments
export const addComment = async (req: any, res: Response) => {
  try {
    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        ticketId: req.params.id,
        authorId: req.user.id
      },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
