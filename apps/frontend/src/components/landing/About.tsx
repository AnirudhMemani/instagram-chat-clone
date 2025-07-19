import React from "react";
import { Award, Users, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

const About: React.FC = () => {
  const stats = [
    { number: "10M+", label: "Messages Daily" },
    { number: "99.9%", label: "Uptime" },
    { number: "500K+", label: "Active Users" },
    { number: "<1ms", label: "Message Latency" },
  ];

  const team = [
    {
      name: "Alex Chen",
      role: "CEO & Founder",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Former WhatsApp engineer with 10+ years building messaging platforms",
    },
    {
      name: "Maria Santos",
      role: "Head of Product",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Ex-Slack PM who designed features used by millions daily",
    },
    {
      name: "David Kim",
      role: "VP of Engineering",
      image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Real-time systems expert who built infrastructure for Discord",
    },
    {
      name: "Sarah Johnson",
      role: "Head of Design",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Award-winning UX designer focused on intuitive communication experiences",
    },
  ];

  const statsVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const statItemVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotateX: -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const teamVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const teamMemberVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateY: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="about" className="bg-gradient-to-br from-gray-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-urbanist text-midnight-900 mb-6 text-4xl font-bold md:text-5xl">
            The Team Behind Your{" "}
            <span className="from-mint-500 to-mint-600 bg-gradient-to-r bg-clip-text text-transparent">Connection</span>
          </h2>
          <p className="font-inter text-midnight-600 mx-auto max-w-3xl text-xl">
            We're passionate about bringing people together through technology. Our mission is to create the most
            intuitive and secure chat experience possible.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={statsVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20 grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={statItemVariants}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 },
              }}
              className="text-center"
            >
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-500 hover:shadow-2xl">
                {/* Subtle animated background */}
                <div className="from-mint-50/0 to-mint-100/0 hover:from-mint-50/20 hover:to-mint-100/10 absolute inset-0 bg-gradient-to-br transition-all duration-500" />

                <div className="relative z-10">
                  <motion.h3
                    className="font-urbanist text-mint-600 mb-2 text-3xl font-bold md:text-4xl"
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.5, type: "spring" }}
                  >
                    {stat.number}
                  </motion.h3>
                  <p className="font-inter text-midnight-600 font-medium">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative mb-20 overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:p-12"
        >
          {/* Animated background elements */}
          <div className="bg-mint-100/30 animate-pulse-soft absolute right-0 top-0 h-40 w-40 rounded-full" />
          <div className="bg-mint-200/20 animate-bounce-gentle absolute bottom-0 left-0 h-32 w-32 rounded-full" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <h3 className="font-urbanist text-midnight-900 mb-6 text-3xl font-bold">Our Mission</h3>
              <p className="font-inter text-midnight-600 mb-6 text-lg leading-relaxed">
                We believe communication should be effortless, secure, and meaningful. That's why we've built a platform
                that combines cutting-edge technology with intuitive design to deliver the best chat experience
                possible.
              </p>
              <p className="font-inter text-midnight-600 text-lg leading-relaxed">
                Our team understands the importance of staying connected – we've experienced the frustration of
                unreliable messaging apps and the joy of seamless communication when it works perfectly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Award, title: "Quality First", desc: "Premium chat experience" },
                { icon: Zap, title: "Lightning Fast", desc: "Instant message delivery" },
                { icon: Users, title: "User-Centric", desc: "Built for seamless communication" },
                { icon: Target, title: "Privacy Focused", desc: "Your conversations stay private" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                  whileHover={{ scale: 1.05, rotateZ: 2 }}
                  className="bg-mint-50 hover:bg-mint-100 rounded-2xl p-6 text-center transition-all duration-300"
                >
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <item.icon className="text-mint-600 mx-auto mb-3 h-8 w-8" />
                  </motion.div>
                  <h4 className="font-urbanist text-midnight-900 mb-2 font-semibold">{item.title}</h4>
                  <p className="font-inter text-midnight-600 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="font-urbanist text-midnight-900 mb-12 text-center text-3xl font-bold">Meet the Team</h3>

          <motion.div
            variants={teamVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                variants={teamMemberVariants}
                whileHover={{
                  y: -5,
                  rotateY: 3,
                  transition: { duration: 0.3 },
                }}
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-lg transition-all duration-500 hover:shadow-2xl"
              >
                // Subtle hover effect
                <div className="from-mint-50/0 to-mint-100/0 hover:from-mint-50/20 hover:to-mint-100/10 absolute inset-0 rounded-2xl bg-gradient-to-br transition-all duration-500" />

                <div className="relative z-10">
                  <motion.img
                    src={member.image}
                    alt={member.name}
                    className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                  <h4 className="font-urbanist text-midnight-900 mb-1 text-lg font-semibold">{member.name}</h4>
                  <p className="font-inter text-mint-600 mb-3 font-medium">{member.role}</p>
                  <p className="font-inter text-midnight-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div> */}
      </div>
    </section>
  );
};

export default About;
