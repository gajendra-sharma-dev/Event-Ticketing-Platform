import { Router } from "express";
import {
  createEvent,
  getAllEvent,
  GetEventById,
  updateEvent,
  DeleteEvent,
} from "../controllers/event.controllers.js";
import { VerifyJWT } from "../middleware/Auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
const router = Router();

router.use(VerifyJWT);

router.route("/getAllEvent").get(getAllEvent);
router.route("/getEventById/:eventId").get(GetEventById);
router
  .route("/updateEvent/:eventId")
  .patch(upload.single("image"), updateEvent);
router.route("/deleteEvent/:eventId").delete(DeleteEvent);

router.route("/createEvent").post(upload.single("image"), createEvent);

export default router;
