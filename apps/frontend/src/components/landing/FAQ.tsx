import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How can you build an MVP in just 2-4 weeks?",
      answer:
        "Our AI-powered development process automates many time-consuming tasks like code generation, testing, and deployment setup. Combined with our experienced team and proven frameworks, we can deliver production-ready MVPs faster than traditional development methods while maintaining high quality standards.",
    },
    {
      question: "What technologies do you use for MVP development?",
      answer:
        "We use modern, scalable technologies including React/Next.js for frontend, Node.js/Express for backend, PostgreSQL/MongoDB for databases, and cloud platforms like AWS or Vercel for deployment. We choose the best tech stack based on your specific requirements and scalability needs.",
    },
    {
      question: "How much does an MVP development project cost?",
      answer:
        "Our MVP development packages start from $15K for basic applications and can go up to $50K for complex platforms with AI integration. The final cost depends on features, complexity, and timeline. We provide transparent pricing with no hidden fees after our initial consultation.",
    },
    {
      question: "Do you provide ongoing support after the MVP launch?",
      answer:
        "Yes! We offer comprehensive post-launch support including bug fixes, feature updates, scaling assistance, and technical consultation. Our support packages range from basic maintenance to full-service growth partnerships as your startup evolves.",
    },
    {
      question: "Can you help with user testing and market validation?",
      answer:
        "Absolutely! We include user research and testing as part of our MVP process. We help you validate assumptions, gather user feedback, analyze usage patterns, and iterate based on real user data to ensure your MVP resonates with your target market.",
    },
    {
      question: "What if I need changes during development?",
      answer:
        "We work in weekly sprints with regular check-ins, allowing for feedback and adjustments throughout the development process. Minor changes are included, while major scope changes are handled through our flexible change request process to keep projects on track.",
    },
    {
      question: "How do you ensure the quality and security of the MVP?",
      answer:
        "We follow enterprise-grade security practices including data encryption, secure authentication, OWASP compliance, and regular security audits. All code goes through automated testing, peer review, and quality assurance before deployment.",
    },
    {
      question: "Can you help with fundraising and investor presentations?",
      answer:
        "While we focus on MVP development, we can provide technical documentation, architecture diagrams, and development roadmaps that are often required for investor presentations. We also have partnerships with VCs and can make introductions for promising startups.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-urbanist text-midnight-900 mb-6 text-4xl font-bold md:text-5xl">
            Frequently Asked{" "}
            <span className="from-mint-500 to-mint-600 bg-gradient-to-r bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="font-inter text-midnight-600 mx-auto max-w-2xl text-xl">
            Everything you need to know about our MVP development process and services.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between px-6 py-6 text-left focus:outline-none"
              >
                <h3 className="font-urbanist text-midnight-900 pr-8 text-lg font-semibold">{faq.question}</h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="text-mint-500 h-6 w-6" />
                  ) : (
                    <Plus className="text-midnight-400 h-6 w-6" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="font-inter text-midnight-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="from-mint-50 to-mint-100 rounded-3xl bg-gradient-to-r p-8">
            <h3 className="font-urbanist text-midnight-900 mb-4 text-2xl font-bold">Still have questions?</h3>
            <p className="font-inter text-midnight-600 mb-6 text-lg">
              Our team is here to help. Schedule a free consultation to discuss your project.
            </p>
            <button
              onClick={() => {
                const element = document.querySelector("#contact");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-mint-500 hover:bg-mint-600 font-inter transform rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Schedule Free Consultation
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
