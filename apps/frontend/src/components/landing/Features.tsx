import { NAVIGATION_ROUTES } from "@/utils/constants";
import { motion } from "framer-motion";
import { BarChart, Bot, Cloud, Code, Cpu, Database, Lock, Rocket, Shield, Smartphone, Users, Zap } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: Bot,
      title: "Smart Messaging",
      description:
        "Enjoy enhanced messaging with smart features like quick replies, message scheduling, and typing indicators to make your conversations more efficient.",
      color: "from-mint-400 to-mint-600",
      bgColor: "from-mint-50 to-mint-100",
      stats: "Smart Features",
      details: ["Quick replies", "Message scheduling", "Typing indicators", "Read receipts"],
    },
    {
      icon: Rocket,
      title: "Fast & Reliable",
      description:
        "Send and receive messages quickly with our optimized messaging system that works even with slower connections.",
      color: "from-blue-400 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      stats: "Reliable Delivery",
      details: ["Message status", "Delivery confirmations", "Offline mode", "Low data usage"],
    },
    {
      icon: Users,
      title: "Group Chats",
      description:
        "Create group conversations with friends, family or colleagues to share moments, plan events or discuss ideas together.",
      color: "from-purple-400 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      stats: "Up to 100 Members",
      details: ["Group creation", "Photo sharing", "Emoji reactions", "Polls & voting"],
    },
    {
      icon: Shield,
      title: "Private Conversations",
      description:
        "Your messages are private and secure with standard encryption and privacy controls that keep your conversations confidential.",
      color: "from-red-400 to-red-600",
      bgColor: "from-red-50 to-red-100",
      stats: "Privacy Controls",
      details: ["Message privacy", "Block unwanted contacts", "Report system", "Account security"],
    },
  ];

  const navigate = useNavigate();

  const techFeatures = [
    { icon: Database, title: "Message History", desc: "Searchable chat logs", color: "text-blue-600" },
    { icon: Cloud, title: "Cloud Sync", desc: "Cross-device sync", color: "text-green-600" },
    { icon: Lock, title: "Privacy First", desc: "Your data stays private", color: "text-red-600" },
    { icon: Cpu, title: "Smart Features", desc: "AI-powered assistance", color: "text-purple-600" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="features" className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-24">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="bg-mint-200/20 absolute left-20 top-20 h-72 w-72 rounded-full blur-3xl"
          animate={{
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="bg-mint-300/15 absolute bottom-20 right-20 h-96 w-96 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 0.7, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-urbanist text-midnight-900 mb-6 text-4xl font-bold md:text-5xl">
            Everything You Need to{" "}
            <span className="from-mint-500 to-mint-600 bg-gradient-to-r bg-clip-text text-transparent">
              Stay Connected
            </span>
          </h2>
          <p className="font-inter text-midnight-600 mx-auto max-w-3xl text-xl">
            Our comprehensive chat platform provides all the tools you need for great communication, collaboration, and
            connection with the people who matter most.
          </p>
        </motion.div>

        {/* Balanced Bento Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Large AI Feature Card - Spans 2 columns */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotateY: 2 }}
            className="from-mint-50 to-mint-100 border-mint-200/50 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 shadow-lg transition-all duration-500 hover:shadow-2xl lg:col-span-2"
          >
            {/* Decorative elements */}
            <motion.div
              className="bg-mint-200/30 absolute right-0 top-0 h-40 w-40 rounded-full blur-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="bg-mint-300/20 absolute bottom-0 left-0 h-32 w-32 rounded-full blur-2xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10">
              {(() => {
                const MainFeatureIcon = mainFeatures[0].icon;
                return (
                  <motion.div
                    className={`h-16 w-16 bg-gradient-to-r ${mainFeatures[0].color} mb-6 flex items-center justify-center rounded-2xl`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <MainFeatureIcon className="h-8 w-8 text-white" />
                  </motion.div>
                );
              })()}

              <h3 className="font-urbanist text-midnight-900 mb-4 text-2xl font-bold">{mainFeatures[0].title}</h3>

              <p className="font-inter text-midnight-600 mb-6 leading-relaxed">{mainFeatures[0].description}</p>

              <div className="mb-6 flex items-center justify-between">
                <div className="bg-mint-200/50 text-mint-700 font-urbanist rounded-full px-4 py-2 text-lg font-bold">
                  {mainFeatures[0].stats}
                </div>
                <Zap className="text-mint-600 h-6 w-6" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {mainFeatures[0].details.map((detail, index) => (
                  <motion.div
                    key={detail}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="text-midnight-600 flex items-center text-sm"
                  >
                    <div className="bg-mint-500 mr-2 h-2 w-2 rounded-full" />
                    {detail}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Rapid MVP Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotateY: 1 }}
            className="relative overflow-hidden rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg transition-all duration-500 hover:shadow-xl"
          >
            <div className="relative z-10">
              {(() => {
                const FeatureIcon = mainFeatures[1].icon;
                return (
                  <motion.div
                    className={`h-12 w-12 bg-gradient-to-r ${mainFeatures[1].color} mb-4 flex items-center justify-center rounded-xl`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FeatureIcon className="h-6 w-6 text-white" />
                  </motion.div>
                );
              })()}

              <h3 className="font-urbanist text-midnight-900 mb-3 text-lg font-semibold">{mainFeatures[1].title}</h3>

              <p className="font-inter text-midnight-600 mb-4 text-sm leading-relaxed">{mainFeatures[1].description}</p>

              <span
                className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium ${mainFeatures[1].bgColor} text-midnight-700`}
              >
                {mainFeatures[1].stats}
              </span>
            </div>
          </motion.div>

          {/* User-Centric Design Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotateY: 1 }}
            className="relative overflow-hidden rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-lg transition-all duration-500 hover:shadow-xl"
          >
            <div className="relative z-10">
              {(() => {
                const FeatureIcon = mainFeatures[2].icon;
                return (
                  <motion.div
                    className={`h-12 w-12 bg-gradient-to-r ${mainFeatures[2].color} mb-4 flex items-center justify-center rounded-xl`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FeatureIcon className="h-6 w-6 text-white" />
                  </motion.div>
                );
              })()}

              <h3 className="font-urbanist text-midnight-900 mb-3 text-lg font-semibold">{mainFeatures[2].title}</h3>

              <p className="font-inter text-midnight-600 mb-4 text-sm leading-relaxed">{mainFeatures[2].description}</p>

              <span
                className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium ${mainFeatures[2].bgColor} text-midnight-700`}
              >
                {mainFeatures[2].stats}
              </span>
            </div>
          </motion.div>

          {/* Security Feature Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotateY: 1 }}
            className="relative overflow-hidden rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg transition-all duration-500 hover:shadow-xl"
          >
            <div className="relative z-10">
              {(() => {
                const FeatureIcon = mainFeatures[3].icon;
                return (
                  <motion.div
                    className={`h-12 w-12 bg-gradient-to-r ${mainFeatures[3].color} mb-4 flex items-center justify-center rounded-xl`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FeatureIcon className="h-6 w-6 text-white" />
                  </motion.div>
                );
              })()}

              <h3 className="font-urbanist text-midnight-900 mb-3 text-lg font-semibold">{mainFeatures[3].title}</h3>

              <p className="font-inter text-midnight-600 mb-4 text-sm leading-relaxed">{mainFeatures[3].description}</p>

              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium ${mainFeatures[3].bgColor} text-midnight-700`}
                >
                  {mainFeatures[3].stats}
                </span>
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-red-600" />
                  <span className="font-inter text-midnight-600 text-xs">Mobile Ready</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tech Stack Card - Spans full width */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, rotateY: -1 }}
            className="relative overflow-hidden rounded-3xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg transition-all duration-500 hover:shadow-2xl lg:col-span-3"
          >
            <motion.div
              className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-gray-200/30 blur-2xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-center">
                <motion.div
                  className="mr-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-gray-600 to-gray-800"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Code className="h-7 w-7 text-white" />
                </motion.div>
                <div className="text-center">
                  <h3 className="font-urbanist text-midnight-900 text-2xl font-bold">Advanced Chat Features</h3>
                  <p className="font-inter text-midnight-600">Powered by cutting-edge technology</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {techFeatures.map((tech, index) => {
                  const TechIcon = tech.icon;
                  return (
                    <motion.div
                      key={tech.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="rounded-xl border border-white/40 bg-white/60 p-6 text-center backdrop-blur-sm transition-all duration-200 hover:bg-white/80"
                    >
                      <TechIcon className={`h-8 w-8 ${tech.color} mx-auto mb-3`} />
                      <div className="font-inter text-midnight-700 mb-2 text-sm font-medium">{tech.title}</div>
                      <div className="font-inter text-midnight-500 text-xs">{tech.desc}</div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                  <span className="font-inter text-midnight-600 text-sm">Mobile-first & Responsive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5 text-gray-600" />
                  <span className="font-inter text-midnight-600 text-sm">Analytics Built-in</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="from-mint-50 to-mint-100 relative overflow-hidden rounded-3xl bg-gradient-to-r p-12">
            {/* Animated background elements */}
            <motion.div
              className="bg-mint-200/20 absolute left-0 top-0 h-32 w-32 rounded-full blur-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="bg-mint-300/20 absolute bottom-0 right-0 h-24 w-24 rounded-full blur-2xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10">
              <h3 className="font-urbanist text-midnight-900 mb-4 text-2xl font-bold md:text-3xl">
                Ready to Start Chatting?
              </h3>
              <p className="font-inter text-midnight-600 mx-auto mb-8 max-w-2xl text-lg">
                Join millions of users who trust our platform for their daily communication needs.
              </p>
              <motion.button
                onClick={() => navigate(NAVIGATION_ROUTES.LOGIN)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-mint-500 hover:bg-mint-600 font-inter rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                Join the Conversation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
