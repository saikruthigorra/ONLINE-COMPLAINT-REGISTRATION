import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../api/api';
import StatCard from '../components/StatCard';
import { formatStatus, statusClass } from '../utils/status';

const initialStaff = { name: '', email: '', password: '', phone: '', role: 'AGENT', categories: 'General,Technical', maxOpenComplaints: 10 };

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [staff, setStaff] = useState(initialStaff);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes, agentsRes, usersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/complaints', { params: status ? { status } : {} }),
        api.get('/users/agents'),
        api.get('/users', { params: { limit: 8 } })
      ]);
      setStats(statsRes.data.stats);
      setComplaints(complaintsRes.data.complaints);
      setAgents(agentsRes.data.agents);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const counts = useMemo(() => stats?.byStatus || {}, [stats]);

  const assign = async (complaintId, agentId) => {
    if (!agentId) return;
    try {
      await api.patch(`/complaints/${complaintId}/assign`, { agentId });
      toast.success('Complaint assigned');
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const createStaff = async (event) => {
    event.preventDefault();
    try {
      await api.post('/users', {
        ...staff,
        categories: staff.categories.split(',').map((item) => item.trim()).filter(Boolean),
        maxOpenComplaints: Number(staff.maxOpenComplaints)
      });
      toast.success(`${staff.role} created`);
      setStaff(initialStaff);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted mb-0">Manage complaints, users, agent assignments, and analytics.</p>
        </div>
        <select className="form-select w-auto" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED', 'REJECTED'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-2"><StatCard title="Complaints" value={stats?.totalComplaints} /></div>
        <div className="col-md-2"><StatCard title="Users" value={stats?.admin?.users} tone="info" /></div>
        <div className="col-md-2"><StatCard title="Agents" value={stats?.admin?.agents} tone="success" /></div>
        <div className="col-md-2"><StatCard title="Open" value={counts.OPEN || 0} tone="secondary" /></div>
        <div className="col-md-2"><StatCard title="Resolved" value={(counts.RESOLVED || 0) + (counts.CLOSED || 0)} tone="success" /></div>
        <div className="col-md-2"><StatCard title="SLA risk" value={stats?.admin?.unresolvedOlderThan7Days || 0} tone="danger" /></div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4 className="fw-bold mb-3">Complaint queue</h4>
              {loading ? <div className="py-4 text-center"><div className="spinner-border text-primary" /></div> : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr><th>Complaint</th><th>Status</th><th>User</th><th>Agent</th><th>Assign</th><th /></tr>
                    </thead>
                    <tbody>
                      {complaints.map((complaint) => (
                        <tr key={complaint._id}>
                          <td><strong>{complaint.title}</strong><br /><small className="text-muted">{complaint.category} • {complaint.priority}</small></td>
                          <td><span className={`badge text-bg-${statusClass(complaint.status)}`}>{formatStatus(complaint.status)}</span></td>
                          <td>{complaint.user?.name}</td>
                          <td>{complaint.agent?.name || 'Unassigned'}</td>
                          <td>
                            <select className="form-select form-select-sm" defaultValue="" onChange={(event) => assign(complaint._id, event.target.value)}>
                              <option value="">Select</option>
                              {agents.filter((agent) => agent.user?.active).map((agent) => <option value={agent.user._id} key={agent._id}>{agent.user.name}</option>)}
                            </select>
                          </td>
                          <td><Link className="btn btn-outline-primary btn-sm" to={`/complaints/${complaint._id}`}>Open</Link></td>
                        </tr>
                      ))}
                      {complaints.length === 0 && <tr><td colSpan="6"><div className="empty-state">No complaints found.</div></td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold">Create staff account</h5>
              <form onSubmit={createStaff} className="row g-2">
                <div className="col-12"><input className="form-control" placeholder="Name" value={staff.name} onChange={(e) => setStaff({ ...staff, name: e.target.value })} required /></div>
                <div className="col-12"><input className="form-control" type="email" placeholder="Email" value={staff.email} onChange={(e) => setStaff({ ...staff, email: e.target.value })} required /></div>
                <div className="col-12"><input className="form-control" type="password" placeholder="Password" value={staff.password} onChange={(e) => setStaff({ ...staff, password: e.target.value })} required minLength="6" /></div>
                <div className="col-6">
                  <select className="form-select" value={staff.role} onChange={(e) => setStaff({ ...staff, role: e.target.value })}>
                    <option>AGENT</option><option>ADMIN</option><option>USER</option>
                  </select>
                </div>
                <div className="col-6"><input className="form-control" type="number" min="1" value={staff.maxOpenComplaints} onChange={(e) => setStaff({ ...staff, maxOpenComplaints: e.target.value })} /></div>
                <div className="col-12"><input className="form-control" placeholder="Agent categories comma separated" value={staff.categories} onChange={(e) => setStaff({ ...staff, categories: e.target.value })} /></div>
                <div className="col-12"><button className="btn btn-primary w-100">Create account</button></div>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold">Recent users</h5>
              <div className="list-group list-group-flush">
                {users.map((user) => (
                  <div className="list-group-item px-0" key={user._id}>
                    <strong>{user.name}</strong> <span className="badge text-bg-light">{user.role}</span><br />
                    <small className="text-muted">{user.email}</small>
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

export default AdminDashboard;
