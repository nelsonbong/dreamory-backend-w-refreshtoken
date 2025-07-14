import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  updateEventStatus,
  deleteEventWithPassword, // ✅ replaced version
} from '../controllers/event.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// 🔐 Protect all routes
router.use(authenticate);

// 🆕 Create Event with image upload
router.post('/', upload.single('thumbnail'), createEvent);

// 📄 Read
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// ✏️ Update with optional image upload
router.put('/:id', upload.single('thumbnail'), updateEvent);

// ✅ PATCH route for updating only status
router.patch('/:id/status', updateEventStatus);

// ❌ Delete (with password confirmation)
router.post('/:id/delete-with-password', deleteEventWithPassword); // ✅ final route

export default router;
