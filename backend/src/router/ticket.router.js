import { Router } from "express";
import {
  createTicket,
  getTicketByEventId,
  getTicketByOrderId,
  getTicketById,
  deleteTicket,
  checkInTickets,
} from "../controllers/ticket.controllers.js";

import { VerifyJWT } from "../middleware/Auth.middleware.js";
const router = Router();

router.use(VerifyJWT);
router.route("/createTicket").post(createTicket);
router.route("/getTicketByEvent/:eventId").get(getTicketByEventId);
router.route("/getTicketByOrderId/:orderId").get(getTicketByOrderId);
router.route("/checkedIn").patch(checkInTickets);
router.route("/deleteTicket/:ticketId").delete(deleteTicket);
router.route("/getTicketById/:ticketId").get(getTicketById);

export default router;
