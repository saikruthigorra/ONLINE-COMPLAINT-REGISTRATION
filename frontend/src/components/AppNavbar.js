import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../utils/status';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">ComplaintMS</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
            {user && <li className="nav-item"><NavLink className="nav-link" to={roleHome(user.role)}>Dashboard</NavLink></li>}
            {!user ? (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/login">Login</NavLink></li>
                <li className="nav-item"><NavLink className="btn btn-light btn-sm px-3" to="/register">Register</NavLink></li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <button className="btn btn-outline-light btn-sm dropdown-toggle" data-bs-toggle="dropdown" type="button">
                  {user.name} ({user.role})
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><span className="dropdown-item-text small text-muted">{user.email}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
