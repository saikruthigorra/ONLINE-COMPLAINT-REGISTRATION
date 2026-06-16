import { Link } from 'react-router-dom';
import { formatStatus, statusClass } from '../utils/status';

const ComplaintCard = ({ complaint }) => (
  <div className="card complaint-card h-100 shadow-sm border-0">
    <div className="card-body">
      <div className="d-flex justify-content-between gap-2 align-items-start">
        <h5 className="card-title mb-1">{complaint.title}</h5>
        <span className={`badge text-bg-${statusClass(complaint.status)}`}>{formatStatus(complaint.status)}</span>
      </div>
      <p className="text-muted small mb-2">{complaint.category} • {complaint.priority}</p>
      <p className="card-text line-clamp">{complaint.description}</p>
      <div className="small text-muted">
        Agent: {complaint.agent?.name || 'Not assigned'}<br />
        Created: {new Date(complaint.createdAt).toLocaleString()}
      </div>
    </div>
    <div className="card-footer bg-white border-0 pt-0">
      <Link to={`/complaints/${complaint._id}`} className="btn btn-outline-primary btn-sm">View details</Link>
    </div>
  </div>
);

export default ComplaintCard;
