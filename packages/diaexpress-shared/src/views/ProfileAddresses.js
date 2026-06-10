import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useBackendAuth } from '../auth/useBackendAuth';
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '../api/addresses';
import { normaliseCountry, validateCountry, validatePhone } from '../utils/addressValidation';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '../components/ui/PageStates';
import '../styles/ProfileAddresses.css';

const createBlankGpsLocation = () => ({ latitude: '', longitude: '', accuracy: '', provider: '', capturedAt: '' });
const createEmptyAddress = () => ({ type: 'sender', label: '', contactName: '', company: '', email: '', phone: '', line1: '', line2: '', postalCode: '', city: '', country: '', notes: '', gpsLocation: createBlankGpsLocation() });

const typeLabels = { sender: 'Expéditeur', recipient: 'Destinataire', billing: 'Facturation' };

const formatDateInputValue = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const AddressPageHeader = ({ onAdd }) => (
  <header className="profile-addresses__header">
    <div>
      <p className="profile-addresses__eyebrow">Profil client</p>
      <h1>Mes adresses</h1>
      <p className="profile-addresses__subtitle">Centralisez vos points d&apos;expédition et de livraison pour commander plus vite.</p>
    </div>
    <button type="button" className="dx-button dx-button--primary" onClick={onAdd}>Ajouter une adresse</button>
  </header>
);

const AddressDeleteConfirm = ({ address, onConfirm, onCancel, deleting }) => (
  <div className="address-delete-confirm" role="alertdialog" aria-modal="true">
    <p>Supprimer « {address?.label || 'cette adresse'} » ? Cette action est irréversible.</p>
    <div className="address-delete-confirm__actions">
      <button type="button" className="secondary" onClick={onCancel}>Annuler</button>
      <button type="button" className="danger" onClick={onConfirm} disabled={deleting}>{deleting ? 'Suppression…' : 'Supprimer'}</button>
    </div>
  </div>
);

const ProfileAddresses = () => {
  const { getToken } = useBackendAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(createEmptyAddress);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const groupedAddresses = useMemo(() => addresses.reduce((acc, a) => {
    const key = a.type || 'sender';
    acc[key] = acc[key] ? [...acc[key], a] : [a];
    return acc;
  }, { sender: [], recipient: [], billing: [] }), [addresses]);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setAddresses(await fetchAddresses(token));
      setError('');
    } catch (err) {
      setError(err.message || 'Impossible de charger les adresses.');
    } finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { void loadAddresses(); }, [loadAddresses]);

  const resetForm = () => { setForm(createEmptyAddress()); setFormErrors({}); setEditingId(null); };

  const validateForm = () => {
    const e = {};
    if (!form.label.trim()) e.label = 'Libellé requis.';
    if (!form.line1.trim()) e.line1 = 'Adresse requise.';
    if (!form.city.trim()) e.city = 'Ville requise.';
    if (!form.postalCode.trim()) e.postalCode = 'Code postal requis.';
    if (!form.country.trim()) e.country = 'Pays requis.';
    if (form.country && !validateCountry(form.country)) e.country = 'Le pays doit contenir uniquement des lettres.';
    if (form.phone && !validatePhone(form.phone)) e.phone = 'Format invalide. Exemple: +33612345678';
    return e;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length) return setFormErrors(nextErrors);

    setSaving(true);
    setError('');
    try {
      const token = await getToken();
      const { gpsLocation: gps, ...rest } = form;
      const payload = { ...rest, country: normaliseCountry(form.country) };
      if (gps.latitude && gps.longitude) {
        const latitude = parseFloat(gps.latitude);
        const longitude = parseFloat(gps.longitude);
        if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
          payload.gpsLocation = { latitude, longitude };
          if (gps.accuracy) payload.gpsLocation.accuracy = parseFloat(gps.accuracy);
          if (gps.provider?.trim()) payload.gpsLocation.provider = gps.provider.trim();
          if (gps.capturedAt?.trim()) payload.gpsLocation.capturedAt = gps.capturedAt;
        }
      } else if (editingId) payload.gpsLocation = null;

      const saved = editingId ? await updateAddress(token, editingId, payload) : await createAddress(token, payload);
      if (!saved) await loadAddresses();
      else if (editingId) setAddresses((prev) => prev.map((a) => (a._id === saved._id ? saved : a)));
      else setAddresses((prev) => [...prev, saved]);

      resetForm();
      setSaveMessage(editingId ? 'Adresse mise à jour avec succès.' : 'Adresse ajoutée avec succès.');
    } catch (err) { setError(err.message || 'Impossible de sauvegarder cette adresse.'); } finally { setSaving(false); }
  };

  const handleEdit = (a) => {
    setEditingId(a._id);
    setForm({ ...createEmptyAddress(), ...a, gpsLocation: { ...createBlankGpsLocation(), ...a.gpsLocation, capturedAt: a?.gpsLocation?.capturedAt ? formatDateInputValue(a.gpsLocation.capturedAt) : '' } });
    setSaveMessage('');
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await deleteAddress(token, deleteCandidate._id);
      setAddresses((prev) => prev.filter((a) => a._id !== deleteCandidate._id));
      setSaveMessage('Adresse supprimée avec succès.');
      setDeleteCandidate(null);
    } catch (err) { setError(err.message || 'Suppression impossible.'); } finally { setDeleting(false); }
  };

  const gps = form.gpsLocation || createBlankGpsLocation();

  return <div className="profile-addresses">
    <AddressPageHeader onAdd={() => document.getElementById('address-form-section')?.scrollIntoView({ behavior: 'smooth' })} />
    {error && <AddressErrorState message={error} onRetry={loadAddresses} />}
    {loading && <LoadingState message="Chargement des adresses…" />}
    {saveMessage && <SuccessState title={saveMessage} />}

    <section className="address-grid">
      {['sender', 'recipient', 'billing'].map((type) => <article key={type} className="address-column">
        <h2>{typeLabels[type]}</h2>
        {groupedAddresses[type].length === 0 ? <AddressEmptyState /> : groupedAddresses[type].map((a) => <AddressCard key={a._id || a.label} address={a} onEdit={handleEdit} onDelete={setDeleteCandidate} />)}
      </article>)}
    </section>

    {deleteCandidate && <AddressDeleteConfirm address={deleteCandidate} onCancel={() => setDeleteCandidate(null)} onConfirm={confirmDelete} deleting={deleting} />}

    <section id="address-form-section" className="address-form-wrapper"><AddressFormPanel form={form} formErrors={formErrors} gps={gps} handleSubmit={handleSubmit} saving={saving} editingId={editingId} onReset={resetForm} onChange={(e)=>setForm((p)=>({...p,[e.target.name]:e.target.value}))} onGpsChange={(e)=>setForm((p)=>({...p,gpsLocation:{...(p.gpsLocation||createBlankGpsLocation()),[e.target.name]:e.target.value}}))} /></section>
  </div>;
};

const AddressCard = ({ address, onEdit, onDelete }) => <div className="address-card">
  <div className="address-card-main">
    <div className="address-card__title-row"><h3>{address.label || 'Sans libellé'}</h3>{(address.isPrimary || address.primary || address.isDefault) && <span className="address-badge">Principale</span>}</div>
    <p className="address-card-main__contact">{address.contactName || address.company || 'Contact non renseigné'}</p>
    {address.phone && <p>{address.phone}</p>}
    <p>{address.line1}</p>{address.line2 && <p>{address.line2}</p>}
    <p>{address.postalCode} {address.city} — {normaliseCountry(address.country)}</p>
    {address.notes && <p className="notes">{address.notes}</p>}
  </div>
  <div className="address-card-actions"><button type="button" onClick={() => onEdit(address)}>Modifier</button><button type="button" className="danger" onClick={() => onDelete(address)}>Supprimer</button></div>
</div>;

const AddressEmptyState = () => <EmptyState title="Aucune adresse enregistrée" helper="Ajoutez votre première adresse pour accélérer vos prochains envois." />;
const AddressErrorState = ({ message, onRetry }) => <ErrorState title="Impossible de charger vos adresses" message={message} onRetry={onRetry} />;

const AddressFormPanel = ({ form, formErrors, gps, handleSubmit, saving, editingId, onReset, onChange, onGpsChange }) => <>
  <h2>{editingId ? 'Modifier une adresse' : 'Ajouter une adresse'}</h2>
  <p className="address-form-wrapper__subtitle">Les champs marqués * sont requis. Utilisez un numéro au format international pour faciliter la livraison.</p>
  <form className="address-form" onSubmit={handleSubmit}>{[['type','Type d\'adresse'],['label','Libellé *'],['contactName','Nom du contact']].map(()=>null)}
    <div className="form-row"><label>Type d&apos;adresse<select name="type" value={form.type} onChange={onChange}><option value="sender">Expéditeur</option><option value="recipient">Destinataire</option><option value="billing">Facturation</option></select></label><label>Libellé *<input name="label" value={form.label} onChange={onChange} placeholder="Maison, Bureau..." />{formErrors.label && <span className="field-error">{formErrors.label}</span>}</label></div>
    <div className="form-row"><label>Nom du contact<input name="contactName" value={form.contactName} onChange={onChange} /></label><label>Téléphone<input name="phone" value={form.phone} onChange={onChange} placeholder="+33612345678" />{formErrors.phone && <span className="field-error">{formErrors.phone}</span>}</label><label>Email<input type="email" name="email" value={form.email} onChange={onChange} /></label></div>
    <div className="form-row"><label>Adresse ligne 1 *<input name="line1" value={form.line1} onChange={onChange} />{formErrors.line1 && <span className="field-error">{formErrors.line1}</span>}</label><label>Adresse ligne 2<input name="line2" value={form.line2} onChange={onChange} /></label></div>
    <div className="form-row"><label>Code postal *<input name="postalCode" value={form.postalCode} onChange={onChange} />{formErrors.postalCode && <span className="field-error">{formErrors.postalCode}</span>}</label><label>Ville *<input name="city" value={form.city} onChange={onChange} />{formErrors.city && <span className="field-error">{formErrors.city}</span>}</label><label>Pays *<input name="country" value={form.country} onChange={onChange} placeholder="FR" />{formErrors.country && <span className="field-error">{formErrors.country}</span>}</label></div>
    <div className="geo-section"><h3>Localisation GPS (optionnel)</h3><div className="form-row"><label>Latitude<input name="latitude" value={gps.latitude} onChange={onGpsChange} /></label><label>Longitude<input name="longitude" value={gps.longitude} onChange={onGpsChange} /></label><label>Précision (m)<input name="accuracy" value={gps.accuracy} onChange={onGpsChange} /></label></div></div>
    <label>Notes / instructions<textarea name="notes" value={form.notes} onChange={onChange} rows={3} placeholder="Digicode, point de repère, etc." /></label>
    <div className="form-actions">{editingId && <button type="button" className="secondary" onClick={onReset}>Annuler</button>}<button type="submit" disabled={saving}>{saving ? 'Sauvegarde…' : editingId ? 'Mettre à jour' : 'Enregistrer l’adresse'}</button></div>
  </form>
</>;

export default ProfileAddresses;
