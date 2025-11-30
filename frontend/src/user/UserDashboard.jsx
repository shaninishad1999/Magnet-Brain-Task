import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from './Header';
import MetricsCards from './MetricsCards';
import TaskUpdateModal from './TaskUpdateModal';
import { getUserTaskDisplay } from '../api/taskapi';

const UserDashboard = () => {
  const userId = localStorage.getItem("userMongoId");
  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "alex@example.com";
  const userIdName = localStorage.getItem("userId") || "User ID";

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  const userLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const getCreatedAtFromObjectId = (id) => {
    try {
      if (!id || typeof id !== 'string' || id.length < 8) {
        return new Date();
      }
      const ts = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(ts);
    } catch {
      return new Date();
    }
  };

  /**
   * Normalize server response into an array of tasks.
   * Handles various response formats safely.
   */
  const normalizeResponse = (res) => {
    try {
      if (!res) return [];
      
      // Handle axios response wrapper
      const payload = res.data !== undefined ? res.data : res;

      // If server returns message that there are no tasks, return empty array
      if (payload && typeof payload === 'object' && payload.msg) {
        if (typeof payload.msg === 'string' && /no tasks found/i.test(payload.msg)) {
          // Check if there's a tasks array alongside the message
          if (Array.isArray(payload.tasks)) {
            return payload.tasks;
          }
          return [];
        }
      }

      // Direct array
      if (Array.isArray(payload)) return payload;
      
      // Nested in data property
      if (payload && Array.isArray(payload.data)) return payload.data;
      
      // Nested in tasks property
      if (payload && Array.isArray(payload.tasks)) return payload.tasks;

      // Fallback to empty array
      return [];
    } catch (error) {
      console.error("Error normalizing response:", error);
      return [];
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const fetchUserTasks = async () => {
      if (!userId) {
        console.warn("No userId found in localStorage");
        setIsLoading(false);
        setTasks([]);
        setFilteredTasks([]);
        return;
      }

      setIsLoading(true);
      
      try {
        const res = await getUserTaskDisplay(userId);
        const payload = normalizeResponse(res);

        if (!mounted) return;

        const withCreated = payload.map((item) => ({
          ...item,
          createdAt: item.createdAt 
            ? new Date(item.createdAt) 
            : getCreatedAtFromObjectId(item._id),
        }));

        // Sort newest first
        const sortedTasks = withCreated.sort((a, b) => {
          const dateA = new Date(b.createdAt);
          const dateB = new Date(a.createdAt);
          return dateA - dateB;
        });

        setTasks(sortedTasks);

        // Apply current filter
        if (statusFilter === "All") {
          setFilteredTasks(sortedTasks);
        } else {
          setFilteredTasks(sortedTasks.filter((t) => t.status === statusFilter));
        }
      } catch (err) {
        console.error("Error fetching user tasks:", err);

        if (!mounted) return;

        // Check if this is a "no tasks" response (shouldn't throw, but just in case)
        const errorData = err?.response?.data;
        if (errorData && typeof errorData.msg === 'string' && /no tasks found/i.test(errorData.msg)) {
          setTasks([]);
          setFilteredTasks([]);
        } else {
          // Only show toast for actual errors
          const errorMessage =
            err?.response?.data?.msg ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load tasks. Please try again later.";

          toast.error(errorMessage, {
            duration: 4000,
            style: {
              borderLeft: '4px solid #EF4444',
            },
          });
          
          setTasks([]);
          setFilteredTasks([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserTasks();

    return () => {
      mounted = false;
    };
  }, [userId]); // Only re-fetch when userId changes

  // Apply status filter whenever tasks or statusFilter changes
  useEffect(() => {
    if (statusFilter === "All") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((t) => t.status === statusFilter));
    }
  }, [statusFilter, tasks]);

  const handleOpenModal = (task) => {
    if (!task) return;
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = (updatedTask) => {
    if (!updatedTask || !updatedTask._id) {
      console.error("Invalid task update");
      return;
    }

    const oldTask = tasks.find((task) => task._id === updatedTask._id);

    const newTasks = tasks.map((t) =>
      t._id === updatedTask._id 
        ? { 
            ...updatedTask, 
            createdAt: t.createdAt || getCreatedAtFromObjectId(t._id) 
          } 
        : t
    );
    
    setTasks(newTasks);

    // Show toast if status changed
    if (oldTask && oldTask.status !== updatedTask.status) {
      const statusIcons = {
        Completed: "✅",
        "In Progress": "🔄",
        Pending: "⏳",
      };

      const statusColors = {
        Completed: "#10B981",
        "In Progress": "#3B82F6",
        Pending: "#F59E0B",
      };

      toast.success(
        <div>
          <span className="font-bold">Task Status Updated</span>
          <p className="text-sm mt-1">
            {statusIcons[updatedTask.status] || "📋"} {oldTask.title} is now{" "}
            <span className="font-medium">{updatedTask.status}</span>
          </p>
        </div>,
        {
          duration: 4000,
          style: {
            borderLeft: `4px solid ${statusColors[updatedTask.status] || "#6B7280"}`,
          },
        }
      );
    }
  };

  const isTaskExpired = (dueDate) => {
    try {
      if (!dueDate) return false;
      const due = new Date(dueDate);
      const now = new Date();
      // Set time to start of day for fair comparison
      due.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return due < now;
    } catch {
      return false;
    }
  };

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;

  const userData = {
    name: userName,
    email: userEmail,
    userIdName: userIdName,
    role: "User",
    lastLogin: "2 hours ago",
    metrics: {
      tasks: tasks.length,
      completed,
      pending,
    },
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase() || '';
    switch (priorityLower) {
      case "high":
        return "bg-gradient-to-r from-pink-50 to-red-50 border-l-4 border-red-500";
      case "medium":
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500";
      case "low":
        return "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500";
      default:
        return "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500";
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getDueDateInfo = (dueDate, isCompleted) => {
    if (!dueDate) {
      return {
        className: "text-gray-600",
        icon: "📅",
        text: "No due date",
      };
    }

    const expired = isTaskExpired(dueDate);

    if (isCompleted) {
      return {
        className: "text-green-600",
        icon: "✓",
        text: "Completed",
      };
    } else if (expired) {
      return {
        className: "text-red-600 font-medium",
        icon: "⚠️",
        text: "Expired",
      };
    } else {
      try {
        const today = new Date();
        const due = new Date(dueDate);
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          return {
            className: "text-red-600 font-medium",
            icon: "🔥",
            text: "Due today",
          };
        } else if (diffDays === 1) {
          return {
            className: "text-orange-600",
            icon: "⏰",
            text: "Due tomorrow",
          };
        } else if (diffDays <= 3) {
          return {
            className: "text-orange-600",
            icon: "⏰",
            text: `${diffDays} days left`,
          };
        } else {
          return {
            className: "text-gray-600",
            icon: "📅",
            text: `${diffDays} days left`,
          };
        }
      } catch {
        return {
          className: "text-gray-600",
          icon: "📅",
          text: "Due date set",
        };
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header userName={userName} userData={userData} userLogout={userLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <MetricsCards metrics={userData.metrics} />

            <div className="mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Tasks</h2>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200 overflow-x-auto">
                    <button
                      onClick={() => setStatusFilter("All")}
                      className={`px-3 py-1 text-sm rounded-md transition-all whitespace-nowrap ${
                        statusFilter === "All" 
                          ? "bg-indigo-100 text-indigo-700 font-medium" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      All ({tasks.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter("Pending")}
                      className={`px-3 py-1 text-sm rounded-md transition-all whitespace-nowrap ${
                        statusFilter === "Pending" 
                          ? "bg-yellow-100 text-yellow-700 font-medium" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Pending ({pending})
                    </button>
                    <button
                      onClick={() => setStatusFilter("In Progress")}
                      className={`px-3 py-1 text-sm rounded-md transition-all whitespace-nowrap ${
                        statusFilter === "In Progress" 
                          ? "bg-blue-100 text-blue-700 font-medium" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      In Progress ({inProgress})
                    </button>
                    <button
                      onClick={() => setStatusFilter("Completed")}
                      className={`px-3 py-1 text-sm rounded-md transition-all whitespace-nowrap ${
                        statusFilter === "Completed" 
                          ? "bg-green-100 text-green-700 font-medium" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Completed ({completed})
                    </button>
                  </div>

                  <div className="hidden lg:flex gap-2 text-sm">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span> High
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Medium
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span> Low
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="p-8 text-center bg-white rounded-lg shadow">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                    <p className="text-gray-500 text-lg mt-4">Loading tasks...</p>
                  </div>
                ) : filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const isCompleted = task.status === "Completed";
                    const dueDateInfo = getDueDateInfo(task.dueDate, isCompleted);

                    return (
                      <div 
                        key={task._id} 
                        className={`p-5 rounded-lg shadow-md hover:shadow-lg transition-all ${getPriorityColor(task.priority)}`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 w-full">
                            <div className="flex items-center flex-wrap gap-2">
                              <h3 className={`text-lg font-bold ${
                                isCompleted 
                                  ? "line-through text-gray-500" 
                                  : "text-gray-800"
                              }`}>
                                {task.title || "Untitled Task"}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(task.status)}`}>
                                {task.status || "Unknown"}
                              </span>
                            </div>

                            <p className={`mt-2 text-sm ${
                              isCompleted 
                                ? "text-gray-400" 
                                : "text-gray-600"
                            }`}>
                              {task.description || "No description provided"}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-3">
                              <span className="inline-flex items-center text-xs font-medium">
                                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                  task.priority?.toLowerCase() === "high" 
                                    ? "bg-red-500" 
                                    : task.priority?.toLowerCase() === "medium" 
                                    ? "bg-yellow-500" 
                                    : "bg-green-500"
                                }`}></span>
                                {task.priority || "Normal"} Priority
                              </span>

                              <span className={`inline-flex items-center text-xs font-medium ${dueDateInfo.className}`}>
                                <span className="mr-1">{dueDateInfo.icon}</span>
                                {task.dueDate 
                                  ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    }) 
                                  : "No date"
                                } • {dueDateInfo.text}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenModal(task)}
                            disabled={isCompleted}
                            className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all whitespace-nowrap ${
                              isCompleted 
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow"
                            }`}
                          >
                            {isCompleted ? "Completed" : "Update"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center bg-white rounded-lg shadow">
                    {tasks.length > 0 ? (
                      <>
                        <div className="text-5xl mb-3">🔍</div>
                        <p className="text-gray-500 text-lg font-medium">
                          No {statusFilter.toLowerCase()} tasks found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try changing the filter to see more tasks
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-5xl mb-3">📋</div>
                        <p className="text-gray-500 text-lg font-medium">
                          No tasks assigned yet
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Tasks will appear here when they're assigned to you
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && selectedTask && (
        <TaskUpdateModal 
          task={selectedTask} 
          onClose={handleCloseModal} 
          onUpdate={handleTaskUpdate} 
        />
      )}
    </div>
  );
};

export default UserDashboard;