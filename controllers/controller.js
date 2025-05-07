import User from "../models/User.js";
import Event from "../models/Event.js";
import Task from "../models/Task.js";

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
    const editEventId = req.query.editId;
    const eventToEdit = editEventId ? await Event.findById(editEventId) : null;

    res.render("events", { events, eventToEdit });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).send("Server error");
  }
  };

export const taskPage = (req, res) => {
    res.render("tasks");
  };

export const attendancePage = (req, res) => {
    res.render("attendance");
  };

export const inventoryPage = (req, res) => {
    res.render("inventory");
  };

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

export const userPage = (req, res) => {
  const user = req.session.user || {
    username: "sample_user",
    role: "user",
    status: "confirmed"
  };
  res.render("profile", { user, sample: !req.session.user });
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
  const { eventId, name, date, location } = req.body;

  try {
    if (eventId) {
      await Event.findByIdAndUpdate(eventId, {
        name,
        date,
        location
      });
    } else {
      const event = new Event({ name, date, location });
      await event.save();
    }

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

  const results = await User.find({ name: new RegExp(query, "i") })
  .limit(5)
  .exec();

  res.json(results);
}