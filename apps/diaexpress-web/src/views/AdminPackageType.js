import React, { useEffect, useState } from 'react';
import { useBackendAuth } from '../auth/useBackendAuth';
import { API_BASE } from '../api/api';

const AdminPackageType = () => {
  const { getToken } = useBackendAuth();
  const [packageTypes, setPackageTypes] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    flatPrice: '',
    allowedTransportTypes: []
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const transportOptions = ['air', 'sea', 'road', 'rail', 'drone', 'camion', 'train'];

  const fetchPackageTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/package-types`);
      const data = await res.json();
      setPackageTypes(data.packageTypes || []);
    } catch (err) {
      setError('Erreur chargement: ' + err.message);
    }
  };

  useEffect(() => {
    fetchPackageTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (type) => {
    setForm(prev => {
      const updated = prev.allowedTransportTypes.includes(type)
        ? prev.allowedTransportTypes.filter(t => t !== type)
        : [...prev.allowedTransportTypes, type];
      return { ...prev, allowedTransportTypes: updated };
    });
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      flatPrice: '',
      allowedTransportTypes: []
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getToken();

    const payload = {
      ...form,
      flatPrice: form.flatPrice ? parseFloat(form.flatPrice) : null
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `${API_BASE}/api/package-types/${editId}`
      : `${API_BASE}/api/package-types`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Erreur');

    alert(editId ? '✅ Type modifié' : '✅ Type créé');
    resetForm();
    fetchPackageTypes();
  };

  const handleEdit = (pt) => {
    setForm({
      name: pt.name,
      description: pt.description,
      flatPrice: pt.flatPrice || '',
      allowedTransportTypes: pt.allowedTransportTypes || []
    });
    setEditId(pt._id);
  };

  const handleDelete = async (id) => {
    const token = await getToken();
    if (!window.confirm("Supprimer ce type ?")) return;
    await fetch(`${API_BASE}/api/package-types/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchPackageTypes();
  };

  return (
    <div className="admin-package-type">
      <h2>{editId ? 'Modifier un type de colis' : 'Ajouter un type de colis'}</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom du type" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />

        <div className="checkbox-group">
          {transportOptions.map(type => (
            <label key={type}>
              <input
                type="checkbox"
                checked={form.allowedTransportTypes.includes(type)}
                onChange={() => handleCheckboxChange(type)}
              />
              {type}
            </label>
          ))}
        </div>

        <button type="submit">{editId ? 'Modifier' : 'Ajouter'}</button>
        {editId && <button type="button" onClick={resetForm}>Annuler</button>}
      </form>

      <h3>📦 Types enregistrés</h3>
      <ul>
        {packageTypes.map(pt => (
          <li key={pt._id}>
            <strong>{pt.name}</strong> — {pt.description || '—'}
            <div><small>Transports autorisés : {pt.allowedTransportTypes?.join(', ') || '—'}</small></div>
            <div><small>💶 Prix fixe : {pt.flatPrice != null ? `${pt.flatPrice} €` : '—'}</small></div>
            <button onClick={() => handleEdit(pt)}>✏️</button>
            <button onClick={() => handleDelete(pt._id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPackageType;
