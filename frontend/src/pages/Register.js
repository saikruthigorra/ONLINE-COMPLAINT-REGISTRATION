import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-lg-5">
              <h2 className="fw-bold mb-1">Create user account</h2>
              <p className="text-muted mb-4">Submit and track complaints securely.</p>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full name</label>
                    <input className="form-control" name="name" value={form.name} onChange={handleChange} required minLength="2" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Password</label>
                    <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required minLength="6" />
                  </div>
                </div>
                <button className="btn btn-primary w-100 mt-4" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
              </form>
              <p className="small text-center mt-4 mb-0">Already have an account? <Link to="/login">Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
