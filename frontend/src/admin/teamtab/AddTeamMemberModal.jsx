import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Image, Row, Col, Spinner, Alert } from "react-bootstrap";
import toast from "react-hot-toast";
import { createUser } from "../../api/AdminCreateUserAllApi";

const AddTeamMemberModal = ({ show, handleClose, handleAddTeamMember, existingMembers = [] }) => {
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Reset form and errors when modal opens
    if (show) {
      // Removed localStorage retrieval to prevent using saved images
      setError(null);
    }
  }, [show]);

  useEffect(() => {
    if (formData.email === "auto@create.com") {
      handleSubmit({ preventDefault: () => {} });
    }
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user makes changes
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setPreview(imageData);
        // Removed localStorage saving line
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreview(null);
    // Removed localStorage removal line
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const checkForDuplicates = () => {
    // First check if we have existingMembers to compare against
    if (!existingMembers || existingMembers.length === 0) {
      return null;
    }

    // Check for duplicate email
    const duplicateEmail = existingMembers.find(
      member => member.email?.toLowerCase() === formData.email?.toLowerCase()
    );
    
    if (duplicateEmail) {
   
      return "Email already exists! Please use a different email address.";
    }

    // Check for duplicate userID
    const duplicateUserID = existingMembers.find(
      member => member.userid?.toLowerCase() === formData.userid?.toLowerCase()
    );
    
    if (duplicateUserID) {
    
      return "User ID already exists! Please choose a different User ID.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const requiredFields = ["name", "email", "userid", "role", "department"];
    const isEmptyField = requiredFields.some((field) => !formData[field]?.trim());

    if (isEmptyField) {
      const errorMessage = "Please fill in all required fields.";
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
      return;
    }

    // Check for duplicate email or userid
    const duplicateError = checkForDuplicates();
    if (duplicateError) {
      setError(duplicateError);
      toast.error(`❌ ${duplicateError}`);
      return;
    }

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        submissionData.append("image", value);
      } else if (value) {
        submissionData.append(key, value);
      }
    });

    // Set creating state to true
    setIsCreating(true);
    
    try {
     
      const res = await createUser(submissionData);
    
      
      toast.success("✅ User created successfully");
      
      // Use image URL temporarily without storing in localStorage
      let imageUrl = preview;
      if (res.data && res.data.imageUrl) {
        // If server returns an image URL, use that
        imageUrl = res.data.imageUrl;
        // Removed localStorage saving
      }

      const newTeamMember = {
        id: res.data?.id || res.data?._id || Date.now(),
        name: formData.name,
        role: formData.role,
        email: formData.email,
        phone: formData.phone || "",
        department: formData.department,
        userid: formData.userid,
        imageUrl: imageUrl,
      };

      handleAddTeamMember?.(newTeamMember);

      // Clear form
      setFormData({});
      setPreview(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      // No need to handle localStorage removal as we're not saving
      handleClose();

    } catch (err) {
      console.error("User creation error:", err);
      
      // Extract error message from response
      const errorResponse = err?.response?.data;
      const message = errorResponse?.message || err.message || "Unknown error";
    
      
      // Set specific error messages
      let errorMessage = message;
      
      if (message.includes("email already exists") || 
          (errorResponse?.errors && errorResponse.errors.email)) {
        errorMessage = "Email already exists! Please use a different email address.";
      } else if (message.includes("user ID already exists") || 
                (errorResponse?.errors && errorResponse.errors.userid)) {
        errorMessage = "User ID already exists! Please choose a different User ID.";
      } else {
        errorMessage = `Failed to create user: ${message}`;
      }
      
      // Set error state and show toast
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
      
    } finally {
      // Reset creating state
      setIsCreating(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Team Member</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Modal.Body>
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          {/* Loading State Message */}
          {isCreating && (
            <div className="alert alert-info d-flex align-items-center" role="alert">
              <Spinner animation="border" size="sm" className="me-2" />
              <div>Creating user, please wait...</div>
            </div>
          )}
          
          {/* Image Upload */}
          <div className="text-center mb-4">
            <div className="d-flex justify-content-center align-items-center gap-3">
              <div
                style={{ cursor: "pointer" }}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <Image
                    src={preview}
                    roundedCircle
                    width={120}
                    height={120}
                    style={{ objectFit: "cover", border: "2px solid #ccc" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      backgroundColor: "#f0f0f0",
                      border: "2px dashed #ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#888",
                    }}
                  >
                    Click to Upload
                  </div>
                )}
              </div>

              {preview && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleImageRemove}
                >
                  Remove Image
                </Button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  disabled={isCreating}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                  disabled={isCreating}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  disabled={isCreating}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="text"
                  name="userid"
                  value={formData.userid || ""}
                  onChange={handleChange}
                  placeholder="Enter user ID"
                  required
                  disabled={isCreating}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role || ""}
                  onChange={handleChange}
                  required
                  disabled={isCreating}
                >
                  <option value="">Select Role</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="HR">HR</option>
                  <option value="QA Engineer">QA Engineer</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  name="department"
                  value={formData.department || ""}
                  onChange={handleChange}
                  required
                  disabled={isCreating}
                >
                  <option value="">Select Department</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Management">Management</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isCreating}>
            {isCreating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creating...
              </>
            ) : (
              "Add Member"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddTeamMemberModal;