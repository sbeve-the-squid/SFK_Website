import User from "../models/User.js";
import Event from "../models/Event.js";
import Task from "../models/Task.js";
import Item from "../models/Item.js";
import Budget from "../models/Budget.js";
import AttendanceLog from "../models/AttendanceLog.js";

export const getHomePage = (req, res) => {
  res.render("index", { user: req.session.user || null });
  };

export const goToLogin = (req, res) => {
    res.render("login");
  };

export const getWaitingPage = (req, res) => {
    res.render("waiting");
  };

export const eventPage = async (req, res) => {
  try {
    const events = await Event.find({}).populate("users").sort({ date: 1 });
    const confirmedUsers = await User.find({ status: "confirmed" });
    const editEventId = req.query.editId;
    const eventToEdit = editEventId ? await Event.findById(editEventId) : null;

    const page = parseInt(req.query.page) || 1;
    const perPage = 4;

    const totalPages = Math.ceil(events.length / perPage);
    const paginatedEvents = events.slice((page - 1) * perPage, page * perPage);

    res.render("events", { events: paginatedEvents, eventToEdit, confirmedUsers, page, totalPages });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).send("Server error");
  }
};

export const taskPage = async (req, res) => {
  try {
    const tasks = await Task.find({}).populate("users").sort({ deadline: 1 });
    const confirmedUsers = await User.find({ status: "confirmed" });
    const editTaskId = req.query.editId;
    const taskToEdit = editTaskId ? await Task.findById(editTaskId) : null;

    const page = parseInt(req.query.page) || 1;
    const perPage = 4;

    const totalPages = Math.ceil(tasks.length / perPage);
    const paginatedTasks = tasks.slice((page - 1) * perPage, page * perPage);

    res.render("tasks", { tasks: paginatedTasks, taskToEdit, confirmedUsers, page, totalPages });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).send("Server error");
  }
};

export const attendancePage = async (req, res) => {
  const confirmedUsers = await User.find({ status: "confirmed" });

  const page = parseInt(req.query.page) || 1;
  const perPage = 5;

  const totalLogs = await AttendanceLog.countDocuments();
  const totalPages = Math.ceil(totalLogs / perPage);

  const logs = await AttendanceLog.find({})
    .populate("absentees")
    .sort({ createdAt: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage);

  res.render("attendance", { confirmedUsers, logs, page, totalPages });
};


export const inventoryPage = async (req, res) => {
  let budget = await Budget.findOne();
  if (!budget) {
    budget = new Budget({ amount: 0 });
    await budget.save();
  }

  res.render("inventory", { budget });
};

export const membersPage = (req, res) => {
  res.render("members");
}

export const registerUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    req.session.user = user;
    res.redirect("/waiting");
  } catch (error) {
    console.error("User creation error:", error);
  res.send("Error creating user! Try a different username");
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.send("A user with that name does not exist.");
  }

  if (!(await user.comparePassword(password))) {
    return res.send("Invalid password");
  }
  req.session.user = user; 
  if (user.status === "unconfirmed") {
    return res.redirect("/waiting");
  }

  res.redirect("/profile");
};

export const logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

export const userPage = async (req, res) => {
  let user = req.session.user;

  if (!user) {
    // sample user fallback
    user = {
      username: "sample_user",
      role: "user",
      status: "confirmed"
    };
    return res.render("profile", { user, sample: true, events: [], tasks: [] });
  }

  try {
    let events, tasks;

    if (user.role === "admin") {
      events = await Event.find({}).populate("users");
      tasks = await Task.find({}).populate("users");
    } else {
      events = await Event.find({ _id: { $in: user.upcomingEvents } }).populate("users");
      tasks = await Task.find({ _id: { $in: user.toDo } }).populate("users");
    }

    res.render("profile", { user, sample: false, events, tasks });
  } catch (err) {
    console.error("Error loading profile data:", err);
    res.status(500).send("Server Error");
  }
};

export const updateRole = async (req, res) => {
  const id = req.session.user._id;
  const user = await User.findById(id);
  user.role = user.role === "admin" ? "user" : "admin";

  req.session.user = user;
  res.render("profile", {user : req.session.user});
  user.save();
};

export const addEvent = async (req, res) => {
  const { name, date, location, description } = req.body;
  try {
    const event = new Event({
      name,
      date,
      location,
    });
    await event.save();
    res.redirect("/events");
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).send("Failed to create event.");
  }
};

export const addOrUpdateEvent = async (req, res) => {
  const { eventId, name, date, location, userIds } = req.body;

  let userIdArray = userIds ? userIds.split(",") : [];

  try {
    // If "all" is selected, fetch all confirmed user IDs
    if (userIdArray.includes("all")) {
      const confirmedUsers = await User.find({ status: "confirmed" }, "_id");
      userIdArray = confirmedUsers.map(user => user._id.toString());
    }

    let event;
    if (eventId) {
      event = await Event.findByIdAndUpdate(eventId, {
        name, date, location, users: userIdArray
      }, { new: true });

      // Remove event from users no longer assigned
      await User.updateMany(
        { upcomingEvents: event._id, _id: { $nin: userIdArray } },
        { $pull: { upcomingEvents: event._id } }
      );
    } else {
      event = new Event({ name, date, location, users: userIdArray });
      await event.save();
    }

    // Add event to upcomingEvents for assigned users
    await User.updateMany(
      { _id: { $in: userIdArray } },
      { $addToSet: { upcomingEvents: event._id } }
    );

    res.redirect("/events");
  } catch (err) {
    console.error("Error saving or updating event:", err);
    res.status(500).send("Failed to save or update event.");
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect('/events');
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

export const searchUsers = async (req, res) => {
  const query = req.query.q || "";

  if (!query) {
    return res.json([]);
  }

  const results = await User.find({ username: new RegExp(query, "i") })
  .limit(5)
  .exec();

  res.json(results);
}

export const updateBudget = async (req, res) => {
  const { amount, note } = req.body;
  const newAmount = parseFloat(amount);

  let budget = await Budget.findOne();
  if (!budget) {
    budget = new Budget({ amount: 0 });
  }

  const difference = newAmount - budget.amount;

  budget.history.unshift({
    difference: difference.toFixed(2),
    note
  });

  budget.amount = newAmount;

  await budget.save();

  res.redirect("/inventory");
};

export const addOrUpdateTask = async (req, res) => {
  const { taskId, name, deadline, description, userIds } = req.body;

  let userIdArray = userIds ? userIds.split(",") : [];

  try {
    // If "all" is selected, replace with all confirmed users
    if (userIdArray.includes("all")) {
      const confirmedUsers = await User.find({ status: "confirmed" }, "_id");
      userIdArray = confirmedUsers.map(user => user._id.toString());
    }

    let task;
    if (taskId) {
      // Update existing task
      task = await Task.findByIdAndUpdate(taskId, {
        name, deadline, description, users: userIdArray
      }, { new: true });

      // Remove task from users no longer assigned
      await User.updateMany(
        { toDo: task._id, _id: { $nin: userIdArray } },
        { $pull: { toDo: task._id } }
      );
    } else {
      // Create new task
      task = new Task({ name, deadline, description, users: userIdArray });
      await task.save();
    }

    // Add task to assigned users' toDo array
    await User.updateMany(
      { _id: { $in: userIdArray } },
      { $addToSet: { toDo: task._id } }
    );

    res.redirect("/tasks");
  } catch (err) {
    console.error("Error saving or updating task:", err);
    res.status(500).send("Failed to save or update task.");
  }
};

export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Remove task from all users' toDo arrays
    await User.updateMany(
      { toDo: taskId },
      { $pull: { toDo: taskId } }
    );

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    res.redirect("/tasks");
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).send("Server Error");
  }
};

export const submitAttendance = async (req, res) => {
  const { date, log } = req.body;

  try {
    const parsedLog = JSON.parse(log); // { userId: "present"/"absent" }

    const absentees = Object.entries(parsedLog)
      .filter(([_, status]) => status === "absent")
      .map(([userId]) => userId);

    const logEntry = new AttendanceLog({ date, absentees });
    await logEntry.save();

    res.redirect("/attendance");
  } catch (err) {
    console.error("Error saving attendance:", err);
    res.status(500).send("Failed to save attendance log.");
  }
};

