import express from 'express';
import Event from "../models/Event.js";
import { getHomePage, registerUser, loginUser, logoutUser, userPage, updateRole, goToLogin, getWaitingPage, eventPage, taskPage, attendancePage, inventoryPage, addEvent, addOrUpdateEvent, deleteEvent, searchUsers} from "../controllers/controller.js";
const router = express.Router();

router.get("/", getHomePage);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/profile", userPage);
router.get("/updateRole", updateRole);
router.get("/goToLogin", goToLogin);
router.get("/waiting", getWaitingPage);
router.get("/events", eventPage);
router.get("/tasks", taskPage);
router.get("/attendance", attendancePage);
router.get("/inventory", inventoryPage);
router.post("/addEvent", addEvent);
router.post("/addOrUpdateEvent", addOrUpdateEvent);
router.post('/events/:id/delete', deleteEvent);
router.get('/search', searchUsers);

export default router;