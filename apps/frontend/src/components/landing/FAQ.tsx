import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Is the chat app free to use?",
      answer: "Yes! Our chat features are completely free for personal use.",
    },
    {
      question: "How secure are my conversations?",
      answer:
        "Your privacy and security are our top priorities. All messages are protected with end-to-end encryption, meaning only you and your recipients can read them. We use military-grade 256-bit encryption and follow zero-knowledge architecture principles - we can't access your messages even if we wanted to.",
    },
    {
      question: "Can I use the app on multiple devices?",
      answer:
        "Absolutely! Our chat app works seamlessly across all your devices - phone, tablet, desktop, and web browser. Your messages sync instantly across all devices, so you can start a conversation on your phone and continue it on your computer without missing a beat.",
    },
    {
      question: "What file types can I share in chats?",
      answer:
        "You can share almost any file type including photos, videos, documents, PDFs, audio files, and more. Free users get 100MB per file, while premium users can share files up to 2GB. We also support drag-and-drop functionality for easy file sharing.",
    },
    {
      question: "How do group chats and channels work?",
      answer:
        "Create unlimited group chats with up to 1000 members each. You can organize conversations into channels by topic, set different permission levels for members, and use moderation tools to keep discussions on track. Perfect for teams, communities, or family groups.",
    },
    {
      question: "Can I make voice and video calls?",
      answer:
        "Yes! Our platform supports high-quality voice and video calls for individuals and groups. Features include screen sharing, noise cancellation, and recording capabilities. All calls are encrypted and work smoothly even on slower internet connections.",
    },
    // {
    //   question: "Is there an AI assistant feature?",
    //   answer:
    //     "Our AI assistant can help with various tasks like language translation, message summarization, scheduling, and answering questions. The AI is privacy-focused and processes requests without storing your personal data. You can enable or disable AI features at any time.",
    // },
    {
      question: "How do I report inappropriate content or users?",
      answer:
        "We have robust reporting and moderation tools. You can report messages, users, or entire channels with just a few clicks. Our moderation team reviews reports quickly, and we have automated systems to detect and prevent spam, harassment, and other inappropriate content.",
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
            Everything you need to know about our chat platform and features.
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
              Our support team is here to help. Contact us anytime for assistance with the platform.
            </p>
            <button
              onClick={() => {
                const element = document.querySelector("#contact");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-mint-500 hover:bg-mint-600 font-inter transform rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
