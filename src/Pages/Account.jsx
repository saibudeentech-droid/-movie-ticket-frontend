import { useEffect, useState } from "react";
import api from "../utils/api";

function Account() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/users/profile")
      .then((res) => {
        setName(res.data.name || "");
        setPhone(res.data.phone || "");
        setEmail(res.data.email || "");
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.put("/users/profile", { name, phone });
      setMessage("Saved successfully!");
    } catch {
      setMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-page">
      <h1>Account Details</h1>
      {message && <p className={message.includes("Failed") ? "auth-error" : "auth-success"}>{message}</p>}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        disabled
      />
      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

export default Account;
