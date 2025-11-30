const mongoose = require("mongoose");
const Task = require("../models/taskModel");
const User = require("../models/userModel");

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, status, priority, assignee, dueDate, description } = req.body;

    const newTask = new Task({
      title,
      status,
      priority,
      assignee,
      dueDate,
      description,
    });

    const savedTask = await newTask.save();

    // ✅ Increment the 'tasks' field for the assigned user
    await User.findByIdAndUpdate(assignee, { $inc: { tasks: 1 } });

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create task",
      message: error.message,
    });
  }
};

// Get all tasks
// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    // Parse and validate pagination parameters
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    // Build filters object
    const filters = {};
    if (req.query.status && req.query.status !== 'All') {
      filters.status = req.query.status;
    }
    if (req.query.priority && req.query.priority !== 'All') {
      filters.priority = req.query.priority;
    }
    if (req.query.assignee) {
      filters.assignee = req.query.assignee;
    }

    // Add search functionality (optional but useful)
    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Execute queries in parallel for better performance
    const [total, tasks] = await Promise.all([
      Task.countDocuments(filters),
      Task.find(filters)
        .populate('assignee', 'name userid email')
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .lean() // Better performance, returns plain JS objects
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Return consistent response structure
    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page,
        pages: totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get tasks", 
      message: error.message 
    });
  }
};

// Get tasks by user ID
const getTasksByUser = async (req, res) => {
  const { id } = req.query;

  try {
    // Validate that id is provided
    if (!id) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    const tasks = await Task.find({ assignee: id }); // Filter by assignee now
    
    // Return empty array instead of 404 when no tasks found
    if (!tasks.length) {
      return res.status(200).json({ msg: "No tasks found for this user", tasks: [] });
    }
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Task Fetch Error:", error);
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
};

// Update a task
// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskData = req.body; // incoming updates

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Fetch existing task first (to detect assignee changes)
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updateData = {};

    // Copy allowed fields
    if (taskData.title) updateData.title = taskData.title;
    if (taskData.status) updateData.status = taskData.status;
    if (taskData.priority) updateData.priority = taskData.priority;
    if (taskData.description !== undefined) updateData.description = taskData.description;
    if (taskData.dueDate) updateData.dueDate = taskData.dueDate;

    // Normalize and handle assignee (string id or object with _id)
    let newAssigneeId = null;
    if (taskData.assignee) {
      if (typeof taskData.assignee === 'string') {
        if (!mongoose.Types.ObjectId.isValid(taskData.assignee)) {
          return res.status(400).json({ message: "Invalid assignee ID" });
        }
        newAssigneeId = taskData.assignee;
      } else if (taskData.assignee._id) {
        if (!mongoose.Types.ObjectId.isValid(taskData.assignee._id)) {
          return res.status(400).json({ message: "Invalid assignee ID" });
        }
        newAssigneeId = taskData.assignee._id;
      }

      if (newAssigneeId) updateData.assignee = new mongoose.Types.ObjectId(newAssigneeId);
    }

    // If nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    // Perform update and populate assignee
    const updatedTask = await Task.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate('assignee');

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found after update" });
    }

    // Handle assignee change counters
    const oldAssigneeId = existingTask.assignee ? existingTask.assignee.toString() : null;
    const newAssigneeIdStr = newAssigneeId ? newAssigneeId.toString() : null;

    if (oldAssigneeId && newAssigneeIdStr && oldAssigneeId !== newAssigneeIdStr) {
      // Decrement old assignee tasks (ensure not negative)
      const oldUser = await User.findByIdAndUpdate(oldAssigneeId, { $inc: { tasks: -1 } }, { new: true });
      if (oldUser && oldUser.tasks < 0) {
        await User.findByIdAndUpdate(oldAssigneeId, { $set: { tasks: 0 } });
      }

      // Increment new assignee tasks
      await User.findByIdAndUpdate(newAssigneeIdStr, { $inc: { tasks: 1 } });
    } else if (!oldAssigneeId && newAssigneeIdStr) {
      // No previous assignee, but now assigned -> increment new
      await User.findByIdAndUpdate(newAssigneeIdStr, { $inc: { tasks: 1 } });
    } else if (oldAssigneeId && !newAssigneeIdStr) {
      // Previously assigned but now unassigned -> decrement old
      const oldUser = await User.findByIdAndUpdate(oldAssigneeId, { $inc: { tasks: -1 } }, { new: true });
      if (oldUser && oldUser.tasks < 0) {
        await User.findByIdAndUpdate(oldAssigneeId, { $set: { tasks: 0 } });
      }
    }

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("🗑️ Incoming delete request for Task ID:", id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      // console.warn("⚠️ Invalid task ID received:", id);
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    // console.log("✅ Deleted Task:", deletedTask);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await User.findByIdAndUpdate(deletedTask.assignee, {
      $inc: { tasks: -1 },
    });

    res.status(200).json({ message: "Task deleted successfully", id });
  } catch (error) {
    // console.error("❌ Error deleting task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getTaskMetrics = async (req, res) => {
  try {
    const [total, completed, inProgress, pending] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'Completed' }),
      Task.countDocuments({ status: 'In Progress' }),
      Task.countDocuments({ status: 'Pending' }),
    ]);

    res.status(200).json({
      total,
      completed,
      inProgress,
      pending,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task metrics', error });
  }
};

// GET /api/tasks/recent
const getRecentTasks = async (req, res) => {
  try {
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(10)
      .populate('assignee', 'name email'); // populate user data

    res.status(200).json(recentTasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent tasks', error });
  }
};
const getUserTasks = async (req, res) => {
  const { id } = req.params; // Get userId from request parameters
 

  try {
    const tasks = await Task.find({ assignee: id })
      .populate('assignee', 'name email') // Populate user data
      .sort({ createdAt: -1 }); // Sort by creation date
    
   
    return res.status(200).json(tasks);
    
  } catch (error) {
    console.error("❌ Task Fetch Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
// controllers/taskController.js
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    const task = await Task.findById(id).populate('assignee', 'name userid email');
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




module.exports = {
  createTask,
  getAllTasks,
  getTasksByUser,
  updateTask,
  deleteTask,
  getTaskMetrics,
  getRecentTasks, getUserTasks,
  getTaskById
};
