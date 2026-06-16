import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../api/api';
import ComplaintCard from '../components/ComplaintCard';
import StatCard from '../components/StatCard';
import { useComplaints } from '../context/ComplaintContext';

const initialForm = { title: '', description: '', category: 'General', priority: 'MEDIUM' };

const Dashboard = () => {
  const { complaints, loading, fetchComplaints, createComplaint } = useComplaints();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');

  const loadData = async () => {
    try {
      await fetchComplaints(filter ? { status: filter } : {});
      const { data } = await api.get('/dashboard/stats');
      setStats(data.stats);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const totals = useMemo(() => stats?.byStatus || {}, [stats]);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createComplaint(form);
      setForm(initialForm);
      toast.success('Complaint submitted successfully');
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1">User Dashboard</h1>
          <p className="text-muted mb-0">Submit complaints and track progress in real time.</p>
        </div>
        <select className="form-select w-auto" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="">All statuses</option>
          {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED', 'REJECTED'].map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3"><StatCard title="Total" value={stats?.totalComplaints} /></div>
        <div className="col-md-3"><StatCard title="Open" value={totals.OPEN || 0} tone="secondary" /></div>
        <div className="col-md-3"><StatCard title="In Progress" value={(totals.ASSIGNED || 0) + (totals.IN_PROGRESS || 0)} tone="info" /></div>
        <div className="col-md-3"><StatCard title="Resolved" value={(totals.RESOLVED || 0) + (totals.CLOSED || 0)} tone="success" /></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm sticky-lg-top dashboard-form">
            <div className="card-body p-4">
              <h4 className="fw-bold">Register a new complaint</h4>
              <p className="text-muted small">Provide clear details to help route your issue quickly.</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" name="title" value={form.title} onChange={handleChange} minLength="5" maxLength="120" required />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                      {['General', 'Technical', 'Billing', 'Service', 'Safety', 'Other'].map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Priority</label>
                    <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                      {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => <option key={priority}>{priority}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3 mt-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" rows="5" value={form.description} onChange={handleChange} minLength="10" required />
                </div>
                <button className="btn btn-primary w-100" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit complaint'}</button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
            <div className="row g-3">
              {complaints.length === 0 && <div className="col-12"><div className="empty-state">No complaints found. Submit your first complaint.</div></div>}
              {complaints.map((complaint) => <div className="col-md-6" key={complaint._id}><ComplaintCard complaint={complaint} /></div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
