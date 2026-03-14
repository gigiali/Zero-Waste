import React from "react";
import Button from "./components/Button.jsx";

function App() {
  return (
    <div>
      <Button text="Sign In" variant="success" />
      <Button text="Create account" variant="success" />
      <Button text="Reserve Now" variant="success" />
      <Button text="All" variant="filter" />
      <Button text="Restaurant" variant="filter" />
      <Button text="Bakery" variant="filter" />
      <Button text="Supermarket" variant="filter" />
      <Button text="Hotel" variant="filter" />
      <Button text="Cancel" variant="secondary" />
      <Button text="Create Offer" variant="success" />
      <Button text="Call Business" variant="success" />
      <Button text="Browse More Offers" variant="secondary" />
      <Button text="Add New Offer" variant="success" icon="+" />
      <Button text="Edit" variant="secondary" />
      <Button text="Delete" variant="danger" />
    </div>
  );
}

export default App;
