// src/admin/task/ViewAssignedTasksModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, ListGroup, Spinner } from "react-bootstrap";
import { getUserTasks } from "../../api/taskapi";

const ViewAssignedTasksModal = ({ show, handleClose, user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (show && user) {
      fetchUserTasks();
    } else if (!show) {
      // reset state when modal closes so next open is clean
      setTasks([]);
      setLoading(true);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, user]);

  const fetchUserTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      // API call to get tasks for the specific user
      const userTasks = await getUserTasks(user._id);

      // defensive handling: backend might return an array or { data: [...] }
      const list = Array.isArray(userTasks) ? userTasks : userTasks?.data ?? [];
      setTasks(list);
    } catch (err) {
      console.error("Error fetching user tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to format the date
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render pill with Tailwind-style classes for priority (High/Medium/Default)
  const PriorityPill = ({ priority }) => {
    const text = priority || "Normal";
    const tailwindClasses = getPriorityColor(priority);
    // Add spacing + border-radius to make it pill-like
    const className = `${tailwindClasses} border px-2 py-1 rounded-full text-xs font-medium inline-flex items-center`;
    return <span className={className}>{text}</span>;
  };

  // Render pill with Tailwind-style classes for status (Completed/In Progress/Pending)
  const StatusPill = ({ status }) => {
    const text = status || "Pending";
    const tailwindClasses = getStatusColor(status);
    const className = `${tailwindClasses} border px-2 py-1 rounded-full text-xs font-medium inline-flex items-center`;
    return <span className={className}>{text}</span>;
  };

  return (
    // `scrollable` makes the modal body scrollable while keeping header/footer fixed
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Tasks Assigned to {user?.name ?? "User"}</Modal.Title>
      </Modal.Header>

      {/* Constrain body height so it scrolls nicely on smaller screens */}
      <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 8 }}>
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="text-center my-3">
            <p>No tasks assigned to this user yet.</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {tasks.map((task) => {
              const id = task._id ?? task.id;
              return (
                <ListGroup.Item key={id} className="border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div style={{ maxWidth: "70%" }}>
                      <h6 className="mb-1">{task.title}</h6>
                      <p className="mb-1 text-muted small" style={{ whiteSpace: "pre-wrap" }}>
                        {task.description || ""}
                      </p>

                      <div className="d-flex mt-2 gap-3 align-items-center">
                        <small className="text-muted d-flex align-items-center" style={{ gap: 8 }}>
                          <strong>Priority:</strong>
                          <PriorityPill priority={task.priority} />
                        </small>

                        <small className="text-muted d-flex align-items-center" style={{ gap: 8 }}>
                          <strong>Status:</strong>
                          <StatusPill status={task.status} />
                        </small>
                      </div>
                    </div>

                    <div className="text-end" style={{ minWidth: 140 }}>
                      <small className="text-muted d-block">Due: {formatDate(task.dueDate)}</small>
                      <small className="text-muted d-block">Created: {formatDate(task.createdAt)}</small>
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Modal.Body>

      {/* Footer stays fixed due to `scrollable` */}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewAssignedTasksModal;
