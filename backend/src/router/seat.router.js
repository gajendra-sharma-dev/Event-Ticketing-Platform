import { Router } from "express";
import { VerifyJWT } from "../middleware/Auth.middleware.js";
import {
  createSeat,
  getSeatById,
  getSeatByevent,
  updatedSeats,
  deleteSeat,
} from "../controllers/seat.controllers.js";
const router = Router();

router.use(VerifyJWT);

router.route("/createSeat").post(createSeat);
router.route("/getSeatByEvent/:eventId").get(getSeatByevent);
router.route("/getSeatById/:seatId").get(getSeatById);
router.route("/updateSeat/:seatId").patch(updatedSeats);
router.route("/deleteSeat/:seatId").delete(deleteSeat);

export default router;
