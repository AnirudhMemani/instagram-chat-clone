import { NAVIGATION_ROUTES } from "@/utils/constants";
import { motion } from "framer-motion";
import { ArrowUpRight, Zap } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Contact", href: "#contact" },
    { name: "FAQ", href: "#faq" },
  ];

  const navigate = useNavigate();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-midnight-900 relative overflow-hidden text-white">
      {/* Subtle animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="bg-mint-500/5 absolute right-0 top-0 h-96 w-96 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left Side - Brand & CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Logo */}
              <div className="mb-6 flex items-center space-x-3">
                <motion.div
                  className="from-mint-500 to-mint-600 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Zap className="h-7 w-7 text-white" />
                </motion.div>
                <span className="font-urbanist text-3xl font-bold">Voxella</span>
              </div>

              <h3 className="font-urbanist mb-4 text-2xl font-bold leading-tight md:text-3xl">
                Ready to connect with{" "}
                <span className="from-mint-400 to-mint-500 bg-gradient-to-r bg-clip-text text-transparent">
                  the world?
                </span>
              </h3>

              <p className="font-inter mb-8 max-w-md text-lg text-gray-300">
                Join millions of users who trust our platform for seamless communication.
              </p>

              <motion.button
                onClick={() => navigate(NAVIGATION_ROUTES.LOGIN)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-mint-500 hover:bg-mint-600 font-inter group flex items-center space-x-2 rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <span>Start Chatting</span>
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ArrowUpRight className="h-5 w-5" />
                </motion.div>
              </motion.button>
            </motion.div>

            {/* Right Side - Quick Links & Contact */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:text-right"
            >
              {/* Quick Links */}
              <div className="mb-8">
                <h4 className="font-urbanist mb-6 text-xl font-semibold">Quick Links</h4>
                <div className="flex flex-wrap gap-6 lg:justify-end">
                  {quickLinks.map((link) => (
                    <motion.button
                      key={link.name}
                      onClick={() => scrollToSection(link.href)}
                      whileHover={{ scale: 1.05, x: -5 }}
                      className="font-inter hover:text-mint-400 text-lg text-gray-300 transition-colors duration-200"
                    >
                      {link.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <motion.a
                  href="mailto:support@chatapp.com"
                  whileHover={{ scale: 1.02 }}
                  className="font-inter hover:text-mint-400 block text-xl text-white transition-colors duration-200"
                >
                  support@voxella.com
                </motion.a>
                <motion.a
                  href="tel:+15551234567"
                  whileHover={{ scale: 1.02 }}
                  className="font-inter hover:text-mint-400 block text-lg text-gray-300 transition-colors duration-200"
                >
                  +91 1234 56 7890
                </motion.a>
                <p className="font-inter text-gray-400">Bangalore, IN</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 py-8"
        >
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="font-inter text-gray-400">© {currentYear} ChatApp. Connecting the world.</p>

            <div className="flex items-center space-x-8">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                className="font-inter hover:text-mint-400 text-gray-400 transition-colors duration-200"
              >
                Privacy
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                className="font-inter hover:text-mint-400 text-gray-400 transition-colors duration-200"
              >
                Terms
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
