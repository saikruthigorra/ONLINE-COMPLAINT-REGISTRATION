import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../utils/status';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      toast.success('Logged in successfully');

      navigate(location.state?.from?.pathname || roleHome(user.role), {
        replace: true
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-lg-5">
              <h2 className="fw-bold mb-1">Welcome back</h2>
              <p className="text-muted mb-4">
                Login to access your complaint dashboard.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p className="small text-center mt-4 mb-0">
                New here? <Link to="/register">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;