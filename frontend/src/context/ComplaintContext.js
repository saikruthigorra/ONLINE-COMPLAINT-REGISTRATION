import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/api';

const ComplaintContext = createContext(null);

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints', { params });
      setComplaints(data.complaints);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const createComplaint = async (payload) => {
    const { data } = await api.post('/complaints', payload);
    setComplaints((prev) => [data.complaint, ...prev]);
    return data.complaint;
  };

  const updateStatus = async (id, payload) => {
    const { data } = await api.patch(`/complaints/${id}/status`, payload);
    setComplaints((prev) => prev.map((item) => (item._id === id ? data.complaint : item)));
    return data.complaint;
  };

  const assignComplaint = async (id, agentId) => {
    const { data } = await api.patch(`/complaints/${id}/assign`, { agentId });
    setComplaints((prev) => prev.map((item) => (item._id === id ? data.complaint : item)));
    return data.complaint;
  };

  const addMessage = async (id, message) => {
    const { data } = await api.post(`/complaints/${id}/messages`, { message });
    setComplaints((prev) => prev.map((item) => (item._id === id ? data.complaint : item)));
    return data.complaint;
  };

  const value = useMemo(
    () => ({ complaints, loading, fetchComplaints, createComplaint, updateStatus, assignComplaint, addMessage }),
    [complaints, loading]
  );

  return <ComplaintContext.Provider value={value}>{children}</ComplaintContext.Provider>;
};

export const useComplaints = () => useContext(ComplaintContext);
