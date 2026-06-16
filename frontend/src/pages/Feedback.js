import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../api/api';

const Feedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/complaints/${id}`).then(({ data }) => setComplaint(data.complaint)).catch((error) => toast.error(getErrorMessage(error)));
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post(`/feedback/${id}`, form);
      toast.success('Thank you for your feedback');
      navigate(`/complaints/${id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-lg-5">
              <h2 className="fw-bold">Submit feedback</h2>
              <p className="text-muted">{complaint?.title || 'Complaint'} — rate your resolution experience.</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <select className="form-select" value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}>
                    {[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{rating} star{rating > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Comments</label>
                  <textarea className="form-control" rows="5" value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder="Share what went well or what can improve." />
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-success" disabled={loading}>{loading ? 'Submitting...' : 'Submit feedback'}</button>
                  <Link className="btn btn-outline-secondary" to={`/complaints/${id}`}>Cancel</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
