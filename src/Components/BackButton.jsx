import { useNavigate } from "react-router-dom";

function BackButton({ label = "← Back", className = "bb-back" }) {
  const navigate = useNavigate();

  const onBack = () => {
    try {
      navigate(-1);
      return;
    } catch {
      // fallback below
    }

    navigate("/");
  };

  return (
    <button type="button" className={className} onClick={onBack}>
      {label}
    </button>
  );
}

export default BackButton;



