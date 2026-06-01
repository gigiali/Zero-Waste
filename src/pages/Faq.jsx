import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import Navigation from "../Components/Navigation";
import Footer from "../Components/Footer";
import "./FAQ.css";

const faqs = [
  {
    category: "General",
    items: [
      { q: "What is ZeroWaste?", a: "ZeroWaste is a platform that connects customers with local restaurants, bakeries, cafes, and supermarkets to purchase surplus food at discounted prices — reducing food waste and saving money at the same time." },
      { q: "How does ZeroWaste work?", a: "Businesses list their surplus food as discounted offers on the platform. Customers browse available offers nearby, add items to their cart, and either pick them up or have them delivered." },
      { q: "Is ZeroWaste available in my area?", a: "ZeroWaste currently operates in the Greater Cairo area, including Cairo, Giza, and Qalyubia governorates. We are continuously expanding to new areas." },
    ],
  },
  {
    category: "Orders & Delivery",
    items: [
      { q: "Can I choose between pickup and delivery?", a: "Yes! When placing an order, you can choose to pick it up directly from the restaurant or have it delivered to your location. Delivery is subject to a small fee." },
      { q: "How do I track my order?", a: "After placing an order, a tracking strip will appear on the home page showing the real-time status of your order — from confirmation to delivery or pickup." },
      { q: "Can I cancel my order?", a: "You can cancel your order before it is accepted by the vendor. Once the vendor starts preparing your order, cancellation may not be possible." },
      { q: "What if my order is cancelled by the vendor?", a: "If the vendor cancels your order, you will be notified immediately and the order strip on your home page will reflect the cancellation." },
    ],
  },
  {
    category: "Payments",
    items: [
      { q: "What payment methods are accepted?", a: "We currently accept cash on delivery and cash on pickup. Card payment is also available for online transactions." },
      { q: "Are the prices final or are there extra fees?", a: "The price shown includes the discounted offer price. A delivery fee may apply if you choose home delivery. No hidden charges." },
    ],
  },
  {
    category: "Accounts & Profile",
    items: [
      { q: "Do I need an account to browse offers?", a: "You can browse offers without an account. However, to place orders, add favorites, or leave reviews, you need to sign in." },
      { q: "How do I update my profile information?", a: "Go to your profile page from the navigation bar and update your details including name, email, and password." },
      { q: "How do I delete my account?", a: "You can delete your account from the profile settings page. Please note that this action is permanent and cannot be undone." },
    ],
  },
  {
    category: "Sustainability",
    items: [
      { q: "How does ZeroWaste help the environment?", a: "Every order on ZeroWaste rescues food that would otherwise go to waste, reducing CO₂ emissions and helping fight climate change. You can track your personal sustainability impact on your home page." },
      { q: "What is the Sustainability Impact section?", a: "The Sustainability Impact section shows you how many meals you have rescued, how much CO₂ you have helped prevent, and how much money you have saved — all through your orders on ZeroWaste." },
    ],
  },
  {
    category: "For Businesses",
    items: [
      { q: "How can my business join ZeroWaste?", a: "Register as a vendor on our platform, complete your business setup, and submit your documents for verification. Once approved, you can start listing your surplus food offers." },
      { q: "What types of businesses can join?", a: "Restaurants, bakeries, cafes, supermarkets, hotels, and any food business with surplus food are welcome to join ZeroWaste." },
      { q: "How do I manage my offers and orders?", a: "Through your vendor dashboard, you can add, edit, and manage your offers, track incoming orders, and view your sales reports and sustainability impact." },
    ],
  },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "faq-item--open" : ""}`}>
      <button className="faq-item__btn" onClick={() => setOpen((v) => !v)}>
        <span className="faq-item__question">{question}</span>
        <span className="faq-item__icon">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div className="faq-item__answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ["All", ...faqs.map((f) => f.category)];
  const filtered = activeCategory === "All" ? faqs : faqs.filter((f) => f.category === activeCategory);

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <button className="faq-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="faq-hero__title">Frequently Asked Questions</h1>
        <p className="faq-hero__sub">Everything you need to know about ZeroWaste</p>
      </div>

      <div className="faq-body">
        <div className="faq-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`faq-cat-btn ${activeCategory === cat ? "faq-cat-btn--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.map((section) => (
          <div key={section.category} className="faq-section">
            <h2 className="faq-section__title">{section.category}</h2>
            {section.items.map((item) => (
              <FAQItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        ))}

        <div className="faq-cta">
          <p className="faq-cta__title">Still have questions?</p>
          <p className="faq-cta__sub">Our team is happy to help you.</p>
          <a href="mailto:support@zerowaste.com" className="faq-cta__btn">
            📧 Contact Us
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
