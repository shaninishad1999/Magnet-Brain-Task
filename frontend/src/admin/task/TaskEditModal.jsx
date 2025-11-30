import React, { useState, useEffect } from "react";
import { updateTask } from "../../api/taskapi";
import toast from "react-hot-toast";

const TaskEditModal = ({ isOpen, onClose, task, onUpdate }) => {
  const [form, setForm] = useState({});
  const [previousStatus, setPreviousStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      // Create a clean copy of the task for editing
      const formData = {
        _id: task._id,
        title: task.title || "",
        status: task.status || "Pending",
        priority: task.priority || "Medium",
        description: task.description || "",
        dueDate: task.dueDate?.slice(0, 10) || "",
        // Keep the assignee reference intact
        assignee: task.assignee || null
      };
      
      setForm(formData);
      setPreviousStatus(task.status || "");
    }
  }, [task]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = async () => {
    try {
      setIsSubmitting(true);
      
      // Create a clean data object for the API call
      const dataToUpdate = { ...form };
      
      const updated = await updateTask(form._id, dataToUpdate);
      onUpdate(updated);

      if (previousStatus && form.status !== previousStatus) {
        toast.success(`Task status changed from ${previousStatus} to ${form.status}`, {
          icon: "🔄",
          duration: 3000,
        });
      } else {
        toast.success("Task updated successfully!");
      }

      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="w-full p-2 border rounded"
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            placeholder="Task Title"
          />

          {/* Show Assignee information (view only) */}
          <div className="w-full p-2 border rounded bg-gray-100 text-gray-700">
            <p className="text-sm font-semibold">Assignee:</p>
            <p>{form.assignee?.name || "Unassigned"}</p>
            <p className="text-xs text-gray-500">{form.assignee?.userid || "No UserID"}</p>
          </div>

          <select
            className="w-full p-2 border rounded"
            name="status"
            value={form.status || ""}
            onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="w-full p-2 border rounded"
            name="priority"
            value={form.priority || ""}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <input
            className="w-full p-2 border rounded"
            name="dueDate"
            type="date"
            value={form.dueDate || ""}
            onChange={handleChange}
          />

          <textarea
            className="w-full p-2 border rounded md:col-span-2"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Description"
            rows={3}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleEdit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;