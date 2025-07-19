import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    budget: "",
    timeline: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        company: "",
        budget: "",
        timeline: "",
        message: "",
      });
    }, 3000);
  };

  return (
    <section id="contact" className="bg-gradient-to-br from-gray-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-urbanist text-midnight-900 mb-6 text-4xl font-bold md:text-5xl">
            Ready to{" "}
            <span className="from-mint-500 to-mint-600 bg-gradient-to-r bg-clip-text text-transparent">
              Start Chatting?
            </span>
          </h2>
          <p className="font-inter text-midnight-600 mx-auto max-w-3xl text-xl">
            Get in touch with our team for support, feedback, or partnership opportunities. We'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-urbanist text-midnight-900 mb-6 text-2xl font-bold">Get in Touch</h3>
              <p className="font-inter text-midnight-600 mb-8 text-lg leading-relaxed">
                Whether you need technical support, want to share feedback, or are interested in partnership
                opportunities, our team is here to help.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-mint-100 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Mail className="text-mint-600 h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-urbanist text-midnight-900 font-semibold">Email</h4>
                  <p className="font-inter text-midnight-600">support@chatapp.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-mint-100 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Phone className="text-mint-600 h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-urbanist text-midnight-900 font-semibold">Phone</h4>
                  <p className="font-inter text-midnight-600">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-mint-100 flex h-12 w-12 items-center justify-center rounded-xl">
                  <MapPin className="text-mint-600 h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-urbanist text-midnight-900 font-semibold">Location</h4>
                  <p className="font-inter text-midnight-600">San Francisco, CA</p>
                </div>
              </div>
            </div>

            <div className="bg-mint-50 rounded-2xl p-6">
              <h4 className="font-urbanist text-midnight-900 mb-3 font-semibold">How We Can Help</h4>
              <ul className="font-inter text-midnight-600 space-y-2">
                <li>• Technical support and troubleshooting</li>
                <li>• Feature requests and feedback</li>
                <li>• Business partnership opportunities</li>
                <li>• Custom integration assistance</li>
                <li>• Account and billing questions</li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl"
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="font-inter text-midnight-900 mb-2 block font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="focus:border-mint-500 focus:ring-mint-200 font-inter w-full rounded-xl border border-gray-300 px-4 py-3 transition-colors focus:ring-2"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="font-inter text-midnight-900 mb-2 block font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="focus:border-mint-500 focus:ring-mint-200 font-inter w-full rounded-xl border border-gray-300 px-4 py-3 transition-colors focus:ring-2"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="font-inter text-midnight-900 mb-2 block font-medium">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="focus:border-mint-500 focus:ring-mint-200 font-inter w-full rounded-xl border border-gray-300 px-4 py-3 transition-colors focus:ring-2"
                    placeholder="Your Company"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="budget" className="font-inter text-midnight-900 mb-2 block font-medium">
                      Inquiry Type
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="focus:border-mint-500 focus:ring-mint-200 font-inter w-full rounded-xl border border-gray-300 px-4 py-3 transition-colors focus:ring-2"
                    >
                      <option value="">Select inquiry type</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feature Request/Feedback</option>
                      <option value="partnership">Business Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timeline" className="font-inter text-midnight-900 mb-2 block font-medium">
                      Priority Level
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="focus:border-mint-500 focus:ring-mint-200 font-inter w-full rounded-xl border border-gray-300 px-4 py-3 transition-colors focus:ring-2"
                    >
                      <option value="">Select priority</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="font-inter text-midnight-900 mb-2 block font-medium">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="focus:border-mint-500 focus:ring-mint-200 font-inter w-full resize-none rounded-xl border border-gray-300 px-4 py-3 transition-colors focus:ring-2"
                    placeholder="Please describe your inquiry, issue, or feedback in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="bg-mint-500 hover:bg-mint-600 font-inter flex w-full transform items-center justify-center space-x-2 rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Message</span>
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <CheckCircle className="text-mint-500 mx-auto mb-6 h-16 w-16" />
                <h3 className="font-urbanist text-midnight-900 mb-4 text-2xl font-bold">Message Sent Successfully!</h3>
                <p className="font-inter text-midnight-600 text-lg">
                  Thank you for contacting us. We'll get back to you within 24 hours with a response to your inquiry.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
