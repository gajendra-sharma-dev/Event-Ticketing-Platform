import { Router } from "express";
import {
  createOrder,
  payOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,
  refundedOrder,
  requestRefund,
  getRefundRequests,
  rejectRefund,
} from "../controllers/order.controllers.js";

import { VerifyJWT } from "../middleware/Auth.middleware.js";

const router = Router();
router.use(VerifyJWT);

router.route("/createOrder").post(createOrder);
router.route("/payOrder/:orderId").patch(payOrder);
router.route("/getOrder/:orderId").get(getOrderById);
router.route("/refundOrder/:orderId").patch(refundedOrder);
router.route("/cancelOrder/:orderId").patch(cancelOrder);
router.route("/getMyOrder").get(getMyOrders);
router.route("/requestRefund/:orderId").patch(requestRefund);
router.route("/refundRequests").get(getRefundRequests);
router.route("/rejectRefund/:orderId").patch(rejectRefund);

export default router;
