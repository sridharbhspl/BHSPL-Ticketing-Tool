import { Router } from 'express';
import { 
  getTickets, 
  getTicketById, 
  createTicket, 
  updateTicket, 
  deleteTicket,
  addSubTask,
  addComment
} from '../controllers/ticketController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicket)
  .delete(deleteTicket);

router.post('/:id/subtasks', addSubTask);
router.post('/:id/comments', addComment);

export default router;
