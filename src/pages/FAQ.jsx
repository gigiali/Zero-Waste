import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navigation from "../Components/Navigation";
import Footer from "../Components/Footer";
import "./FAQ.css";

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
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(t("faq.all"));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      category: t("faq.categories.general"),
      items: [
        { q: t("faq.general.q1"), a: t("faq.general.a1") },
        { q: t("faq.general.q2"), a: t("faq.general.a2") },
        { q: t("faq.general.q3"), a: t("faq.general.a3") },
      ],
    },
    {
      category: t("faq.categories.orders"),
      items: [
        { q: t("faq.orders.q1"), a: t("faq.orders.a1") },
        { q: t("faq.orders.q2"), a: t("faq.orders.a2") },
        { q: t("faq.orders.q3"), a: t("faq.orders.a3") },
        { q: t("faq.orders.q4"), a: t("faq.orders.a4") },
      ],
    },
    {
      category: t("faq.categories.payments"),
      items: [
        { q: t("faq.payments.q1"), a: t("faq.payments.a1") },
        { q: t("faq.payments.q2"), a: t("faq.payments.a2") },
      ],
    },
    {
      category: t("faq.categories.accounts"),
      items: [
        { q: t("faq.accounts.q1"), a: t("faq.accounts.a1") },
        { q: t("faq.accounts.q2"), a: t("faq.accounts.a2") },
        { q: t("faq.accounts.q3"), a: t("faq.accounts.a3") },
      ],
    },
    {
      category: t("faq.categories.sustainability"),
      items: [
        { q: t("faq.sustainability.q1"), a: t("faq.sustainability.a1") },
        { q: t("faq.sustainability.q2"), a: t("faq.sustainability.a2") },
      ],
    },
    {
      category: t("faq.categories.businesses"),
      items: [
        { q: t("faq.businesses.q1"), a: t("faq.businesses.a1") },
        { q: t("faq.businesses.q2"), a: t("faq.businesses.a2") },
        { q: t("faq.businesses.q3"), a: t("faq.businesses.a3") },
      ],
    },
  ];

  const allLabel = t("faq.all");
  const categories = [allLabel, ...faqs.map((f) => f.category)];
  const filtered =
    activeCategory === allLabel
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <button className="faq-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> {t("faq.back")}
        </button>
        <h1 className="faq-hero__title">{t("faq.title")}</h1>
        <p className="faq-hero__sub">{t("faq.subtitle")}</p>
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
          <p className="faq-cta__title">{t("faq.stillHaveQuestions")}</p>
          <p className="faq-cta__sub">{t("faq.teamHelp")}</p>
          <a href="mailto:support@zerowaste.com" className="faq-cta__btn">
            {t("faq.contactUs")}
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
