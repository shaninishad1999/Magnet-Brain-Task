import React, { useEffect, useState } from "react";
import { Card, Button, Badge, Container, Row, Col } from "react-bootstrap";
import AddTeamMemberModal from "./teamtab/AddTeamMemberModal";
import ViewTeamMemberModal from "./teamtab/ViewTeamMemberModal";
import ViewAssignedTasksModal from "./teamtab/ViewAssignedTasksModal";
import NewTask from "./task/NewTask";
import ConfirmDeleteModal from "./teamtab/ConfirmDeleteModal";
import { userDisplay, userDelete } from "../api/AdminCreateUserAllApi";
import { getUserTasks } from "../api/taskapi"; // <-- new import
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

  // helper: assign sequential IDs starting from 1
  const withSequentialIds = (usersArray) =>
    usersArray.map((u, idx) => ({
      _id: u._id,
      id: idx + 1,
      name: u.name || "No Name",
      role: u.role || "No Role",
      email: u.email || "No Email",
      phone: u.phone || "N/A",
      department: u.department || "N/A",
      userid: u.userid || "No ID",
      imageUrl: u.image ? `http://localhost:5000/${u.image.replace(/\\/g, "/")}` : "",
      // keep tasks as placeholder — we'll overwrite with real counts below
      tasks: Number(u.tasks) || 0,
    }));

  // Fetch users and then fetch each user's real task count from tasks API
  const fetchTeamMembers = async () => {
    try {
      const users = await userDisplay();
      if (!Array.isArray(users)) return;

      const baseUsers = withSequentialIds(users);

      // For each user, fetch their tasks count concurrently
      const countPromises = baseUsers.map(async (u) => {
        try {
          const tasksResponse = await getUserTasks(u._id); // returns array of tasks
          // tasksResponse may be an array or { data: [...] }
          const list = Array.isArray(tasksResponse) ? tasksResponse : tasksResponse?.data ?? [];
          const count = Array.isArray(list) ? list.length : 0;
          return { _id: u._id, tasks: count };
        } catch (err) {
          // if per-user fetch fails, fallback to stored user.tasks
          console.warn(`Failed to fetch tasks for user ${u._id}:`, err);
          return { _id: u._id, tasks: Number(u.tasks) || 0 };
        }
      });

      const counts = await Promise.all(countPromises);
      // Merge counts into baseUsers
      const merged = baseUsers.map((u) => {
        const found = counts.find((c) => c._id === u._id);
        return { ...u, tasks: Math.max(Number(found?.tasks ?? u.tasks) || 0, 0) };
      });

      setTeamMembers(merged);
      console.log("Formatted Users with counts:", merged);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const reindexAndSet = (members) => {
    setTeamMembers(members.map((m, i) => ({ ...m, id: i + 1 })));
  };

  const handleCloseAddModal = () => setShowAddModal(false);
  const handleShowAddModal = () => setShowAddModal(true);

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedMember(null);
  };

  const handleShowViewModal = (member) => {
    // ensure 'id' present on selectedMember
    setSelectedMember((prev) => ({ ...(member || prev), id: member?.id ?? prev?.id }));
    setShowViewModal(true);
  };

 const handleAddTeamMember = async (newMember) => {
  // If newMember already has the real _id from backend response
  if (!newMember._id || newMember._id.startsWith('local-')) {
    // No real _id yet, refresh from server
    handleCloseAddModal();
    await fetchTeamMembers();
    toast.success("Team member added successfully");
  } else {
    // Has real _id, safe to add to local state
    const newMemberWithId = {
      _id: newMember._id,
      id: teamMembers.length + 1,
      name: newMember.name || "No Name",
      role: newMember.role || "No Role",
      email: newMember.email || "No Email",
      phone: newMember.phone || "N/A",
      department: newMember.department || "N/A",
      userid: newMember.userid || "No ID",
      imageUrl: newMember.imageUrl || "",
      tasks: 0, // New user has 0 tasks initially
    };
    setTeamMembers((prev) => [...prev, newMemberWithId]);
    handleCloseAddModal();
    toast.success("Team member added successfully");
  }
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
      // backend delete
      await userDelete(memberToDelete._id);

      // remove from list and reindex
      const remaining = teamMembers.filter((m) => m._id !== memberToDelete._id);
      reindexAndSet(remaining);

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
    // preserve sequential id for updated member
    setTeamMembers((prev) =>
      prev.map((m) => (m._id === updatedMember._id ? { ...m, ...updatedMember, id: m.id } : m))
    );

    // keep selectedMember in sync if it's the same member
    if (selectedMember && selectedMember._id === updatedMember._id) {
      setSelectedMember((prev) => ({ ...prev, ...updatedMember }));
    }
  };

  const handleAssignTaskClick = (member) => {
    setSelectedMember(member);
    setShowAssignTaskModal(true);
  };

  const handleShowTasksModal = (member) => {
    setSelectedMember(member);
    setShowTasksModal(true);
  };

  const handleCloseTasksModal = () => {
    setShowTasksModal(false);
    setSelectedMember(null);
  };

  // After NewTask completes it should call onTaskAssigned.
  // Instead of only doing optimistic +1, refresh full list counts from server.
  const handleTaskAssigned = async () => {
    if (!selectedMember) return;

    toast.success("✅ Task assigned successfully (updating counts...)");

    // close modal first
    handleCloseAssignTaskModal();

    // Refresh members and their accurate task counts from server
    await fetchTeamMembers();
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
                          {member.name ? member.name.charAt(0) : "U"}
                        </div>
                      )}
                    </Col>

                    <Col xs={12} sm={6} md={6}>
                      <h6 className="mb-1">
                        {member.name} <small className="text-muted">#{member.id}</small>
                      </h6>
                      <small className="text-muted">{member.role}</small>
                    </Col>

                    <Col xs={12} sm={4} md={5}>
                      <div className="d-flex flex-wrap justify-content-center justify-content-sm-end gap-2 mt-2 mt-sm-0">
                        <Badge bg="info" style={{ cursor: "pointer" }} onClick={() => handleShowTasksModal(member)}>
                          Assigned Tasks: {Math.max(Number(member.tasks) || 0, 0)}
                        </Badge>
                        <Button variant="outline-primary" size="sm" onClick={() => handleShowViewModal(member)}>
                          View
                        </Button>
                        <Button variant="outline-success" size="sm" onClick={() => handleAssignTaskClick(member)}>
                          Assign Task
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleShowDeleteModal(member)} className="position-relative">
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

      <AddTeamMemberModal show={showAddModal} handleClose={handleCloseAddModal} handleAddTeamMember={handleAddTeamMember} />

      {selectedMember && (
        <ViewTeamMemberModal show={showViewModal} handleClose={handleCloseViewModal} member={selectedMember} updateMember={handleUpdateMember} />
      )}

      {selectedMember && (
        <NewTask show={showAssignTaskModal} handleClose={handleCloseAssignTaskModal} user={selectedMember} onTaskAssigned={handleTaskAssigned} />
      )}

      {selectedMember && <ViewAssignedTasksModal show={showTasksModal} handleClose={handleCloseTasksModal} user={selectedMember} />}

      {memberToDelete && (
        <ConfirmDeleteModal show={showDeleteModal} handleClose={handleCloseDeleteModal} handleConfirm={handleConfirmDelete} memberName={memberToDelete.name} isDeleting={isDeleting} />
      )}
    </Container>
  );
};

export default TeamTab;
