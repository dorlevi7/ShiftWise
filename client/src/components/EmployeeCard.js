// React core hook for lifecycle methods like componentDidMount
import React, { useEffect } from 'react';

const EmployeeCard = ({ employee, isOpen, onToggle, onEdit, onDelete, loggedUser }) => {

    // Scrolls to the top of the page when the component mounts
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    return (
        <div
            className={`employee-card ${isOpen ? 'open' : 'closed'}`}
            onClick={() => onToggle(employee.id)}
        >
            <h3>{employee.name}</h3>
            {isOpen && (
                <div className="employee-details-horizontal">
                    <img
                        src={employee.photoData || '/images/Profile.jpeg'}
                        alt={`${employee.name}'s profile`}
                        className="employee-photo-horizontal"
                    />

                    <div className="employee-info">
                        <p>Email: {employee.email}</p>
                        <p>Phone: {employee.phone}</p>
                        <p>Role: {employee.role}</p>
                        <div className="employee-actions">
                            <button
                                className="action-button edit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(employee);
                                }}
                            >
                                Edit
                            </button>
                            {employee.id !== loggedUser?.user?.id && (
                                <button
                                    className="action-button delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(employee);
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeCard;
