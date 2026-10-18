
const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();

const allowedStatuses = ["Pending", "In Progress", "Completed"];
const allowedPriorities = ["Low", "Medium", "High"];

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function validateTask(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 120
    ) {
      errors.push("Title is required and must be at most 120 characters");
    }
  }

  if (
    body.description !== undefined &&
    (typeof body.description !== "string" ||
      body.description.length > 1000)
  ) {
    errors.push("Description must be at most 1000 characters");
  }

  if (
    body.status !== undefined &&
    !allowedStatuses.includes(body.status)
  ) {
    errors.push("Invalid task status");
  }

  if (
    body.priority !== undefined &&
    !allowedPriorities.includes(body.priority)
  ) {
    errors.push("Invalid task priority");
  }

  if (
    body.dueDate !== undefined &&
    body.dueDate !== null &&
    body.dueDate !== "" &&
    (typeof body.dueDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate) ||
      !Number.isFinite(Date.parse(`${body.dueDate}T00:00:00.000Z`)) ||
      new Date(`${body.dueDate}T00:00:00.000Z`)
        .toISOString()
        .slice(0, 10) !== body.dueDate)
  ) {
    errors.push("Due date must be a valid YYYY-MM-DD date");
  }

  return errors;
}

function taskFields(body) {
  const fields = {};

  ["title", "description", "status", "priority", "dueDate"].forEach(
    (key) => {
      if (body[key] !== undefined) {
        fields[key] =
          key === "title" || key === "description"
            ? body[key].trim()
            : key === "dueDate" && body[key] === ""
              ? null
              : body[key];
      }
    }
  );

  return fields;
}

// GET /api/tasks?search=report&status=Pending
router.get("/", async (req, res, next) => {
  try {
    const { search = "", status = "", priority = "" } = req.query;
    const filter = {};

    if (typeof status === "string" && status && status !== "All") {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      filter.status = status;
    }

    if (typeof priority === "string" && priority && priority !== "All") {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({ message: "Invalid priority filter" });
      }
      filter.priority = priority;
    }

    if (typeof search === "string" && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id
router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks
router.post("/", async (req, res, next) => {
  try {
    const errors = validateTask(req.body);

    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const task = await Task.create(taskFields(req.body));
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const fields = taskFields(req.body);

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: "No valid fields supplied" });
    }

    const errors = validateTask(fields, true);

    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, fields, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully", id: task._id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
