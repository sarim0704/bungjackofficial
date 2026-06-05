import express from "express";
import {
  getPremiumContent,
  createPremiumContent,
  updatePremiumContent,
  deletePremiumContent,
} from "../controllers/premiumContentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { premiumContentSchema } from "../schemas/schemas.js";

const router = express.Router();

/*
  Admin-only listing. The PUBLIC site never calls this — subscribers get
  their content through the subscription-gated /api/subscriptions/content
  route. Protecting this prevents premium media URLs from leaking publicly.
*/
router.get("/", protect, getPremiumContent);
router.post("/", protect, validate(premiumContentSchema), createPremiumContent);
router.put("/:id", protect, validate(premiumContentSchema), updatePremiumContent);
router.delete("/:id", protect, deletePremiumContent);

export default router;
