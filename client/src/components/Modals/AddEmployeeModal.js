// Import required libraries and styles
import Modal from 'react-modal';
import '../../styles/AddEmployeeModal.css';

// Modal for adding a new employee
function AddEmployeeModal({ isOpen, onClose, newEmployee, setNewEmployee, handleAddEmployee, isProcessing }) {
    // Handle input field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee((prev) => ({ ...prev, [name]: value }));
    };

    // Reset form and close modal
    const handleClose = () => {
        setNewEmployee({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'employee',
            photoFile: null
        });
        onClose();
    };

    return (
        // Modal component
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modal"
            overlayClassName="modal-overlay"
        >
            <h3>Add New Employee</h3>

            {/* Employee form */}
            <form className="addOrEdit-employee-form" onSubmit={handleAddEmployee}>
                {/* Name field */}
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={newEmployee.name}
                    onChange={handleChange}
                    required
                />
                {/* Email field */}
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleChange}
                    required
                />
                {/* Phone field */}
                <label>Phone:</label>
                <input
                    type="text"
                    name="phone"
                    value={newEmployee.phone}
                    onChange={handleChange}
                    required
                />
                {/* Password field */}
                <label>Password:</label>
                <input
                    type="password"
                    name="password"
                    value={newEmployee.password}
                    onChange={handleChange}
                    required
                />
                {/* Role select */}
                <label>Role:</label>
                <select name="role" value={newEmployee.role} onChange={handleChange}>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                </select>
                {/* Profile photo upload */}
                <label>Profile Photo:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setNewEmployee((prev) => ({
                            ...prev,
                            photoFile: e.target.files[0]
                        }))
                    }
                />
                {/* Preview of selected photo */}
                {newEmployee.photoFile && (
                    <div className="profile-photo-wrapper">
                        <img
                            src={URL.createObjectURL(newEmployee.photoFile)}
                            alt="Preview"
                            className="employee-photo-horizontal"
                        />
                    </div>
                )}
                {/* Submit and cancel buttons */}
                <button type="submit" disabled={isProcessing}>
                    {isProcessing ? 'Adding...' : 'Add Employee'}
                </button>
                <button type="button" onClick={handleClose} className="cancel-button">
                    Cancel
                </button>
            </form>
        </Modal>
    );
}

export default AddEmployeeModal;
