// src/admin/TaskDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTaskById } from "../api/taskapi";
import toast from "react-hot-toast";
import { Calendar, User, Flag, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import TaskEditModal from "./task/TaskEditModal";

const TaskDetails = () => {
  const { id } = useParams();
  const nav = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Helper to navigate back to Admin Dashboard tasks tab
  const goBackToTasksTab = () => {
    nav("/admin-dashboard?tab=tasks");
  };

  // Fetch task by id
  useEffect(() => {
    let mounted = true;
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await getTaskById(id);
        const payload = res?.data ?? res;
        if (!mounted) return;
        setTask(payload);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load task");
        // navigate back to admin dashboard tasks tab after a short delay (so toast shows)
        setTimeout(goBackToTasksTab, 700);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchTask();
    return () => {
      mounted = false;
    };
  }, [id]); // nav intentionally excluded to avoid re-renders

  // Called when Edit button clicked
  const handleEditClick = () => {
    if (!task) {
      toast.error("Task data not available");
      return;
    }
    setShowEditModal(true);
  };

  // Called when modal reports an updated task
  const handleTaskUpdate = async (updatedTask) => {
    if (!updatedTask) return;
    setTask((prev) => (prev && prev._id === updatedTask._id ? { ...prev, ...updatedTask } : prev));
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-slate-600 text-sm">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-6">
        <div className="text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Task not found</h3>
          <button
            onClick={goBackToTasksTab}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // === Semantic color mappings (same as ViewAssignedTasksModal / TasksTab) ===
  const getStatusColor = (status) => {
    const s = (status ?? "").toString();
    switch (s) {
      case "Completed":
        return "bg-green-100 border-green-200 text-green-800";
      case "In Progress":
        return "bg-blue-100 border-blue-200 text-blue-800";
      default:
        // Pending / others
        return "bg-yellow-100 border-yellow-200 text-yellow-800";
    }
  };

  const getPriorityColor = (priority) => {
    const p = (priority ?? "").toString();
    switch (p) {
      case "High":
        return "bg-red-100 border-red-200 text-red-700";
      case "Medium":
        return "bg-orange-100 border-orange-200 text-orange-700";
      default:
        return "bg-slate-100 border-slate-200 text-slate-700";
    }
  };
  // ========================================================================

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3">
      <div className="max-w-3xl mx-auto">
        {/* 🔹 TOP HEADER + Task Details Label */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={goBackToTasksTab}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <span className="text-sm font-semibold text-slate-700">📄 Task Details Page</span>

          {/* Task ID (Green) */}
          <span className="text-xs font-bold text-green-600">ID: #{id}</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Title strip */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h1 className="text-xl font-semibold leading-tight">{task.title}</h1>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Status + Priority */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center gap-3">
                <div className="p-2 bg-white rounded-md shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase">Status</div>
                  <div
                    className={`mt-1 inline-block text-sm px-2 py-0.5 rounded ${getStatusColor(
                      task.status ?? "Pending"
                    )}`}
                  >
                    {task.status ?? "Pending"}
                  </div>
                </div>
              </div>

              <div className="w-40 bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center gap-3">
                <div className="p-2 bg-white rounded-md shadow-sm">
                  <Flag className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase">Priority</div>
                  <div
                    className={`mt-1 inline-block text-sm px-2 py-0.5 rounded ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority ?? "Normal"}
                  </div>
                </div>
              </div>
            </div>

            {/* Assignee + Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center gap-3">
                <div className="p-2 bg-white rounded-full">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase">Assigned To</div>
                  {task.assignee ? (
                    <div className="text-sm font-medium text-slate-900">
                      {task.assignee.name} <span className="text-xs text-slate-500">· @{task.assignee.userid}</span>
                    </div>
                  ) : (
                    <div className="text-sm italic text-slate-500">Unassigned</div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center gap-3">
                <div className="p-2 bg-white rounded-full">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase">Due Date</div>
                  <div className="text-sm font-medium text-slate-900 mt-1">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "No due date"}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-md">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500 uppercase mb-1">Description</div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {task.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={goBackToTasksTab}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-sm hover:bg-slate-50 transition"
            >
              Back
            </button>
            <button
              onClick={handleEditClick}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Task Edit Modal */}
      <TaskEditModal isOpen={showEditModal} task={task} onClose={() => setShowEditModal(false)} onUpdate={handleTaskUpdate} />
    </div>
  );
};

export default TaskDetails;
