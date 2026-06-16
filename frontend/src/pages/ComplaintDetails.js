import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { formatStatus, statusClass } from '../utils/status';

const statusOptions = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'REJECTED', 'CLOSED'];

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateStatus, addMessage } = useComplaints();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [statusForm, setStatusForm] = useState({ status: '', note: '', resolution: '' });

  const loadComplaint = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.complaint);
      setStatusForm((prev) => ({ ...prev, status: data.complaint.status }));
    } catch (error) {
      if (!silent) toast.error(getErrorMessage(error));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
    const timer = setInterval(() => loadComplaint(true), 10000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    try {
      const updated = await addMessage(id, message.trim());
      setComplaint(updated);
      setMessage('');
      toast.success('Message sent');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const submitStatus = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...statusForm, status: user.role === 'USER' ? 'CLOSED' : selectedStatusValue };
      const updated = await updateStatus(id, payload);
      setComplaint(updated);
      toast.success('Status updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) return <div className="container py-5 text-center"><div className="spinner-border text-primary" /></div>;
  if (!complaint) return <div className="container py-5"><div className="alert alert-warning">Complaint not found.</div></div>;

  const canUpdateStatus = user.role === 'ADMIN' || (user.role === 'AGENT' && complaint.agent?._id === user.id) || (user.role === 'USER' && complaint.user?._id === user.id && complaint.status === 'RESOLVED');
  const canGiveFeedback = user.role === 'USER' && ['RESOLVED', 'CLOSED'].includes(complaint.status);
  const availableStatuses = user.role === 'USER'
    ? ['CLOSED']
    : user.role === 'AGENT'
      ? ['IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'REJECTED']
      : statusOptions;
  const selectedStatusValue = availableStatuses.includes(statusForm.status) ? statusForm.status : availableStatuses[0];

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">{complaint.title}</h1>
          <p className="text-muted mb-0">Complaint ID: {complaint._id}</p>
        </div>
        <div className="d-flex gap-2">
          <span className={`badge fs-6 text-bg-${statusClass(complaint.status)}`}>{formatStatus(complaint.status)}</span>
          {canGiveFeedback && <Link className="btn btn-success btn-sm" to={`/complaints/${complaint._id}/feedback`}>Give feedback</Link>}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold">Complaint information</h5>
              <p>{complaint.description}</p>
              <div className="row g-3 small">
                <div className="col-md-3"><span className="text-muted">Category</span><br /><strong>{complaint.category}</strong></div>
                <div className="col-md-3"><span className="text-muted">Priority</span><br /><strong>{complaint.priority}</strong></div>
                <div className="col-md-3"><span className="text-muted">Submitted by</span><br /><strong>{complaint.user?.name}</strong></div>
                <div className="col-md-3"><span className="text-muted">Agent</span><br /><strong>{complaint.agent?.name || 'Not assigned'}</strong></div>
              </div>
              {complaint.resolution && <div className="alert alert-success mt-4 mb-0"><strong>Resolution:</strong> {complaint.resolution}</div>}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Conversation</h5>
                <small className="text-muted">Auto-refreshes every 10 seconds</small>
              </div>
              <div className="chat-box mb-3">
                {complaint.messages?.length === 0 && <p className="text-muted">No messages yet.</p>}
                {complaint.messages?.map((item) => (
                  <div className={`chat-message ${item.sender?._id === user.id ? 'mine' : ''}`} key={item._id}>
                    <div>
                      <strong>{item.sender?.name || 'User'}</strong> <small className="text-muted">{item.sender?.role}</small>
                      <p>{item.message}</p>
                      <small className="text-muted">{new Date(item.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={submitMessage} className="d-flex gap-2">
                <input className="form-control" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message..." />
                <button className="btn btn-primary">Send</button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {canUpdateStatus && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold">Update workflow</h5>
                <form onSubmit={submitStatus}>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={selectedStatusValue} onChange={(event) => setStatusForm({ ...statusForm, status: event.target.value })}>
                      {availableStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Note</label>
                    <textarea className="form-control" rows="3" value={statusForm.note} onChange={(event) => setStatusForm({ ...statusForm, note: event.target.value })} />
                  </div>
                  {selectedStatusValue === 'RESOLVED' && (
                    <div className="mb-3">
                      <label className="form-label">Resolution</label>
                      <textarea className="form-control" rows="3" value={statusForm.resolution} onChange={(event) => setStatusForm({ ...statusForm, resolution: event.target.value })} />
                    </div>
                  )}
                  <button className="btn btn-primary w-100">Save status</button>
                </form>
              </div>
            </div>
          )}

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold">Timeline</h5>
              <div className="timeline">
                {complaint.timeline?.slice().reverse().map((item) => (
                  <div className="timeline-item" key={item._id}>
                    <span className={`dot bg-${statusClass(item.status)}`} />
                    <strong>{formatStatus(item.status)}</strong>
                    <p className="mb-1 small">{item.note}</p>
                    <small className="text-muted">{new Date(item.createdAt).toLocaleString()} • {item.updatedBy?.name || 'System'}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
