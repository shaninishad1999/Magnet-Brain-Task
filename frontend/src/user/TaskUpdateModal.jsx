import React, { useState } from 'react';
import { updateTask } from '../api/taskapi';

const TaskUpdateModal = ({ task, onClose, onUpdate }) => {
  const [status, setStatus] = useState(task.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedTask = {
      status, // ✅ only status update
    };

    try {
      const updated = await updateTask(task._id, updatedTask);
      onUpdate(updated);
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-overlay">
      <div className="bg-white rounded-lg shadow-xl p-5 w-full max-w-md relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800">Update Task Status</h2>

        <form onSubmit={handleSubmit}>
          
          {/* Task Title (read only) */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Task Title</label>
            <div className="bg-gray-100 border border-gray-200 rounded p-3 mt-1">
              {task.title}
            </div>
          </div>

          {/* Priority (read only) */}
          <div className="mb-4 flex justify-between items-center">
            <label className="text-sm text-gray-600">Priority</label>
            <span className={`font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {/* Description (read only) */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Description</label>
            <div className="bg-gray-100 border border-gray-200 rounded p-3 mt-1 text-gray-700 text-sm">
              {task.description || "No description"}
            </div>
          </div>

          {/* Status dropdown (only editable field) */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-400"
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TaskUpdateModal;
