import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import Orders from "./Orders";
import BackButton from "../Components/BackButton";
import "../styles/backButton.css";
import api from "../utils/api";

function Profile() {
  const { user, login, logout } = useContext(AuthContext);
  const [tab, setTab] = useState("account");

  const showToast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/users/profile")
      .then((res) => {
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
        setGender(res.data.gender || "");
        setAddress(res.data.address || "");
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/profile", { name, email, phone, gender, address });
      const updated = res.data;
      login(localStorage.getItem("token"), { ...user, name: updated.name, email: updated.email, role: updated.role });
      showToast("Profile updated successfully!");
    } catch {
      showToast("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (tab === "orders") {
      return <Orders />;
    }

    return (
      <div className="profile-form">
        <h1>Account Details</h1>
        <label>Full Name</label>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Phone Number</label>
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <label>Gender</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <label>Address</label>
        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    );
  };

  return (
    <div className="profile-shell">
      <aside className="profile-sidebar">
        <BackButton />

        <h2 className="profile-sidebar-title">My Account</h2>

        <div className="profile-menu-card">
          <button
            onClick={() => setTab("account")}
            style={{
              background:
                tab === "account" ? "rgba(124,58,237,.35)" : "transparent",
              borderColor:
                tab === "account" ? "rgba(167,139,250,.75)" : "rgba(124,58,237,.35)",
            }}
          >
            Account
          </button>
        </div>

        <div className="profile-menu-card">
          <button
            onClick={() => setTab("orders")}
            style={{
              background:
                tab === "orders" ? "rgba(124,58,237,.35)" : "transparent",
              borderColor:
                tab === "orders" ? "rgba(167,139,250,.75)" : "rgba(124,58,237,.35)",
            }}
          >
            Your Orders
          </button>
        </div>

        <div className="profile-menu-card">
          <button onClick={() => logout()}>Sign Out</button>
        </div>
      </aside>

      <main className="profile-content">
        <div className="profile-content-card">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Profile;
