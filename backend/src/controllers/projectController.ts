import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: { select: { tickets: true } }
      }
    });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.create({
      data: req.body
    });
    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.ticket.groupBy({
      by: ['status'],
      where: { projectId: req.params.id },
      _count: true
    });
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
