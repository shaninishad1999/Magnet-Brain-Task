// src/admin/TasksTab.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskEditModal from "./task/TaskEditModal";
import NewTask from "./task/NewTask";
import { getAllTasks, deleteTask } from "../api/taskapi";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const TasksTab = () => {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  // Pagination (page is UI-controlled)
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to normalize API response
  const normalizeGetAllTasksResponse = (res) => {
    if (!res) return { data: [], total: 0, pages: 1, page: 1, limit };
    
    // Handle new response structure with pagination object
    if (res.pagination) {
      return {
        data: res.data || [],
        total: res.pagination.total || 0,
        pages: res.pagination.pages || 1,
        page: res.pagination.page || 1,
        limit: res.pagination.limit || limit
      };
    }
    
    // Fallback for old response structure
    if (Array.isArray(res)) return { data: res, total: res.length, pages: 1, page: 1, limit };
    const payload = res.data ?? res;
    if (Array.isArray(payload)) return { data: payload, total: payload.length, pages: 1, page: 1, limit };
    const dataArr = payload.data ?? payload.tasks ?? [];
    const totalCount = Number(payload.total ?? payload.count ?? (Array.isArray(dataArr) ? dataArr.length : 0));
    const pages = Number(payload.pages ?? Math.max(1, Math.ceil(totalCount / limit)));
    const curPage = Number(payload.page ?? 1);
    return { data: Array.isArray(dataArr) ? dataArr : [], total: totalCount, pages, page: curPage, limit };
  };

  const refreshTasks = async (opts = {}) => {
    try {
      setLoading(true);
      setError(null);

      const usePage = Number(opts.page ?? page);
      const useLimit = Number(opts.limit ?? limit);
      const useStatus = opts.status ?? statusFilter;

      // Pass status filter to backend API
      const res = await getAllTasks(usePage, useLimit, useStatus !== "All" ? useStatus : null);
      const normalized = normalizeGetAllTasksResponse(res);

      // Keep items that have at least title
      const validTasks = (normalized.data || []).filter((t) => t && t.title);

      setTasks(validTasks);
      setTotalItems(normalized.total ?? validTasks.length);

      const computedPages = normalized.pages ?? Math.max(1, Math.ceil((normalized.total ?? validTasks.length) / useLimit));
      setTotalPages(Number(computedPages));

      // Keep the UI page as the value we requested
      setPage(usePage);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again.");
      setTasks([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Refresh when page or statusFilter changes
    refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  // When status filter changes, reset to page 1
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteClick = (task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    try {
      await deleteTask(selectedTask._id);
      toast.success("Task deleted");
      setShowDeleteModal(false);
      // Refresh current page
      await refreshTasks();
      // If current page is now empty and not page 1, go back one page
      if (tasks.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("Failed to delete task");
    }
  };

  const handleTaskUpdate = async (updatedTask) => {
    // Optimistic update then refresh
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    await refreshTasks();
  };

  // Pagination controls
  const goPrev = () => {
    if (page <= 1) return;
    setPage((p) => p - 1);
  };
  const goNext = () => {
    if (page >= totalPages) return;
    setPage((p) => p + 1);
  };

  // Render table rows
  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="4" className="p-4 text-center">
            Loading...
          </td>
        </tr>
      );
    }

    if (!tasks.length) {
      return (
        <tr>
          <td colSpan="4" className="p-6 text-center text-gray-500">
            No tasks found.
          </td>
        </tr>
      );
    }

    return tasks.map((task) => (
      <tr key={task._id} className="border-b border-gray-100">
        {/* Title (clickable -> details) */}
        <td className="p-2">
          <button
            onClick={() => navigate(`/admin-dashboard/task-details/${task._id}`)}
            className="text-left font-medium hover:underline"
          >
            {task.title}
          </button>
        </td>

        {/* Due Date */}
        <td className="p-2">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>

        {/* Status */}
        <td className="p-2">
          <span
            className={`px-2 py-1 rounded ${
              task.status === "Completed"
                ? "bg-green-100 border-green-200 text-green-800"
                : task.status === "In Progress"
                ? "bg-blue-100 border-blue-200 text-blue-800"
                : "bg-yellow-100 border-yellow-200 text-yellow-800"
            }`}
          >
            {task.status || "Pending"}
          </span>
        </td>

        {/* Actions */}
        <td className="p-2">
          <div className="flex space-x-2 items-center">
            <button
              onClick={() => navigate(`/admin-dashboard/task-details/${task._id}`)}
              className="px-2 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center gap-2"
              title="View details"
            >
              <FaEye />
            </button>

            <button className="p-1 text-blue-500 hover:text-blue-700" onClick={() => handleEditClick(task)} title="Edit task">
              ✏️
            </button>

            <button className="p-1 text-red-500 hover:text-red-700  " onClick={() => handleDeleteClick(task)} title="Delete task">
              <MdDelete size={20} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <select
            className="border border-gray-300 rounded p-2 w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Pagination summary */}
        <div className="text-sm text-gray-600">
          Page {page} / {totalPages} • Total: {totalItems}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Tasks List</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          {error && <div className="mb-4 text-red-600">{error}</div>}

          <table className="w-full">
            <thead className="text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Due Date</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">{renderTableBody()}</tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <button onClick={goPrev} disabled={page <= 1 || loading} className="px-3 py-1 mr-2 bg-gray-100 rounded disabled:opacity-50">
              Prev
            </button>
            <button onClick={goNext} disabled={loading || page >= totalPages} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">
              Next
            </button>
          </div>
          <div className="text-sm text-gray-600">Showing page {page} of {totalPages}</div>
        </div>
      </div>

      {/* New Task Modal */}
      <NewTask
        show={isModalOpen}
        handleClose={closeModal}
        user={selectedUser || { name: "Team Member", _id: "" }}
        onTaskAssigned={async () => {
          setIsModalOpen(false);
          await refreshTasks({ page: 1 });
        }}
      />

      {/* Edit Task Modal */}
      <TaskEditModal isOpen={showEditModal} task={selectedTask} onClose={() => setShowEditModal(false)} onUpdate={handleTaskUpdate} />

      {/* Delete Task Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4">Delete Task</h2>
            <p className="mb-4">Are you sure you want to delete this task?</p>
            <div className="flex justify-center gap-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleDelete}>
                Delete
              </button>
              <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksTab;