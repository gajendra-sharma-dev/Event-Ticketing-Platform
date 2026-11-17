import { Router } from "express";
import {
  createEvent,
  getAllEvent,
  GetEventById,
  updateEvent,
  DeleteEvent,
} from "../controllers/event.controllers.js";
import { VerifyJWT } from "../middleware/Auth.middleware.js";

const router = Router();

router.use(VerifyJWT);
router.route("/createEvent").post(createEvent);
router.route("/getAllEvent").get(getAllEvent);
router.route("/getEventById/:eventId").get(GetEventById);
router.route("/updateEvent/:eventId").patch(updateEvent);
router.route("/deleteEvent/:eventId").delete(DeleteEvent);

export default router;
