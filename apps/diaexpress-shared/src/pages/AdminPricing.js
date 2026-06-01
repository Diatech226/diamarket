// 📁 src/pages/AdminPricing.js
import React, { useState, useEffect } from 'react';
import { useAdminAuthGuard } from '../auth/useAdminAuthGuard';
import {
  apiRequest,
  fetchAdminPricing as apiFetchAdminPricing,
  savePricing as apiSavePricing,
  updatePricing as apiUpdatePricing,
  deletePricing as apiDeletePricing,
} from '../api/logistics';
import styles from '../styles/AdminPricing.module.css';
import { fetchAddresses } from '../api/addresses';

const transportOptions = ['air', 'sea', 'road', 'rail', 'drone', 'camion', 'train'];

const AdminPricing = () => {
  const { requireAdminToken, isAdminReady } = useAdminAuthGuard();

  const [form, setForm] = useState({
    origin: '',
    destination: '',
    originAddressId: '',
    destinationAddressId: '',
    transportPrices: [],
    currency: 'USD',
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  const [editId, setEditId] = useState(null);
  const [pricingList, setPricingList] = useState([]);
  const [packageTypes, setPackageTypes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    isActive: 'all',
    currency: 'all',
    packageTypeId: 'all',
  });

  // Fetch pricing + packageTypes au montage
  useEffect(() => {
    if (!isAdminReady) return;
    fetchAll();
    fetchPackageTypes();
    loadAddresses();
  }, [isAdminReady]);

  const fetchAll = async () => {
    try {
      const token = await requireAdminToken();
      const data = await apiFetchAdminPricing(token);
      setPricingList(data);
      setError('');
    } catch (err) {
      console.error('Erreur chargement pricing', err);
      setError(err.message || 'Impossible de charger les grilles de prix.');
      setSuccess('');
    }
  };

  const fetchPackageTypes = async () => {
    try {
      const res = await apiRequest('/api/package-types');
      setPackageTypes(Array.isArray(res?.packageTypes) ? res.packageTypes : []);
    } catch (err) {
      console.error('Erreur chargement packageTypes', err);
      setPackageTypes([]);
    }
  };

  const loadAddresses = async () => {
    setAddressesLoading(true);
    try {
      const token = await requireAdminToken();
      const list = await fetchAddresses(token);
      setAddresses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Erreur chargement adresses', err);
      setAddresses([]);
      setError((prev) => prev || err.message || "Impossible de charger les adresses disponibles.");
      setSuccess('');
    } finally {
      setAddressesLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ origin: '', destination: '', originAddressId: '', destinationAddressId: '', transportPrices: [], currency: 'USD', validFrom: '', validUntil: '', isActive: true });
    setEditId(null);
  };

  const getAddressId = (address) => {
    if (!address) return '';
    const id = address._id || address.id;
    return id ? String(id) : '';
  };

  const formatAddressValue = (address) => {
    if (!address) return '';
    if (address.label) return address.label;
    const locality = [address.city, address.country].filter(Boolean).join(', ');
    if (locality) return locality;
    const line = [address.line1, address.postalCode].filter(Boolean).join(', ');
    if (line) return line;
    return '';
  };

  const formatAddressOption = (address) => {
    if (!address) return '';
    const parts = [];
    if (address.label) parts.push(address.label);
    const lineParts = [address.line1, address.postalCode, address.city].filter(Boolean).join(', ');
    if (lineParts) parts.push(lineParts);
    if (address.country) parts.push(address.country);
    return parts.join(' — ') || formatAddressValue(address) || 'Adresse';
  };

  const formatGeoHint = (address) => {
    if (!address || !address.gpsLocation) {
      return '🌐 Géolocalisation non renseignée';
    }
    const { latitude, longitude, accuracy, provider } = address.gpsLocation;
    if (latitude === undefined || longitude === undefined) {
      return '🌐 Géolocalisation non renseignée';
    }
    const coords = `${latitude}, ${longitude}`;
    const accuracyLabel = Number.isFinite(accuracy) ? ` (±${accuracy}m)` : '';
    const providerLabel = provider ? ` • ${provider}` : '';
    return `🌐 ${coords}${accuracyLabel}${providerLabel}`;
  };

  const handleSavedAddressChange = (field, value) => {
    setForm((prev) => {
      if (!value) {
        return { ...prev, [`${field}AddressId`]: '' };
      }

      const selected = addresses.find((addr) => getAddressId(addr) === value);
      if (!selected) {
        return { ...prev, [`${field}AddressId`]: '' };
      }

      return {
        ...prev,
        [`${field}AddressId`]: value,
        [field]: formatAddressValue(selected) || prev[field],
      };
    });
  };

  // === Gestion transports ===
  const handleAddTransport = () => {
    setForm({
      ...form,
      transportPrices: [
        ...form.transportPrices,
        {
          transportType: 'air',
          allowedUnits: ['kg'],
          unitType: 'kg',
          pricePerUnit: '',
          dimensionRanges: [],
          packagePricing: [],
          containerPricing: [],
        },
      ],
    });
  };

  const handleTransportChange = (i, field, value) => {
    const updated = [...form.transportPrices];
    updated[i][field] = value;

    if (field === 'transportType') {
      updated[i].allowedUnits = value === 'sea' ? ['m3'] : ['kg'];
      updated[i].unitType = updated[i].allowedUnits[0];
    }

    setForm({ ...form, transportPrices: updated });
  };

  const handleDeleteTransport = (i) => {
    const updated = [...form.transportPrices];
    updated.splice(i, 1);
    setForm({ ...form, transportPrices: updated });
  };

  // === Dimension Ranges ===
  const handleAddRange = (ti) => {
    const updated = [...form.transportPrices];
    updated[ti].dimensionRanges.push({
      minLength: '',
      maxLength: '',
      minWidth: '',
      maxWidth: '',
      minHeight: '',
      maxHeight: '',
      minWeight: '',
      maxWeight: '',
      minVolume: '',
      maxVolume: '',
      price: '',
      priority: '',
      description: '',
    });
    setForm({ ...form, transportPrices: updated });
  };

  const handleRangeChange = (ti, ri, e) => {
    const updated = [...form.transportPrices];
    updated[ti].dimensionRanges[ri][e.target.name] = e.target.value;
    setForm({ ...form, transportPrices: updated });
  };

  const handleDeleteRange = (ti, ri) => {
    const updated = [...form.transportPrices];
    updated[ti].dimensionRanges.splice(ri, 1);
    setForm({ ...form, transportPrices: updated });
  };

  // === Package Pricing ===
  const handleAddPackagePrice = (ti) => {
    const updated = [...form.transportPrices];
    updated[ti].packagePricing.push({ packageTypeId: '', basePrice: '' });
    setForm({ ...form, transportPrices: updated });
  };

  const handlePackageChange = (ti, pi, field, value) => {
    const updated = [...form.transportPrices];
    updated[ti].packagePricing[pi][field] = value;
    setForm({ ...form, transportPrices: updated });
  };

  const handleDeletePackage = (ti, pi) => {
    const updated = [...form.transportPrices];
    updated[ti].packagePricing.splice(pi, 1);
    setForm({ ...form, transportPrices: updated });
  };

  // === Container Pricing (SEA) ===
  const handleAddContainerPrice = (ti) => {
    const updated = [...form.transportPrices];
    updated[ti].containerPricing.push({ containerType: '', basePrice: '', cbmPrice: '' });
    setForm({ ...form, transportPrices: updated });
  };

  const handleContainerChange = (ti, ci, field, value) => {
    const updated = [...form.transportPrices];
    updated[ti].containerPricing[ci][field] = value;
    setForm({ ...form, transportPrices: updated });
  };

  const handleDeleteContainer = (ti, ci) => {
    const updated = [...form.transportPrices];
    updated[ti].containerPricing.splice(ci, 1);
    setForm({ ...form, transportPrices: updated });
  };

  // === Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = await requireAdminToken();

      const body = {
        origin: form.origin,
        destination: form.destination,
        currency: form.currency || 'USD',
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
        isActive: form.isActive !== false,
        originAddressId: form.originAddressId ? form.originAddressId : null,
        destinationAddressId: form.destinationAddressId ? form.destinationAddressId : null,
        transportPrices: form.transportPrices.map((tp) => ({
          ...tp,
          pricePerUnit: parseFloat(tp.pricePerUnit) || null,
          dimensionRanges: tp.dimensionRanges.map((r) => ({
            ...r,
            price: parseFloat(r.price),
            priority: parseInt(r.priority, 10),
          })),
          packagePricing: tp.packagePricing.map((p) => {
            const pkg = packageTypes.find((pt) => pt._id === p.packageTypeId);
            return {
              packageTypeId: p.packageTypeId,
              name: pkg ? pkg.name : '',
              basePrice: parseFloat(p.basePrice),
            };
          }),
          containerPricing: tp.containerPricing.map((c) => ({
            containerType: c.containerType,
            basePrice: parseFloat(c.basePrice),
            cbmPrice: parseFloat(c.cbmPrice) || null,
          })),
        })),
      };

      if (editId) {
        await apiUpdatePricing(editId, body, token);
      } else {
        await apiSavePricing(body, token);
      }

      resetForm();
      fetchAll();
    } catch (err) {
      console.error('Erreur création/modification tarif', err);
      setError(err.message || "Impossible d'enregistrer le tarif.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce tarif ?')) return;
    const token = await requireAdminToken();
    await apiDeletePricing(id, token);
    fetchAll();
  };

  const handleEdit = (p) => {
    setForm({
      origin: p.origin,
      destination: p.destination,
      originAddressId: p.originAddressId ? String(p.originAddressId) : '',
      destinationAddressId: p.destinationAddressId ? String(p.destinationAddressId) : '',
      transportPrices: p.transportPrices || [],
      currency: p.currency || 'USD',
      validFrom: p.validFrom ? String(p.validFrom).slice(0, 10) : '',
      validUntil: p.validUntil ? String(p.validUntil).slice(0, 10) : '',
      isActive: p.isActive !== false,
    });
    setEditId(p._id);
  };

  const selectedOrigin = form.originAddressId
    ? addresses.find((addr) => getAddressId(addr) === form.originAddressId)
    : null;
  const selectedDestination = form.destinationAddressId
    ? addresses.find((addr) => getAddressId(addr) === form.destinationAddressId)
    : null;

  const filteredPricingList = pricingList.filter((item) => {
    const search = filters.search.trim().toLowerCase();
    if (search) {
      const route = `${item.origin || ''} ${item.destination || ''}`.toLowerCase();
      if (!route.includes(search)) return false;
    }
    if (filters.isActive !== 'all') {
      const active = item.isActive !== false;
      if ((filters.isActive === 'active') !== active) return false;
    }
    if (filters.currency !== 'all' && (item.currency || 'USD') !== filters.currency) return false;
    if (filters.packageTypeId !== 'all') {
      const hasPackage = (item.transportPrices || []).some((tp) => (tp.packagePricing || []).some((pkg) => pkg.packageTypeId === filters.packageTypeId));
      if (!hasPackage) return false;
    }
    return true;
  });

  return (
    <div className={styles.adminPricing}>
      <h2>{editId ? 'Modifier un tarif' : 'Créer un tarif'}</h2>
      {error && <div className={styles.pricingAlert}>{error}</div>}
      {success && <div className={styles.pricingSuccess}>{success}</div>}
      <form onSubmit={handleSubmit} className={styles.pricingForm}>
        <div className={styles.addressSelectGroup}>
          <label>
            Adresse d'origine sauvegardée
            <select
              value={form.originAddressId}
              onChange={(e) => handleSavedAddressChange('origin', e.target.value)}
              disabled={addressesLoading && !addresses.length}
            >
              <option value="">— Saisir manuellement —</option>
              {addresses.map((address) => (
                <option key={getAddressId(address)} value={getAddressId(address)}>
                  {formatAddressOption(address)}
                </option>
              ))}
            </select>
          </label>
          {addressesLoading && <span className={styles.pricingFormHint}>Chargement des adresses…</span>}
          {form.originAddressId && selectedOrigin && (
            <span className={styles.pricingFormHint}>{formatGeoHint(selectedOrigin)}</span>
          )}
        </div>
        <input
          name="origin"
          value={form.origin}
          onChange={(e) => setForm({ ...form, origin: e.target.value })}
          placeholder="Origine"
          required
        />
        <div className={styles.addressSelectGroup}>
          <label>
            Adresse de destination sauvegardée
            <select
              value={form.destinationAddressId}
              onChange={(e) => handleSavedAddressChange('destination', e.target.value)}
              disabled={addressesLoading && !addresses.length}
            >
              <option value="">— Saisir manuellement —</option>
              {addresses.map((address) => (
                <option key={`${getAddressId(address)}-dest`} value={getAddressId(address)}>
                  {formatAddressOption(address)}
                </option>
              ))}
            </select>
          </label>
          {form.destinationAddressId && selectedDestination && (
            <span className={styles.pricingFormHint}>{formatGeoHint(selectedDestination)}</span>
          )}
        </div>
        <input
          name="destination"
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
          placeholder="Destination"
          required
        />

        <div className={styles.inlineFields}>
          <input name="currency" value={form.currency || 'USD'} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} placeholder="Devise (USD)" maxLength={3} />
          <input type="date" value={form.validFrom || ''} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
          <input type="date" value={form.validUntil || ''} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
          <label><input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Actif</label>
        </div>

        <h4>🚚 Modes de transport</h4>
        {form.transportPrices.map((tp, ti) => (
          <div key={ti} className={styles.transportBlock}>
            <select
              value={tp.transportType}
              onChange={(e) =>
                handleTransportChange(ti, 'transportType', e.target.value)
              }
            >
              {transportOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {tp.transportType !== 'sea' && (
              <input
                value={tp.pricePerUnit}
                onChange={(e) =>
                  handleTransportChange(ti, 'pricePerUnit', e.target.value)
                }
                placeholder={`Prix par ${tp.unitType || 'unité'}`}
                type="number"
              />
            )}
            <button type="button" onClick={() => handleDeleteTransport(ti)}>
              🗑️ Supprimer transport
            </button>

            {tp.transportType === 'sea' ? (
              <>
                <h5>🚢 Tarifs conteneurs</h5>
                {tp.containerPricing.map((c, ci) => (
                  <div key={ci} className={styles.containerPriceRow}>
                    <input
                      value={c.containerType}
                      onChange={(e) =>
                        handleContainerChange(ti, ci, 'containerType', e.target.value)
                      }
                      placeholder="Type de conteneur (ex: FCL 20ft)"
                    />
                    <input
                      value={c.basePrice}
                      onChange={(e) =>
                        handleContainerChange(ti, ci, 'basePrice', e.target.value)
                      }
                      placeholder="Prix fixe €"
                      type="number"
                    />
                    <input
                      value={c.cbmPrice}
                      onChange={(e) =>
                        handleContainerChange(ti, ci, 'cbmPrice', e.target.value)
                      }
                      placeholder="Prix par m³"
                      type="number"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteContainer(ti, ci)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddContainerPrice(ti)}>
                  ➕ Ajouter un conteneur
                </button>
              </>
            ) : (
              <>
                <h5>📏 Plages dimensionnelles</h5>
                <table className={styles.rangeTable}>
                  <thead>
                    <tr>
                      <th>L</th>
                      <th>l</th>
                      <th>h</th>
                      <th>Poids</th>
                      <th>Volume</th>
                      <th>Prix</th>
                      <th>Priorité</th>
                      <th>Description</th>
                      <th>🗑️</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tp.dimensionRanges.map((range, ri) => (
                      <tr key={ri}>
                        <td>
                          <input
                            name="minLength"
                            value={range.minLength}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Min"
                          />
                          <input
                            name="maxLength"
                            value={range.maxLength}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Max"
                          />
                        </td>
                        <td>
                          <input
                            name="minWidth"
                            value={range.minWidth}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Min"
                          />
                          <input
                            name="maxWidth"
                            value={range.maxWidth}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Max"
                          />
                        </td>
                        <td>
                          <input
                            name="minHeight"
                            value={range.minHeight}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Min"
                          />
                          <input
                            name="maxHeight"
                            value={range.maxHeight}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Max"
                          />
                        </td>
                        <td>
                          <input
                            name="minWeight"
                            value={range.minWeight}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Min"
                          />
                          <input
                            name="maxWeight"
                            value={range.maxWeight}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Max"
                          />
                        </td>
                        <td>
                          <input
                            name="minVolume"
                            value={range.minVolume}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Min"
                          />
                          <input
                            name="maxVolume"
                            value={range.maxVolume}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                            placeholder="Max"
                          />
                        </td>
                        <td>
                          <input
                            name="price"
                            value={range.price}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                          />
                        </td>
                        <td>
                          <input
                            name="priority"
                            value={range.priority}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                          />
                        </td>
                        <td>
                          <input
                            name="description"
                            value={range.description}
                            onChange={(e) => handleRangeChange(ti, ri, e)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteRange(ti, ri)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={() => handleAddRange(ti)}>
                  ➕ Ajouter une plage
                </button>

                <h5>📦 Tarifs par type de colis</h5>
                {tp.packagePricing.map((pkg, pi) => (
                  <div key={pi} className={styles.packagePriceRow}>
                    <select
                      value={pkg.packageTypeId}
                      onChange={(e) =>
                        handlePackageChange(ti, pi, 'packageTypeId', e.target.value)
                      }
                    >
                      <option value="">Choisir un type</option>
                      {packageTypes.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={pkg.basePrice}
                      onChange={(e) =>
                        handlePackageChange(ti, pi, 'basePrice', e.target.value)
                      }
                      placeholder="Base Price €"
                      type="number"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(ti, pi)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddPackagePrice(ti)}>
                  ➕ Ajouter un tarif colis
                </button>
              </>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddTransport}>
          ➕ Ajouter un mode de transport
        </button>

        <br />
        <button type="submit">{editId ? 'Modifier' : 'Créer'}</button>
        {editId && <button type="button" onClick={resetForm}>Annuler</button>}
      </form>

      <h3>📋 Tarifs enregistrés</h3>
      <div className={styles.filterRow}>
        <input placeholder="Recherche origine/destination" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
        <select value={filters.isActive} onChange={(e) => setFilters((prev) => ({ ...prev, isActive: e.target.value }))}>
          <option value="all">Tous états</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
        <select value={filters.currency} onChange={(e) => setFilters((prev) => ({ ...prev, currency: e.target.value }))}>
          <option value="all">Toutes devises</option>
          {[...new Set(pricingList.map((item) => item.currency || 'USD'))].map((currency) => <option key={currency} value={currency}>{currency}</option>)}
        </select>
      </div>
      <ul className={styles.pricingList}>
        {filteredPricingList.map((p) => (
          <li key={p._id}>
            <strong>{p.origin} → {p.destination}</strong> <span className={p.isActive === false ? styles.badgeInactive : styles.badgeActive}>{p.isActive === false ? 'INACTIF' : 'ACTIF'}</span> <span className={styles.badgeCurrency}>{p.currency || 'USD'}</span>
            {p.transportPrices?.map((tp, i) => (
              <div key={i} className={styles.savedTransport}>
                <p>• {tp.transportType.toUpperCase()}</p>

                {tp.transportType !== 'sea' ? (
                  tp.pricePerUnit
                    ? <p>💰 {tp.pricePerUnit} € / {tp.unitType}</p>
                    : '—'
                ) : (
                  tp.containerPricing?.length > 0 ? (
                    <ul>
                      {tp.containerPricing.map((c, ci) => (
                        <li key={ci}>
                          {c.containerType} : {c.basePrice} € 
                          {c.cbmPrice ? ` | ${c.cbmPrice} €/m³` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : '—'
                )}
              </div>
            ))}
            <button onClick={() => handleEdit(p)}>✏️</button>
            <button onClick={() => handleDelete(p._id)} className={styles.delete}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPricing;
