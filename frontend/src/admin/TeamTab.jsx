import React, { useEffect, useState } from "react";
import { Card, Button, Badge, Container, Row, Col } from "react-bootstrap";
import AddTeamMemberModal from "./teamtab/AddTeamMemberModal";
import ViewTeamMemberModal from "./teamtab/ViewTeamMemberModal";
import ViewAssignedTasksModal from "./teamtab/ViewAssignedTasksModal";
import NewTask from "./task/NewTask"; 
import ConfirmDeleteModal from "./teamtab/ConfirmDeleteModal";
import { userDisplay, userDelete } from "../api/AdminCreateUserAllApi";
import { toast } from "react-toastify";

const TeamTab = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const fetchTeamMembers = async () => {
    try {
      const users = await userDisplay();
    
  
      if (!Array.isArray(users)) return;
  
      // Log image URLs separately
      users.forEach((user, index) => {
        
      });
  
      const formattedUsers = users.map((user, index) => ({
        _id: user._id,
        id: index + 1,
        name: user.name || "No Name",
        role: user.role || "No Role",
        email: user.email || "No Email",
        phone: user.phone || "N/A",
        department: user.department || "N/A",
        userid: user.userid || "No ID",
        imageUrl: user.image ? `http://localhost:5000/${user.image.replace(/\\/g, '/')}` : "",
        tasks: user.tasks || 0,
      }));
  
      setTeamMembers(formattedUsers);
      console.log("Formatted Users:", formattedUsers);
  
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };
  
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleCloseAddModal = () => setShowAddModal(false);
  const handleShowAddModal = () => setShowAddModal(true);

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedMember(null);
  };

  const handleShowViewModal = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleAddTeamMember = (newMember) => {
    const newMemberWithId = {
      ...newMember,
      id: teamMembers.length + 1,
      tasks: 0,
    };
    setTeamMembers([...teamMembers, newMemberWithId]);
    handleCloseAddModal();
  };

  const handleShowDeleteModal = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    
    setIsDeleting(true);
    try {
      await userDelete(memberToDelete._id);
      setTeamMembers(prevMembers => prevMembers.filter(member => member._id !== memberToDelete._id));
      toast.success("Team member removed successfully");
      handleCloseDeleteModal();
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to remove team member";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateMember = (updatedMember) => {
    setTeamMembers(
      teamMembers.map(member =>
        member._id === updatedMember._id ? updatedMember : member
      )
    );
  };

  const handleAssignTaskClick = (member) => {
    setSelectedMember(member);
    setShowAssignTaskModal(true);
  };

  // Handler for showing the tasks modal
  const handleShowTasksModal = (member) => {
    setSelectedMember(member);
    setShowTasksModal(true);
  };

  // Handler for closing the tasks modal
  const handleCloseTasksModal = () => {
    setShowTasksModal(false);
    setSelectedMember(null);
  };

  // Update this function to instantly increment the task count
  const handleTaskAssigned = () => {
    // Immediately update the task count for the selected member
    setTeamMembers(prevMembers => 
      prevMembers.map(member => 
        member._id === selectedMember._id 
          ? { ...member, tasks: member.tasks + 1 } 
          : member
      )
    );
    
    toast.success("✅ Task assigned successfully");
    handleCloseAssignTaskModal();
    
    // Optionally, you can still fetch from backend to ensure data consistency
    // but the UI will already be updated
    fetchTeamMembers();
  };
  
  const handleCloseAssignTaskModal = () => {
    setShowAssignTaskModal(false);
    setSelectedMember(null);
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="bg-primary text-white d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <h5 className="mb-0">Team Management</h5>
          <Button variant="light" size="sm" onClick={handleShowAddModal}>
            + Add Team Member
          </Button>
        </Card.Header>

        <Card.Body>
          {teamMembers.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-people" style={{ fontSize: "2rem" }}></i>
              <p className="mt-2">No team members found. Add team members to get started.</p>
            </div>
          ) : (
            teamMembers.map((member) => (
              <Card key={member._id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Row className="align-items-center text-center text-sm-start">
                    
                    <Col xs={12} sm={2} md={1} className="mb-2 mb-sm-0 d-flex justify-content-center">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            backgroundColor: "#6c757d",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2rem",
                          }}
                        >
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </Col>

                    <Col xs={12} sm={6} md={6}>
                      <h6 className="mb-1">{member.name}</h6>
                      <small className="text-muted">{member.role}</small>
                    </Col>

                    <Col xs={12} sm={4} md={5}>
                      <div className="d-flex flex-wrap justify-content-center justify-content-sm-end gap-2 mt-2 mt-sm-0">
                        <Badge 
                          bg="info" 
                          style={{ cursor: "pointer" }}
                          onClick={() => handleShowTasksModal(member)}
                        >
                          Assigned Tasks: {member.tasks}
                        </Badge>
                        <Button variant="outline-primary" size="sm" onClick={() => handleShowViewModal(member)}>View</Button>
                        <Button variant="outline-success" size="sm" onClick={() => handleAssignTaskClick(member)}>Assign Task</Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleShowDeleteModal(member)}
                          className="position-relative"
                        >
                          Remove
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>

      <AddTeamMemberModal
        show={showAddModal}
        handleClose={handleCloseAddModal}
        handleAddTeamMember={handleAddTeamMember}
      />

      {selectedMember && (
        <ViewTeamMemberModal
          show={showViewModal}
          handleClose={handleCloseViewModal}
          member={selectedMember}
          updateMember={handleUpdateMember}
        />
      )}

      {selectedMember && (
        <NewTask
          show={showAssignTaskModal}
          handleClose={handleCloseAssignTaskModal}
          user={selectedMember}
          onTaskAssigned={handleTaskAssigned}
        />
      )}

      {selectedMember && (
        <ViewAssignedTasksModal
          show={showTasksModal}
          handleClose={handleCloseTasksModal}
          user={selectedMember}
        />
      )}

      {memberToDelete && (
        <ConfirmDeleteModal
          show={showDeleteModal}
          handleClose={handleCloseDeleteModal}
          handleConfirm={handleConfirmDelete}
          memberName={memberToDelete.name}
          isDeleting={isDeleting}
        />
      )}
    </Container>
  );
};

export default TeamTab;