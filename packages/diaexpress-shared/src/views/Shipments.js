import React, { useCallback, useEffect, useState } from "react";
import { useBackendAuth } from '../auth/useBackendAuth';
import { API_BASE } from "../api/api";

const PAGE_SIZE = 6;

const statusColors = {
  "En attente": "bg-yellow-100 text-yellow-700",
  "En transit": "bg-blue-100 text-blue-700",
  "Arrivé à destination": "bg-purple-100 text-purple-700",
  "Livré": "bg-green-100 text-green-700",
  Rejeté: "bg-red-100 text-red-700",
};

const Shipments = () => {
  const { getToken } = useBackendAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/shipments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur fetch shipments: ${res.status} - ${text}`);
      }

      const data = await res.json();
      setShipments(data.shipments || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setShipments([]);
    }
    setLoading(false);
  }, [getToken]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const totalPages = Math.ceil(shipments.length / PAGE_SIZE);
  const paginated = shipments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🚚 Mes envois</h2>
      {loading && <p>Chargement…</p>}
      {error && <p className="text-red-500">Erreur: {error}</p>}
      {!loading && shipments.length === 0 && !error && (
        <p>Aucun envoi trouvé.</p>
      )}

      {!loading && paginated.length > 0 && (
        <>
          <table className="w-full border-collapse border border-gray-300 text-sm bg-white shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Transport</th>
                <th className="border p-2">Tracking</th>
                <th className="border p-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="border p-2">{s._id.slice(-6)}</td>
                  <td className="border p-2">{s.transportType}</td>
                  <td className="border p-2">{s.trackingNumber || "-"}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        statusColors[s.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded ${
                    page === p ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shipments;
