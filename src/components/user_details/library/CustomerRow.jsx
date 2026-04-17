import React from 'react';
import { HiOutlineMail, HiOutlinePhone, HiOutlineTrash } from 'react-icons/hi';

const CustomerRow = ({ user, onDelete, onViewLogs, styles }) => {
    return (
        <tr style={styles.tr}>
            <td style={styles.td}>
                <div style={styles.primaryText}>{user.firstName} {user.lastName}</div>
                <div style={styles.secondaryText}>{user.companyName}</div>
            </td>
            <td style={styles.td}>
                <div style={styles.iconRow}><HiOutlineMail /> {user.email}</div>
                <div style={styles.iconRow}><HiOutlinePhone /> {user.mobileNumber}</div>
            </td>
            <td style={styles.td}>
                <button 
                    style={styles.logTrigger} 
                    onClick={() => onViewLogs(user.logLibrary)}
                >
                    View {user.logLibrary?.length || 0} Logs
                </button>
            </td>
            <td style={styles.td}>
                <button 
                    style={styles.deleteBtn}
                    onClick={() => onDelete(user._id)}
                >
                    <HiOutlineTrash />
                </button>
            </td>
        </tr>
    );
};

export default CustomerRow;