"use client";

import { useState, type FormEvent } from "react";
import { PRODUCT_CATEGORIES, SITE } from "@/lib/marketing";

type FormState = {
  name: string;
  business: string;
  phone: string;
  email: string;
  category: string;
  volume: string;
  message: string;
};

const EMPTY: FormState = {
  name: "",
  business: "",
  phone: "",
  email: "",
  category: PRODUCT_CATEGORIES[0].name,
  volume: "",
  message: "",
};

function buildWhatsappUrl(values: FormState): string {
  const lines = [
    "QUIKPACK enquiry",
    `Name: ${values.name}`,
    `Business: ${values.business || "-"}`,
    `Phone/WhatsApp: ${values.phone}`,
    `Email: ${values.email || "-"}`,
    `Category: ${values.category}`,
    `Estimated monthly volume: ${values.volume || "-"}`,
    `Message: ${values.message || "-"}`,
  ];
  return `https://wa.me/${SITE.whatsapp.replace("+", "")}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function EnquiryForm() {
  const [values, setValues] = useState<FormState>(EMPTY);

  function set(field: keyof FormState, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.open(buildWhatsappUrl(values), "_blank", "noopener,noreferrer");
  }

  return (
    <form className="mk-form" onSubmit={submit}>
      <div className="mk-form__row">
        <label>
          <span>Your name</span>
          <input required value={values.name} onChange={(event) => set("name", event.target.value)} autoComplete="name" />
        </label>
        <label>
          <span>Business / organisation</span>
          <input value={values.business} onChange={(event) => set("business", event.target.value)} autoComplete="organization" />
        </label>
      </div>

      <div className="mk-form__row">
        <label>
          <span>Phone / WhatsApp</span>
          <input required type="tel" value={values.phone} onChange={(event) => set("phone", event.target.value)} autoComplete="tel" />
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={values.email} onChange={(event) => set("email", event.target.value)} autoComplete="email" />
        </label>
      </div>

      <div className="mk-form__row">
        <label>
          <span>Product category</span>
          <select value={values.category} onChange={(event) => set("category", event.target.value)}>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category.slug} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Estimated monthly volume</span>
          <input value={values.volume} onChange={(event) => set("volume", event.target.value)} placeholder="e.g. 500 packs" />
        </label>
      </div>

      <label>
        <span>What do you need?</span>
        <textarea rows={5} value={values.message} onChange={(event) => set("message", event.target.value)} placeholder="Tell us about products, pack sizes and delivery location." />
      </label>

      <div className="mk-form__actions">
        <button type="submit" className="mk-button mk-button--primary">
          Send via WhatsApp
        </button>
        <a className="mk-button mk-button--outline" href={SITE.whatsappUrl} target="_blank" rel="noreferrer">
          Chat directly
        </a>
      </div>
      <p className="mk-form__note">This opens WhatsApp with your enquiry prefilled — no separate account needed.</p>
    </form>
  );
}
