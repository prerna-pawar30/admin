import React from 'react';
import { HiX, HiOutlineDownload } from 'react-icons/hi';

const CustomerLogsModal = ({ logs, onClose, styles }) => {
    const groupDownloads = (logs) => {
        if (!logs || !Array.isArray(logs)) return [];
        const groups = {};
        logs.forEach(log => {
            if (!groups[log.libraryId]) {
                groups[log.libraryId] = { ...log, count: 0, latestDate: log.date };
            }
            groups[log.libraryId].count += 1;
            if (new Date(log.date) > new Date(groups[log.libraryId].latestDate)) {
                groups[log.libraryId].latestDate = log.date;
            }
        });
        return Object.values(groups);
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={{ margin: 0 }}>Download History</h3>
                    <button onClick={onClose} style={styles.closeBtn}><HiX /></button>
                </div>
                <div style={styles.modalBody}>
                    {groupDownloads(logs).map((lib, idx) => (
                        <div key={idx} style={styles.libraryBadge}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={styles.brandTag}>{lib.brandName}</span>
                                <span style={styles.categoryTag}>{lib.category}</span>
                            </div>
                            <div style={styles.downloadInfo}>
                                <span style={styles.countText}>
                                    <HiOutlineDownload /> {lib.count} Times
                                </span>
                                <span style={styles.libDate}>
                                    Last: {new Date(lib.latestDate).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomerLogsModal;