import { Request, Response } from 'express';
import prisma from '../config/prisma';

// 🌐 Get All Events (Public) with Pagination
export const getAllEventsPublic = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 3;
  const skip = (page - 1) * limit;

  try {
    // Fetch paginated events and total count in parallel
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.event.count(),
    ]);

    res.json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error fetching public events:', err);
    res.status(500).json({ message: 'Error fetching public events' });
  }
};

// 🌐 Get Event by ID (Public)
export const getEventByIdPublic = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error('Error fetching public event by ID:', err);
    res.status(500).json({ message: 'Error fetching public event' });
  }
};
