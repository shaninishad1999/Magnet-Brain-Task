import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import toast from "react-hot-toast"; // Changed from react-toastify to react-hot-toast
import { createTask } from "../../api/taskapi";

const NewTask = ({ show, handleClose, user, onTaskAssigned }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");

  const handleAssign = async () => {
    if (!title || !dueDate) {
      toast.error("Title and due date are required.");
      return;
    }

    const taskData = {
      title,
      description,
      priority,
      status,
      dueDate,
      assignee: user._id, // ✅ Correct: MongoDB ObjectId
    };

    try {
      await createTask(taskData); // ✅ Await added
      toast.success("✅ Task assigned successfully!");

      if (onTaskAssigned) {
        onTaskAssigned(user._id);
      }

      // Clear form and close modal
      setTitle("");
      setDescription("");
      setDueDate("");
      handleClose();
    } catch (err) {
      console.error("Task creation error:", err);
      toast.error("❌ Failed to assign task.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign Task to {user.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Status</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Priority</Form.Label>
            <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleAssign}>Assign Task</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewTask;