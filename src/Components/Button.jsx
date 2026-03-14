import React from "react";
import './Button.css';
function Button({ text, variant = "primary", icon = null, active = false, onClick }) {
  const getButtonClasses = () => {
    let classes = "btn";
    
    if (variant === "primary") classes += " btn-primary";
    else if (variant === "secondary") classes += " btn-secondary";
    else if (variant === "success") classes += " btn-success";
    else if (variant === "danger") classes += " btn-danger";
    else if (variant === "filter") classes += " btn-filter";
    else if (variant === "text") classes += " btn-text";
    else if (variant === "google") classes += " btn-google";
    
    if (active && variant === "filter") classes += " active";
    
    return classes;
  };

  return (
    <button className={getButtonClasses()} onClick={onClick}>
      {icon && <span className="btn-icon">{icon}</span>}
      {text}
    </button>
  );
}

export default Button;
