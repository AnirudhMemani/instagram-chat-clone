import { NAVIGATION_ROUTES } from "@/utils/constants";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, ExternalLink, TrendingUp, Users } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Portfolio: React.FC = () => {
  const [activeProject, setActiveProject] = useState(0);

  const projects = [
    {
      title: "TeamChat Pro",
      category: "Business Communication",
      description:
        "Enterprise-grade team communication platform with advanced security, file sharing, and integration capabilities.",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
      timeline: "Real-time",
      users: "25K+",
      growth: "99.9% uptime",
      tech: ["WebSocket", "React", "Node.js", "Redis"],
      color: "from-blue-500 to-purple-600",
      accent: "blue",
    },
    {
      title: "CommunityHub",
      category: "Social Platform",
      description:
        "Community-focused chat platform connecting like-minded individuals with topic-based channels and events.",
      image: "https://images.pexels.com/photos/4481322/pexels-photo-4481322.jpeg?auto=compress&cs=tinysrgb&w=800",
      timeline: "Instant",
      users: "100K+",
      growth: "50K daily messages",
      tech: ["WebSocket", "React", "Node.js", "Redis"],
      color: "from-green-500 to-teal-600",
      accent: "green",
    },
    {
      title: "SecureChat",
      category: "Privacy-First Messaging",
      description:
        "End-to-end encrypted messaging platform for healthcare professionals with HIPAA compliance and secure file sharing.",
      image: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800",
      timeline: "Encrypted",
      users: "50K+",
      growth: "Zero breaches",
      tech: ["E2E Encryption", "HIPAA", "AWS"],
      color: "from-pink-500 to-red-600",
      accent: "pink",
    },
    {
      title: "StudyGroup",
      category: "Educational Chat",
      description:
        "Interactive study platform with group chats, screen sharing, and AI-powered study assistance for students.",
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800",
      timeline: "Live",
      users: "200K+",
      growth: "80% retention rate",
      tech: ["WebSocket", "React", "Node.js", "Redis"],
      color: "from-orange-500 to-yellow-600",
      accent: "orange",
    },
    {
      title: "GameChat",
      category: "Gaming Communication",
      description: "Low-latency voice and text chat for gamers with noise cancellation and team coordination features.",
      image: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800",
      timeline: "<10ms latency",
      users: "500K+",
      growth: "1M+ hours/month",
      tech: ["Real-time", "CDN"],
      color: "from-indigo-500 to-purple-600",
      accent: "indigo",
    },
    {
      title: "LocalConnect",
      category: "Neighborhood Chat",
      description:
        "Location-based community chat connecting neighbors for local events, recommendations, and mutual support.",
      image: "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=800",
      timeline: "Location-aware",
      users: "150K+",
      growth: "Active in 500+ cities",
      tech: ["WebSocket", "React", "Node.js", "Redis"],
      color: "from-teal-500 to-cyan-600",
      accent: "teal",
    },
  ];

  const navigate = useNavigate();

  const nextProject = () => {
    setActiveProject((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setActiveProject((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const getAccentColor = (accent: string) => {
    const colors = {
      blue: "border-blue-500 bg-blue-50 text-blue-700",
      green: "border-green-500 bg-green-50 text-green-700",
      pink: "border-pink-500 bg-pink-50 text-pink-700",
      orange: "border-orange-500 bg-orange-50 text-orange-700",
      indigo: "border-indigo-500 bg-indigo-50 text-indigo-700",
      teal: "border-teal-500 bg-teal-50 text-teal-700",
    };
    return colors[accent as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="portfolio" className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-24">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="bg-mint-200/20 absolute left-10 top-20 h-64 w-64 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="bg-mint-300/15 absolute bottom-20 right-10 h-80 w-80 rounded-full blur-3xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.8, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
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
            Chat Solutions for{" "}
            <span className="from-mint-500 to-mint-600 bg-gradient-to-r bg-clip-text text-transparent">Every Need</span>
          </h2>
          <p className="font-inter text-midnight-600 mx-auto max-w-3xl text-xl">
            From business teams to gaming communities. See how our platform adapts to different communication needs.
          </p>
        </motion.div>

        {/* Featured Project Showcase */}
        <div className="mb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProject}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                {/* Project Image */}
                <motion.div className="group relative" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    <img
                      src={projects[activeProject].image}
                      alt={projects[activeProject].title}
                      className="h-80 w-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${projects[activeProject].color} opacity-60 transition-opacity duration-500 group-hover:opacity-40`}
                    />

                    {/* Floating Elements */}
                    <motion.div
                      className="absolute right-6 top-6 rounded-full bg-white/20 p-3 backdrop-blur-sm"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                    >
                      <ExternalLink className="h-6 w-6 text-white" />
                    </motion.div>

                    <div className="absolute bottom-6 left-6">
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-medium ${getAccentColor(projects[activeProject].accent)} border-2`}
                      >
                        {projects[activeProject].category}
                      </span>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <motion.div
                    className="bg-mint-200/30 absolute -left-4 -top-4 h-24 w-24 rounded-full blur-xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="bg-mint-300/20 absolute -bottom-4 -right-4 h-32 w-32 rounded-full blur-xl"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>

                {/* Project Details */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-urbanist text-midnight-900 mb-3 text-3xl font-bold md:text-4xl">
                      {projects[activeProject].title}
                    </h3>
                    <p className="font-inter text-midnight-600 text-lg leading-relaxed">
                      {projects[activeProject].description}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-6">
                    <motion.div
                      className="rounded-2xl border border-white/40 bg-white/60 p-4 text-center backdrop-blur-sm"
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <Calendar className="text-mint-500 mx-auto mb-2 h-6 w-6" />
                      <p className="font-urbanist text-midnight-900 text-lg font-bold">
                        {projects[activeProject].timeline}
                      </p>
                      <p className="font-inter text-midnight-600 text-sm">Speed</p>
                    </motion.div>

                    <motion.div
                      className="rounded-2xl border border-white/40 bg-white/60 p-4 text-center backdrop-blur-sm"
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <Users className="text-mint-500 mx-auto mb-2 h-6 w-6" />
                      <p className="font-urbanist text-midnight-900 text-lg font-bold">
                        {projects[activeProject].users}
                      </p>
                      <p className="font-inter text-midnight-600 text-sm">Users</p>
                    </motion.div>

                    <motion.div
                      className="rounded-2xl border border-white/40 bg-white/60 p-4 text-center backdrop-blur-sm"
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <TrendingUp className="text-mint-500 mx-auto mb-2 h-6 w-6" />
                      <p className="font-urbanist text-midnight-900 text-lg font-bold">
                        {projects[activeProject].growth}
                      </p>
                      <p className="font-inter text-midnight-600 text-sm">Performance</p>
                    </motion.div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <h4 className="font-urbanist text-midnight-900 mb-3 text-lg font-semibold">Key Features</h4>
                    <div className="flex flex-wrap gap-3">
                      {projects[activeProject].tech.map((tech, index) => (
                        <motion.span
                          key={tech}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-mint-100 text-mint-700 hover:bg-mint-200 border-mint-200 rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-200"
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-12 flex items-center justify-center space-x-6">
            <motion.button
              onClick={prevProject}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hover:bg-mint-50 hover:border-mint-200 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200"
            >
              <ChevronLeft className="text-midnight-600 h-6 w-6" />
            </motion.button>

            {/* Project Indicators */}
            <div className="flex space-x-3">
              {projects.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveProject(index)}
                  whileHover={{ scale: 1.2 }}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === activeProject ? "bg-mint-500 w-8" : "hover:bg-mint-300 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextProject}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hover:bg-mint-50 hover:border-mint-200 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200"
            >
              <ChevronRight className="text-midnight-600 h-6 w-6" />
            </motion.button>
          </div>
        </div>

        {/* Project Grid - Smaller Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className="font-urbanist text-midnight-900 mb-12 text-center text-2xl font-bold">More Chat Solutions</h3>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, rotateY: 2 }}
                onClick={() => setActiveProject(index)}
                className={`group cursor-pointer overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition-all duration-500 hover:shadow-2xl ${
                  index === activeProject ? "border-mint-300" : "border-gray-100"
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${project.color} opacity-70 transition-opacity duration-500 group-hover:opacity-50`}
                  />

                  <div className="absolute right-4 top-4">
                    <motion.div
                      whileHover={{ rotate: 15 }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                    >
                      <ExternalLink className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-urbanist text-midnight-900 mb-2 text-lg font-bold">{project.title}</h4>
                  <p className="font-inter text-midnight-600 mb-4 line-clamp-2 text-sm">{project.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-inter text-mint-600 font-medium">{project.users} users</span>
                    <span className="font-inter text-midnight-500">{project.timeline}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="from-mint-50 to-mint-100 relative overflow-hidden rounded-3xl bg-gradient-to-r p-12">
            {/* Decorative elements */}
            <motion.div
              className="bg-mint-200/30 absolute left-0 top-0 h-32 w-32 rounded-full blur-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="bg-mint-300/20 absolute bottom-0 right-0 h-24 w-24 rounded-full blur-2xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10">
              <h3 className="font-urbanist text-midnight-900 mb-4 text-3xl font-bold">
                Ready to Transform Your Communication?
              </h3>
              <p className="font-inter text-midnight-600 mx-auto mb-8 max-w-2xl text-lg">
                Join thousands of users who have revolutionized their communication experience. Start chatting today.
              </p>
              <motion.button
                onClick={() => navigate(NAVIGATION_ROUTES.LOGIN)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-mint-500 hover:bg-mint-600 font-inter rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                Start Your Chat Experience
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
