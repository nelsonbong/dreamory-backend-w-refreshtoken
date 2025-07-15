import { Request, Response } from 'express';
import prisma from '../config/prisma';
import cloudinary from '../config/cloudinary';
import bcrypt from 'bcryptjs';

// ✅ Create Event
export const createEvent = async (req: Request, res: Response) => {
  const { name, location, startDate, endDate } = req.body;
  const file = req.file;

  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!file) return res.status(400).json({ message: 'Thumbnail image is required.' });

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'event_thumbnails', resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result as { secure_url: string });
        }
      ).end(file.buffer);
    });

    const event = await prisma.event.create({
      data: {
        name,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        thumbnail: result.secure_url,
        status: 'Ongoing',
        userId: req.userId,
      },
      include: { user: true },
    });

    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event' });
  }
};

// ✅ Get All Events
export const getAllEvents = async (req: Request, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const events = await prisma.event.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// ✅ Get Event By ID
export const getEventById = async (req: Request, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching event' });
  }
};

// ✅ Update Event (without status)
export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, location, startDate, endDate } = req.body;
  const file = req.file;

  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) return res.status(404).json({ message: 'Event not found' });

    let thumbnailUrl = existingEvent.thumbnail;

    if (file) {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'event_thumbnails', resource_type: 'image' },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string });
          }
        ).end(file.buffer);
      });

      thumbnailUrl = result.secure_url;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        thumbnail: thumbnailUrl,
      },
    });

    res.json(updatedEvent);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Error updating event' });
  }
};

// ✅ PATCH: Update only event status
export const updateEventStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!status) return res.status(400).json({ message: 'Status is required' });

  try {
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) return res.status(404).json({ message: 'Event not found' });

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status },
    });

    res.json(updatedEvent);
  } catch (err) {
    console.error('Error updating event status:', err);
    res.status(500).json({ message: 'Error updating event status' });
  }
};

// ✅ Delete Event (with password confirmation)
export const deleteEventWithPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!password) return res.status(400).json({ message: 'Password is required' });

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await prisma.event.delete({ where: { id } });

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Error deleting event' });
  }
};
