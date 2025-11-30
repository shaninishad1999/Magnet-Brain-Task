// src/admin/task/ViewAssignedTasksModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, ListGroup, Spinner } from "react-bootstrap";
import { getUserTasks } from "../../api/taskapi";

const ViewAssignedTasksModal = ({ show, handleClose, user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Render pill with background color for priority (High/Medium/Default)
  const PriorityPill = ({ priority }) => {
    const text = priority || "Normal";
    // Semantic mapping to match TaskDetails/TasksTab:
    // High -> red, Medium -> yellow, Default -> neutral (grey)
    const className =
      priority === "High"
        ? "px-2 py-1 rounded-pill text-white bg-danger"
        : priority === "Medium"
        ? "px-2 py-1 rounded-pill text-dark bg-warning"
        : "px-2 py-1 rounded-pill text-white bg-secondary";
    return (
      <span className={className} style={{ fontSize: "0.75rem" }}>
        {text}
      </span>
    );
  };

  // Render pill with background color for status (Completed/In Progress/Pending)
  const StatusPill = ({ status }) => {
    const text = status || "Pending";
    // Semantic mapping to match TaskDetails/TasksTab:
    // Completed -> green, In Progress -> blue, Pending/other -> yellow
    const className =
      status === "Completed"
        ? "px-2 py-1 rounded-pill text-white bg-success"
        : status === "In Progress"
        ? "px-2 py-1 rounded-pill text-white bg-primary"
        : "px-2 py-1 rounded-pill text-dark bg-warning";
    return (
      <span className={className} style={{ fontSize: "0.75rem" }}>
        {text}
      </span>
    );
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
            {tasks.map((task) => (
              <ListGroup.Item key={task._id} className="border-bottom py-3">
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
            ))}
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
