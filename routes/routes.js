import express from 'express';
import Event from "../models/Event.js";
import { getHomePage, registerUser, loginUser, logoutUser, userPage, updateRole, goToLogin, getWaitingPage, eventPage, taskPage, attendancePage, inventoryPage, membersPage, addEvent, addOrUpdateEvent, deleteEvent, searchUsers, updateBudget, addOrUpdateTask, deleteTask, submitAttendance} from "../controllers/controller.js";
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
router.get("/members", membersPage);
router.post("/addEvent", addEvent);
router.post("/addOrUpdateEvent", addOrUpdateEvent);
router.post('/events/:id/delete', deleteEvent);
router.get('/search', searchUsers);
router.post('/updateBudget', updateBudget);
router.post("/addOrUpdateTask", addOrUpdateTask);
router.post("/tasks/:id/delete", deleteTask);
router.post("/submitAttendance", submitAttendance);

export default router;