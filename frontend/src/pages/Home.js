import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../utils/status';

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <section className="hero-section">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="eyebrow">Transparent complaint resolution</span>
              <h1 className="display-5 fw-bold mt-3">Register, track, and resolve complaints from one secure platform.</h1>
              <p className="lead text-muted mt-3">
                ComplaintMS connects users, agents, and administrators with role-based workflows, notifications, analytics, and real-time status tracking.
              </p>
              <div className="d-flex gap-3 mt-4 flex-wrap">
                <Link className="btn btn-primary btn-lg" to={user ? roleHome(user.role) : '/register'}>{user ? 'Open dashboard' : 'Get started'}</Link>
                <Link className="btn btn-outline-primary btn-lg" to="/login">Login</Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-panel shadow-lg">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-1">Live complaint pipeline</h5>
                    <small className="text-muted">Routing + resolution overview</small>
                  </div>
                  <span className="badge text-bg-success">Secure</span>
                </div>
                {['Complaint submitted', 'Agent assigned', 'Issue in progress', 'Resolved & feedback collected'].map((item, index) => (
                  <div className="pipeline-step" key={item}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{item}</strong>
                      <p className="mb-0 small text-muted">Automatic timeline update visible to permitted roles.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="row g-4">
          {[
            ['JWT Authentication', 'Secure login with bcrypt password hashing and role-based authorization.'],
            ['Smart Routing', 'Complaints can be assigned automatically to agents by category and workload.'],
            ['Dashboards', 'Dedicated dashboards for users, agents, and admins with analytics.'],
            ['Feedback', 'Ratings and comments help measure service quality after resolution.']
          ].map(([title, text]) => (
            <div className="col-md-6 col-lg-3" key={title}>
              <div className="feature-card h-100">
                <h5>{title}</h5>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
