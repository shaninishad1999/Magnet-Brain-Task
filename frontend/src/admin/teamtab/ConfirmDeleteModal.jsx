
import { Modal, Button } from "react-bootstrap";

const ConfirmDeleteModal = ({ show, handleClose, handleConfirm, memberName, isDeleting }) => {
  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">Confirm Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to remove <strong>{memberName}</strong> from the team?
        </p>
        <p className="text-muted small">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleConfirm} 
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Removing...
            </>
          ) : (
            "Remove Member"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;