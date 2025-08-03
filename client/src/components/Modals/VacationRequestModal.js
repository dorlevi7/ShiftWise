// External dependencies
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// VacationRequestModal component
const VacationRequestModal = ({
    isOpen,                        // Boolean: whether the modal is open
    onClose,                       // Function to close the modal
    vacationStartDate,            // State: start date of vacation
    vacationEndDate,              // State: end date of vacation
    setVacationStartDate,         // Setter for start date
    setVacationEndDate,           // Setter for end date
    handleVacationRequestSubmit,  // Function to handle form submission
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modal"
            overlayClassName="modal-overlay"
        >
            {/* Modal title */}
            <h3>Vacation Request</h3>

            {/* Vacation request form */}
            <form onSubmit={handleVacationRequestSubmit} className="addOrEdit-employee-form">
                <label>Select Vacation Range:</label>

                {/* Date range picker using react-datepicker */}
                <DatePicker
                    selectsRange // Enables range selection
                    startDate={vacationStartDate}
                    endDate={vacationEndDate}
                    onChange={([start, end]) => {
                        setVacationStartDate(start); // Update start date
                        setVacationEndDate(end); // Update end date
                    }}
                    dateFormat="dd/MM/yyyy" // Display format for selected dates
                    placeholderText="Select vacation dates"
                    className="datepicker" // Custom CSS class
                    isClearable // Allows clearing the selected range
                />

                {/* Buttons for submit and cancel */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button type="submit" className="submit-button">Submit</button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default VacationRequestModal;
