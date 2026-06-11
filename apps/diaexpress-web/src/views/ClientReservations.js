import React, { useEffect, useState, useCallback } from "react";
import { useBackendAuth } from '../auth/useBackendAuth';
import { API_BASE } from "../api/api";

const ClientReservations = () => {
  const { getToken } = useBackendAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/reservations/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des réservations");
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [getToken]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  return (
    <div className="admin-container">
      <h2>📦 Mes réservations</h2>
      {loading && <p>Chargement…</p>}
      {error && <p className="text-red-500">Erreur : {error}</p>}
      {!loading && reservations.length === 0 && <p>Aucune réservation trouvée.</p>}

      {!loading && reservations.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Container</th>
              <th>Origine</th>
              <th>Destination</th>
              <th>Départ</th>
              <th>Statut</th>
              <th>Tracking</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r._id}>
                <td>{r._id.slice(-6)}</td>
                <td>{r.type}</td>
                <td>{r.containerSize || "-"}</td>
                <td>{r.origin}</td>
                <td>{r.destination}</td>
                <td>{new Date(r.departureDate).toLocaleDateString()}</td>
                <td>{r.status}</td>
                <td>{r.trackingNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientReservations;
