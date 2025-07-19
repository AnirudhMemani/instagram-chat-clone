import { NAVIGATION_ROUTES } from "@/utils/constants";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const navigate = useNavigate();

  // Dummy brand logo images from Pexels
  const brands = [
    "https://randomuser.me/api/portraits/women/10.jpg",
    "https://randomuser.me/api/portraits/women/71.jpg",
    "https://randomuser.me/api/portraits/men/48.jpg",
    "https://randomuser.me/api/portraits/men/60.jpg",
    "https://randomuser.me/api/portraits/men/47.jpg",
    "https://randomuser.me/api/portraits/men/39.jpg",
    "https://randomuser.me/api/portraits/men/68.jpg",
    "https://randomuser.me/api/portraits/women/29.jpg",
    "https://randomuser.me/api/portraits/women/63.jpg",
    "https://randomuser.me/api/portraits/women/54.jpg",
    "https://randomuser.me/api/portraits/women/32.jpg",
    "https://randomuser.me/api/portraits/women/12.jpg",
    "https://randomuser.me/api/portraits/women/77.jpg",
    "https://randomuser.me/api/portraits/women/31.jpg",
    "https://randomuser.me/api/portraits/women/19.jpg",
    "https://randomuser.me/api/portraits/women/70.jpg",
  ];

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Gradient Wave Effects */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Wave 1 - Innermost */}
        <motion.div
          className="absolute h-[300px] w-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(46, 204, 113, 0.10) 0%, rgba(46, 204, 113, 0.05) 40%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.3, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wave 2 */}
        <motion.div
          className="absolute h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(46, 204, 113, 0.12) 0%, rgba(46, 204, 113, 0.04) 40%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        {/* Wave 3 */}
        <motion.div
          className="absolute h-[700px] w-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(46, 204, 113, 0.08) 0%, rgba(46, 204, 113, 0.03) 40%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Wave 4 - Outermost */}
        <motion.div
          className="absolute h-[900px] w-[900px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(46, 204, 113, 0.06) 0%, rgba(46, 204, 113, 0.02) 40%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />

        {/* Rotating gradient rings */}
        <motion.div
          className="absolute h-[600px] w-[600px] rounded-full border-2 border-transparent"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.05), rgba(46, 204, 113, 0.1))",
            maskImage: "radial-gradient(circle, transparent 45%, black 50%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 45%, black 50%, transparent 55%)",
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute h-[800px] w-[800px] rounded-full border-2 border-transparent"
          style={{
            background:
              "conic-gradient(from 180deg, rgba(46, 204, 113, 0.08), rgba(46, 204, 113, 0.03), rgba(46, 204, 113, 0.08))",
            maskImage: "radial-gradient(circle, transparent 48%, black 52%, transparent 56%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 48%, black 52%, transparent 56%)",
          }}
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="bg-mint-200/30 absolute left-10 top-20 h-72 w-72 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="bg-mint-300/20 absolute bottom-20 right-10 h-96 w-96 rounded-full blur-3xl"
          animate={{
            y: [0, 15, 0],
            scale: [1, 0.9, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <motion.h1
              className="font-urbanist text-midnight-900 relative mb-6 text-5xl font-bold leading-tight md:text-7xl lg:text-8xl"
              variants={itemVariants}
            >
              {/* Text glow effect */}
              <div className="font-urbanist from-mint-400 to-mint-600 absolute inset-0 bg-gradient-to-r bg-clip-text text-5xl font-bold leading-tight text-transparent opacity-20 blur-sm md:text-7xl lg:text-8xl">
                Launch Your <span className="font-instrument italic">Idea</span>
                <br />
                in Weeks
              </div>
              Connect{" "}
              <motion.span
                className="font-instrument from-mint-500 to-mint-600 relative bg-gradient-to-r bg-clip-text italic text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Additional glow for the "Instantly" text */}
                <motion.span
                  className="font-instrument text-mint-400 absolute inset-0 italic opacity-30 blur-md"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Instantly
                </motion.span>
                Instantly
              </motion.span>
              <br />
              Anywhere
            </motion.h1>

            <motion.p
              className="font-inter text-midnight-600 mx-auto max-w-3xl text-xl leading-relaxed md:text-2xl"
              variants={itemVariants}
            >
              Experience smooth communication with our next generation chat platform. Connect with friends, teams, and
              communities in real-time with powerful features and crystal clear messaging.
            </motion.p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.button
              onClick={() => navigate(NAVIGATION_ROUTES.LOGIN)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-mint-500 hover:bg-mint-600 font-inter group relative flex items-center space-x-2 overflow-hidden rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              {/* Button glow effect */}
              <div className="from-mint-400 to-mint-600 absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20" />
              <span className="relative z-10">Start Chatting</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </motion.button>

            <motion.button
              onClick={() => scrollToSection("#portfolio")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-midnight-900 font-inter hover:border-mint-300 group rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:bg-gray-50"
            >
              See Features
            </motion.button>
          </motion.div>

          {/* Company Logo Carousel */}
          <motion.div variants={itemVariants} className="mb-12">
            <motion.p
              className="font-inter text-midnight-500 mb-6 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Trusted by millions of users worldwide
            </motion.p>

            {/* Single Line Carousel */}
            <div className="relative mx-auto max-w-5xl overflow-hidden">
              <motion.div
                className="flex items-center space-x-8"
                animate={{
                  x: [0, -1600],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {/* Duplicate brands for seamless loop */}
                {[...brands, ...brands].map((logo, index) => (
                  <motion.div key={index} className="flex-shrink-0" whileHover={{ scale: 1.1 }}>
                    <img
                      src={logo}
                      alt={`Brand ${index + 1}`}
                      className="h-12 w-12 rounded-lg object-cover opacity-60 grayscale transition-opacity duration-300 hover:opacity-100 hover:grayscale-0"
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Gradient Overlays */}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-gray-50 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-gray-50 to-transparent" />
            </div>
          </motion.div>

          {/* Key Stats */}
          <motion.div
            variants={itemVariants}
            className="mx-auto max-w-4xl rounded-2xl border border-white/40 bg-white/60 p-6 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
              <motion.div whileHover={{ scale: 1.05 }} className="group">
                <h3 className="font-urbanist text-mint-600 group-hover:text-mint-700 mb-2 text-3xl font-bold transition-colors">
                  10M+
                </h3>
                <p className="font-inter text-midnight-600 font-medium">Messages Sent</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="group">
                <h3 className="font-urbanist text-mint-600 group-hover:text-mint-700 mb-2 text-3xl font-bold transition-colors">
                  500K+
                </h3>
                <p className="font-inter text-midnight-600 font-medium">Active Users</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="group">
                <h3 className="font-urbanist text-mint-600 group-hover:text-mint-700 mb-2 text-3xl font-bold transition-colors">
                  &lt;1ms
                </h3>
                <p className="font-inter text-midnight-600 font-medium">Message Delivery</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
