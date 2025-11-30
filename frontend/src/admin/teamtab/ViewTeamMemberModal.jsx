import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Row, Col, Image, Badge } from "react-bootstrap";
import toast from "react-hot-toast";
import { userUpdate } from "../../api/AdminCreateUserAllApi";

const ViewTeamMemberModal = ({ show, handleClose, member, updateMember }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (member) {
      // Make sure all member properties are properly initialized in formData
      setFormData({
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        role: member.role || "",
        department: member.department || "",
        userid: member.userid || "",
        image: null,
        tasks: member.tasks || 0,
        _id: member._id,
        imageUrl: member.imageUrl || null
      });
      
      // Set the image preview directly from the member's imageUrl
      setImagePreview(member.imageUrl || null);
      setEditMode(false);
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleUpdate = async () => {
    try {
      const submissionData = new FormData();
      
      // Add all form fields that match the backend expectations
      submissionData.append("name", formData.name);
      submissionData.append("email", formData.email);
      submissionData.append("phone", formData.phone);
      submissionData.append("userid", formData.userid);
      submissionData.append("role", formData.role);
      submissionData.append("department", formData.department);
      
      // Add the image if available
      if (formData.image instanceof File) {
        submissionData.append("image", formData.image);
      }

      // First update the UI immediately for a responsive experience
      const updatedMember = {
        ...member,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        userid: formData.userid,
        role: formData.role,
        department: formData.department,
        tasks: formData.tasks,
        _id: formData._id
      };
      
      // If there's a new image preview, update it immediately in the UI
      if (imagePreview && formData.image instanceof File) {
        // This is temporary for immediate UI feedback
        updatedMember.imageUrl = imagePreview;
      } else {
        updatedMember.imageUrl = formData.imageUrl;
      }
      
      // Update the UI immediately
      updateMember(updatedMember);
      
      // Then make the API call
      const res = await userUpdate(member._id, submissionData);
      
      // If the server returns an updated image URL, update it in the state
      if (res.data && res.data.image) {
        const serverImageUrl = `http://localhost:5000/${res.data.image.replace(/\\/g, '/')}`;
        
        // Update the member again with the correct server URL
        updateMember({
          ...updatedMember,
          imageUrl: serverImageUrl
        });
      }
      
      toast.success("✅ Team member updated successfully");
      setEditMode(false);
      handleClose();
    } catch (err) {
      toast.error("❌ Update failed: " + (err?.response?.data?.message || err.message));
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Developer": return "primary";
      case "Designer": return "info";
      case "Manager": return "success";
      case "Marketer": return "warning";
      case "Support": return "secondary";
      case "Frontend Developer": return "primary";
      case "Backend Developer": return "info";
      case "UI/UX Designer": return "info";
      case "Project Manager": return "success";
      case "HR": return "warning";
      case "QA Engineer": return "secondary";
      default: return "dark";
    }
  };

  // Get department badge color
  const getDepartmentBadgeColor = (dept) => {
    switch (dept) {
      case "Development": return "primary";
      case "Design": return "info";
      case "Management": return "success";
      case "Marketing": return "warning";
      case "Sales": return "danger";
      case "Support": return "secondary";
      default: return "dark";
    }
  };

  // Function to check if we have Frontend Developer, Backend Developer roles
  const isExtendedRoleList = () => {
    if (!member || !member.role) return false;
    
    return ["Frontend Developer", "Backend Developer", "UI/UX Designer", 
           "Project Manager", "HR", "QA Engineer"].includes(member.role);
  };

  // Determine which role options to show
  const getRoleOptions = () => {
    // If the member already has one of the extended roles, show that list
    if (isExtendedRoleList()) {
      return (
        <>
          <option value="">Select Role</option>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="UI/UX Designer">UI/UX Designer</option>
          <option value="Project Manager">Project Manager</option>
          <option value="HR">HR</option>
          <option value="QA Engineer">QA Engineer</option>
        </>
      );
    }
    
    // Otherwise show the original list
    return (
      <>
        <option value="">Select Role</option>
        <option value="Developer">Developer</option>
        <option value="Designer">Designer</option>
        <option value="Manager">Manager</option>
        <option value="Marketer">Marketer</option>
        <option value="Support">Support</option>
      </>
    );
  };

  if (!member) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className={editMode ? "bg-light" : "bg-primary text-white"}>
        <Modal.Title>{editMode ? "Edit Team Member" : "View Team Member"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={editMode ? "" : "bg-light"}>
        <Row>
          <Col md={4} className="text-center mb-3">
            <div className="position-relative">
              {isImageLoading ? (
                <div className="spinner-border text-primary" role="status" style={{ width: '150px', height: '150px' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : imagePreview ? (
                <div style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: editMode ? "2px solid #ccc" : "4px solid #007bff",
                  boxShadow: editMode ? "none" : "0 4px 8px rgba(0,0,0,0.1)",
                  margin: "0 auto"
                }}>
                  <Image
                    src={imagePreview}
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover"
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    backgroundColor: editMode ? "#e9ecef" : "#007bff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    fontWeight: "bold",
                    color: editMode ? "#6c757d" : "#ffffff",
                    margin: "0 auto",
                    boxShadow: editMode ? "none" : "0 4px 8px rgba(0,0,0,0.1)"
                  }}
                >
                  {member.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {editMode && (
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="mt-3"
                />
              )}
            </div>
          </Col>

          <Col md={8}>
            {editMode ? (
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>User ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="userid"
                        value={formData.userid}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      >
                        {getRoleOptions()}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
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

                <Form.Group className="mb-3">
                  <Form.Label>Assigned Tasks</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tasks || "0"}
                    disabled
                  />
                </Form.Group>
              </Form>
            ) : (
              <div className="view-member-details p-3" style={{backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"}}>
                <h3 className="mb-3 text-primary">{member.name}</h3>
                
                <div className="d-flex align-items-center mb-3">
                  <Badge bg={getRoleBadgeColor(member.role)} className="me-2 p-2">{member.role}</Badge>
                  <Badge bg={getDepartmentBadgeColor(member.department)} className="p-2">{member.department}</Badge>
                </div>
                
                <div className="info-item mb-2 d-flex">
                  <div style={{minWidth: "100px", fontWeight: "bold"}}>Email:</div>
                  <div className="text-break">{member.email}</div>
                </div>
                
                <div className="info-item mb-2 d-flex">
                  <div style={{minWidth: "100px", fontWeight: "bold"}}>Phone:</div>
                  <div>{member.phone || "Not provided"}</div>
                </div>
                
                <div className="info-item mb-2 d-flex">
                  <div style={{minWidth: "100px", fontWeight: "bold"}}>User ID:</div>
                  <div>{member.userid}</div>
                </div>
                
                <div className="info-item mb-2">
                  <div style={{fontWeight: "bold"}}>Assigned Tasks:</div>
                  <div className="mt-1 p-2 bg-light rounded">
                    {member.tasks || "No tasks currently assigned"}
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className={editMode ? "bg-light" : "bg-light"}>
        {editMode ? (
          <>
            <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button variant="success" onClick={handleUpdate}>Save Changes</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
            <Button variant="primary" onClick={() => setEditMode(true)}>Edit</Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ViewTeamMemberModal;