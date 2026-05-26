import { Router } from 'express';
import { getChannels, getMessages, sendMessage, createChannel } from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/channels')
  .get(getChannels)
  .post(createChannel);

router.route('/channels/:channelId/messages')
  .get(getMessages)
  .post(sendMessage);

export default router;
