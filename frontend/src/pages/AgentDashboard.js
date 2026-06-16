import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../api/api';
import ComplaintCard from '../components/ComplaintCard';
import StatCard from '../components/StatCard';
import { useComplaints } from '../context/ComplaintContext';

const AgentDashboard = () => {
  const { complaints, loading, fetchComplaints } = useComplaints();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('');

  const loadData = async () => {
    try {
      await fetchComplaints(status ? { status } : {});
      const { data } = await api.get('/dashboard/stats');
      setStats(data.stats);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const counts = useMemo(() => stats?.byStatus || {}, [stats]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Agent Dashboard</h1>
          <p className="text-muted mb-0">Manage assigned complaints and update resolution progress.</p>
        </div>
        <select className="form-select w-auto" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All assigned</option>
          {['ASSIGNED', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED', 'REJECTED'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3"><StatCard title="Assigned" value={stats?.totalComplaints} /></div>
        <div className="col-md-3"><StatCard title="In progress" value={(counts.ASSIGNED || 0) + (counts.IN_PROGRESS || 0)} tone="info" /></div>
        <div className="col-md-3"><StatCard title="Waiting user" value={counts.WAITING_USER || 0} tone="warning" /></div>
        <div className="col-md-3"><StatCard title="Avg rating" value={(stats?.feedback?.averageRating || 0).toFixed(1)} tone="success" subtitle={`${stats?.feedback?.totalFeedback || 0} reviews`} /></div>
      </div>

      {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
        <div className="row g-3">
          {complaints.length === 0 && <div className="col-12"><div className="empty-state">No assigned complaints found.</div></div>}
          {complaints.map((complaint) => <div className="col-md-6 col-xl-4" key={complaint._id}><ComplaintCard complaint={complaint} /></div>)}
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
