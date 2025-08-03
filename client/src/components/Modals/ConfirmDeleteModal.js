// Import modal component and styles
import Modal from 'react-modal';
import '../../styles/ConfirmDeleteModal.css';

// Modal for confirming deletion of an employee
function ConfirmDeleteModal({ isOpen, employeeName, onConfirm, onCancel }) {
    return (
        // Modal component configuration
        <Modal
            isOpen={isOpen} // Controls modal visibility
            onRequestClose={onCancel} // Allows closing modal by clicking outside
            className="confirm-delete-modal" // CSS class for modal content
            overlayClassName="modal-overlay" // CSS class for modal overlay
        >
            {/* Modal title */}
            <h2>Confirm Employee Deletion</h2>
            {/* Confirmation message with employee name */}
            <p>
                Are you sure you want to remove <strong>{employeeName}</strong> from the company?
            </p>
            {/* Confirm and Cancel buttons */}
            <div className="modal-buttons">
                <button className="confirm-button" onClick={onConfirm}>
                    Confirm
                </button>
                <button className="cancel-button" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </Modal>
    );
}

export default ConfirmDeleteModal;
