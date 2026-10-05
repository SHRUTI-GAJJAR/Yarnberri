import { useEffect, useState } from 'react';
import { KeyRound, MapPin, Plus, Save, Trash2, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { addAddress, deleteAddress, getAddresses, updateAddress } from '../../services/addressService';
import { changePassword, getProfile, updateProfile } from '../../services/profileService';

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  isDefault: false,
};

export default function AccountPage() {
  const { updateUser } = useAuth();
  const { notify } = useNotifications();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAccount = async () => {
      try {
        const [profileResponse, addressResponse] = await Promise.all([getProfile(), getAddresses()]);
        if (isMounted) {
          setProfile(profileResponse?.user || { name: '', email: '' });
          setAddresses(Array.isArray(addressResponse?.addresses) ? addressResponse.addresses : []);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error?.response?.data?.message || 'We could not load your account details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAccount();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshAddresses = async () => {
    const response = await getAddresses();
    setAddresses(Array.isArray(response?.addresses) ? response.addresses : []);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileSaving(true);

    try {
      const response = await updateProfile({ name: profile.name });
      if (response?.user) {
        setProfile((current) => ({ ...current, ...response.user }));
        updateUser(response.user);
      }
      notify('Your profile has been updated.', 'success');
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to update your profile right now.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      notify('Your password has been changed.', 'success');
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to change your password right now.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setAddressSaving(true);

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
        notify('Your address has been updated.', 'success');
      } else {
        await addAddress(addressForm);
        notify('Your address has been saved.', 'success');
      }
      await refreshAddresses();
      setAddressForm(emptyAddress);
      setEditingAddressId('');
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to save this address right now.', 'error');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      ...emptyAddress,
      ...address,
      isDefault: Boolean(address.isDefault),
    });
    setEditingAddressId(address._id);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);
      await refreshAddresses();
      if (editingAddressId === addressId) {
        setAddressForm(emptyAddress);
        setEditingAddressId('');
      }
      notify('Your address has been removed.', 'success');
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to remove this address right now.', 'error');
    }
  };

  if (loading) {
    return (
      <section className="yb-section yb-account-page">
        <div className="container"><p className="yb-muted-copy" role="status">Loading your account...</p></div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="yb-section yb-account-page">
        <div className="container">
          <div className="yb-page-alert" role="alert">{loadError}</div>
          <Link to="/" className="yb-inline-link">Return home</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="yb-section yb-account-page">
      <div className="container">
        <div className="yb-page-heading">
          <span className="yb-eyebrow"><UserRound size={14} /> Your Yarnberri</span>
          <h1 className="yb-section-title">Account &amp; addresses</h1>
          <p>Keep your details ready for the next little handmade delivery.</p>
        </div>

        <div className="yb-account-layout">
          <div className="yb-account-main">
            <section className="yb-account-panel" aria-labelledby="profile-heading">
              <div className="yb-account-panel-heading">
                <div>
                  <h2 id="profile-heading">Profile details</h2>
                  <p>Your name and sign-in email.</p>
                </div>
                <UserRound size={19} aria-hidden="true" />
              </div>
              <form className="yb-form-grid" onSubmit={handleProfileSubmit}>
                <label>
                  <span>Full name</span>
                  <input required minLength={2} value={profile.name || ''} onChange={(event) => setProfile({ ...profile, name: event.target.value })} autoComplete="name" />
                </label>
                <label>
                  <span>Email address</span>
                  <input type="email" value={profile.email || ''} readOnly aria-describedby="account-email-note" autoComplete="email" />
                  <small id="account-email-note">Email is managed by your sign-in account.</small>
                </label>
                <div className="yb-form-actions">
                  <button className="yb-btn yb-btn-primary" type="submit" disabled={profileSaving}>
                    <Save size={16} /> {profileSaving ? 'Saving...' : 'Save profile'}
                  </button>
                </div>
              </form>
            </section>

            <section className="yb-account-panel" aria-labelledby="addresses-heading">
              <div className="yb-account-panel-heading">
                <div>
                  <h2 id="addresses-heading">Delivery addresses</h2>
                  <p>Saved destinations for your handmade orders.</p>
                </div>
                <MapPin size={19} aria-hidden="true" />
              </div>

              {addresses.length ? (
                <div className="yb-account-address-list">
                  {addresses.map((address) => (
                    <article className="yb-account-address" key={address._id}>
                      <div>
                        <div className="yb-address-topline">
                          <strong>{address.fullName}</strong>
                          {address.isDefault && <span>Default</span>}
                        </div>
                        <p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                        <p>{address.city}, {address.state} {address.pincode}</p>
                        <p>{address.phone}</p>
                      </div>
                      <div className="yb-address-actions">
                        <button type="button" className="yb-link-btn" onClick={() => handleEditAddress(address)}>Edit</button>
                        <button type="button" className="yb-icon-action" onClick={() => handleDeleteAddress(address._id)} aria-label={`Remove address for ${address.fullName}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="yb-account-empty">No saved addresses yet. Add one for a smoother checkout.</p>
              )}

              <form className="yb-account-address-form" onSubmit={handleAddressSubmit}>
                <h3>{editingAddressId ? 'Edit address' : 'Add a delivery address'}</h3>
                <div className="yb-form-grid">
                  <label><span>Full name</span><input required value={addressForm.fullName} onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })} autoComplete="name" /></label>
                  <label><span>Phone</span><input required type="tel" value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })} autoComplete="tel" /></label>
                  <label className="wide"><span>Address line 1</span><input required value={addressForm.addressLine1} onChange={(event) => setAddressForm({ ...addressForm, addressLine1: event.target.value })} autoComplete="address-line1" /></label>
                  <label className="wide"><span>Address line 2 <small>(optional)</small></span><input value={addressForm.addressLine2} onChange={(event) => setAddressForm({ ...addressForm, addressLine2: event.target.value })} autoComplete="address-line2" /></label>
                  <label><span>City</span><input required value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} autoComplete="address-level2" /></label>
                  <label><span>State</span><input required value={addressForm.state} onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} autoComplete="address-level1" /></label>
                  <label><span>PIN code</span><input required value={addressForm.pincode} onChange={(event) => setAddressForm({ ...addressForm, pincode: event.target.value })} autoComplete="postal-code" /></label>
                  <label><span>Country</span><input required value={addressForm.country} onChange={(event) => setAddressForm({ ...addressForm, country: event.target.value })} autoComplete="country-name" /></label>
                </div>
                <label className="yb-checkbox-label">
                  <input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm({ ...addressForm, isDefault: event.target.checked })} />
                  Set as default address
                </label>
                <div className="yb-form-actions">
                  <button className="yb-btn yb-btn-primary" type="submit" disabled={addressSaving}>
                    <Plus size={16} /> {addressSaving ? 'Saving...' : editingAddressId ? 'Update address' : 'Save address'}
                  </button>
                  {editingAddressId && <button className="yb-btn yb-btn-outline" type="button" onClick={() => { setEditingAddressId(''); setAddressForm(emptyAddress); }}>Cancel edit</button>}
                </div>
              </form>
            </section>
          </div>

          <aside className="yb-account-side">
            <section className="yb-account-panel" aria-labelledby="password-heading">
              <div className="yb-account-panel-heading">
                <div>
                  <h2 id="password-heading">Change password</h2>
                  <p>Choose a new password with at least 8 characters.</p>
                </div>
                <KeyRound size={19} aria-hidden="true" />
              </div>
              <form className="yb-form-grid one-column" onSubmit={handlePasswordSubmit}>
                <label>
                  <span>Current password</span>
                  <input type="password" required value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} autoComplete="current-password" />
                </label>
                <label>
                  <span>New password</span>
                  <input type="password" required minLength={8} value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} autoComplete="new-password" />
                </label>
                <button className="yb-btn yb-btn-primary" type="submit" disabled={passwordSaving}>{passwordSaving ? 'Updating...' : 'Update password'}</button>
              </form>
            </section>

            <Link className="yb-account-orders-link" to="/orders">
              View your orders <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
