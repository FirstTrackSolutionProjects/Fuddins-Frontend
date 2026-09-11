import { useState } from 'react';
import ContactForm from './ContactForm';

const faqs = [
  ['What is fuddins?', 'Fuddins is an online home-delivery service for food, groceries, vegetables, fruits, dairy, beverages, snacks, household items, beauty products, baby care, garments, pharma, footwear, electronics, and more.'],
  ['Do you provide home delivery services?', 'Yes, we provide doorstep delivery services on time.'],
  ['How can I sell my products on Fuddins?', 'Are you a vendor? Looking for a partner with us? Feel free to contact us or visit the partner page.'],
  ['Where is this service available?', 'We currently deliver across major cities in Odisha.'],
  ['How can I download the Fuddins app?', 'You can download the Fuddins application directly from the Play Store or the link provided in the website footer.'],
  ['Carrier with us?', 'Looking for a career with Fuddins? Feel free to contact us at carrier@fuddins.com.'],
];

const ContactPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return <section className="contact-page">
    <header className="contact-hero"><h1>Get In Touch</h1></header>
    <section className="contact-details"><img src="/images/basil-leaf.webp" alt="" className="contact-leaf" />
      <div className="contact-detail-grid">
        <a href="tel:+919692409083" className="contact-detail"><span>☎</span><p>+91 9692409083&nbsp; +91 9040170727</p></a>
        <a href="mailto:info@fuddins.com" className="contact-detail"><span>✉</span><p>info@fuddins.com<br />support@fuddins.com</p></a>
        <a className="contact-detail contact-location" href="https://www.google.com/maps/search/?api=1&query=BMC+Bhawani+Mall%2C+Saheed+Nagar%2C+Bhubaneswar%2C+Odisha+751007" target="_blank" rel="noreferrer" aria-label="Open Fuddins office location in Google Maps"><svg className="contact-location-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-13a7 7 0 1 0-14 0c0 6.8 7 13 7 13Z" /><circle cx="12" cy="9" r="2.5" /></svg><p>Block 2, 3rd Floor, BMC Bhawani Mall,<br />Saheed Nagar, Bhubaneswar, Odisha-751007</p></a>
      </div>
    </section>
    <section className="contact-faq"><h2>Frequently Asked Question!</h2><img src="/images/logo-leaf-new.webp" alt="" />
      <div className="faq-grid">{faqs.map(([question, answer], index) => <article className="faq-item" key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}><b>{question}</b><span>{openFaq === index ? '⌃' : '›'}</span></button>{openFaq === index ? <p>{answer}</p> : null}</article>)}</div>
    </section>
    <section className="contact-message"><h2>Send us a message</h2><ContactForm /></section>
  </section>;
};

export default ContactPage;
