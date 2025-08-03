import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../styles/EditProfileModalCard.css';

import { isValidName, isValidEmail, isValidPhone } from '../../utils/validationUtils';

const EditProfileModal = ({ isOpen, onClose, profileUser, setProfileUser, onSubmit, title }) => {
    const [formErrors, setFormErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, phone } = profileUser;

        const newErrors = {};

        if (!isValidName(name)) newErrors.name = 'Invalid name.';
        if (!isValidEmail(email)) newErrors.email = 'Invalid email address.';
        if (!isValidPhone(phone)) newErrors.phone = 'Invalid phone number.';

        setFormErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(e); // No errors – proceed
        }
    };

    const handleRemovePhoto = () => {
        setProfileUser(prev => ({
            ...prev,
            photoData: '',
            photoFile: null
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modal"
            overlayClassName="modal-overlay"
        >
            <h3>{title}</h3>
            <form className="addOrEdit-employee-form" onSubmit={handleSubmit}>
                {/* Name input */}
                <label>Name:</label>
                <input
                    type="text"
                    value={profileUser.name}
                    onChange={(e) => setProfileUser(prev => ({ ...prev, name: e.target.value }))}
                    required
                />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}

                {/* Email input */}
                <label>Email:</label>
                <input
                    type="email"
                    value={profileUser.email}
                    onChange={(e) => setProfileUser(prev => ({ ...prev, email: e.target.value }))}
                    required
                />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}

                {/* Phone input */}
                <label>Phone:</label>
                <input
                    type="text"
                    value={profileUser.phone || ''}
                    onChange={(e) => setProfileUser(prev => ({ ...prev, phone: e.target.value }))}
                    required
                />
                {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}

                {/* Role selection dropdown */}
                <label>Role:</label>
                <select
                    value={profileUser.role}
                    onChange={(e) => setProfileUser(prev => ({ ...prev, role: e.target.value }))}
                >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                </select>

                {/* Profile photo file input */}
                <label>Profile Photo:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileUser(prev => ({ ...prev, photoFile: e.target.files[0] }))}
                />

                {(profileUser.photoFile || profileUser.photoData) && (
                    <div className="profile-photo-wrapper">
                        <img
                            src={
                                profileUser.photoFile
                                    ? URL.createObjectURL(profileUser.photoFile)
                                    : profileUser.photoData
                            }
                            alt="Preview"
                            className="employee-photo-horizontal"
                        />
                        <button type="button" onClick={handleRemovePhoto} className="remove-photo-button">
                            Remove Photo
                        </button>
                    </div>
                )}

                {/* Submit and cancel buttons */}
                <button type="submit">Save Changes</button>
                <button type="button" onClick={onClose} className="cancel-button">
                    Cancel
                </button>
            </form>
        </Modal>
    );
};

export default EditProfileModal;
