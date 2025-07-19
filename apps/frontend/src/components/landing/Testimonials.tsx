import { NAVIGATION_ROUTES } from "@/utils/constants";
import { motion } from "framer-motion";
import { Award, Heart, Lightbulb, Quote, Star, Target } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Ali",
      role: "Team Lead",
      company: "Amazon",
      image: "https://randomuser.me/api/portraits/women/15.jpg",
      content:
        "This chat app transformed how our team communicates. The features and instant messaging have made collaboration effortless.",
      rating: 5,
      results: "50% faster communication",
      color: "from-blue-500 to-purple-600",
      accent: "blue",
    },
    {
      name: "Aarav Joshi",
      role: "Project Manager",
      company: "GreenLogistics",
      image: "https://randomuser.me/api/portraits/men/65.jpg",
      content:
        "The security and reliability are outstanding. We can trust this platform with our sensitive business communications.",
      rating: 5,
      results: "Zero security incidents",
      color: "from-green-500 to-teal-600",
      accent: "green",
    },
    {
      name: "Jiya Verma",
      role: "Community Manager",
      company: "HealthConnect",
      image: "https://randomuser.me/api/portraits/women/63.jpg",
      content:
        "Managing our community of thousands is now seamless. The group features and moderation tools are exactly what we needed.",
      rating: 5,
      results: "10K+ community members",
      color: "from-pink-500 to-red-600",
      accent: "pink",
    },
    {
      name: "David Kim",
      role: "Developer",
      company: "EduTech Pro",
      image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200",
      content:
        "The API integration was smooth and the real-time features work flawlessly. Perfect for our educational platform.",
      rating: 5,
      results: "99.9% uptime achieved",
      color: "from-orange-500 to-yellow-600",
      accent: "orange",
    },
  ];

  const values = [
    { icon: Award, title: "Excellence", desc: "Premium chat experience", color: "text-yellow-600" },
    { icon: Heart, title: "Connection", desc: "Bringing people together", color: "text-red-600" },
    { icon: Lightbulb, title: "Innovation", desc: "Next-gen messaging tech", color: "text-blue-600" },
    { icon: Target, title: "Privacy", desc: "Your data stays secure", color: "text-green-600" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const navigate = useNavigate();

  const getAccentColors = (accent: string) => {
    const colors = {
      blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
      pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
      orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    };
    return colors[accent as keyof typeof colors] || colors.blue;
  };

  return (
    <section className="relative overflow-hidden bg-white py-24">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="bg-mint-200/20 absolute right-20 top-20 h-64 w-64 rounded-full blur-3xl"
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
          className="bg-mint-300/15 absolute bottom-20 left-20 h-80 w-80 rounded-full blur-3xl"
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
            Loved by{" "}
            <span className="from-mint-500 to-mint-600 bg-gradient-to-r bg-clip-text text-transparent">Real Users</span>
          </h2>
          <p className="font-inter text-midnight-600 mx-auto max-w-3xl text-xl">
            Don't just take our word for it. See how our chat platform has transformed communication for teams and
            communities worldwide.
          </p>
        </motion.div>

        {/* Balanced Testimonials Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Large Featured Testimonial - Spans 2 columns */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotateY: 2 }}
            className="from-mint-50 to-mint-100 border-mint-200/50 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 lg:col-span-2"
          >
            {/* Decorative elements */}
            <motion.div
              className="bg-mint-200/30 absolute right-0 top-0 h-32 w-32 rounded-full blur-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10">
              <div className="mb-6 flex items-center">
                <Quote className="text-mint-600 mr-3 h-8 w-8" />
                <div className="flex">
                  {[...Array(testimonials[0].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                  ))}
                </div>
              </div>

              <blockquote className="font-inter text-midnight-800 mb-8 text-xl leading-relaxed">
                "{testimonials[0].content}"
              </blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonials[0].image}
                    alt={testimonials[0].name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-urbanist text-midnight-900 text-lg font-semibold">{testimonials[0].name}</h4>
                    <p className="font-inter text-midnight-600">
                      {testimonials[0].role}, {testimonials[0].company}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="bg-mint-200/50 text-mint-700 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium">
                    🚀 {testimonials[0].results}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotateY: 1 }}
            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-500 hover:shadow-xl"
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center">
                <img
                  src={testimonials[1].image}
                  alt={testimonials[1].name}
                  className="mr-3 h-12 w-12 rounded-full object-cover"
                />
                <div className="flex">
                  {[...Array(testimonials[1].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>
              </div>

              <blockquote className="font-inter text-midnight-700 mb-4 leading-relaxed">
                "{testimonials[1].content}"
              </blockquote>

              <div className="mb-3">
                <h4 className="font-urbanist text-midnight-900 font-semibold">{testimonials[1].name}</h4>
                <p className="font-inter text-midnight-600 text-sm">
                  {testimonials[1].role}, {testimonials[1].company}
                </p>
              </div>

              <div
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getAccentColors(testimonials[1].accent).bg} ${getAccentColors(testimonials[1].accent).text} ${getAccentColors(testimonials[1].accent).border} border`}
              >
                {testimonials[1].results}
              </div>
            </div>
          </motion.div>

          {/* Another Testimonial Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotateY: 1 }}
            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-500 hover:shadow-xl"
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center">
                <img
                  src={testimonials[2].image}
                  alt={testimonials[2].name}
                  className="mr-3 h-12 w-12 rounded-full object-cover"
                />
                <div className="flex">
                  {[...Array(testimonials[2].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>
              </div>

              <blockquote className="font-inter text-midnight-700 mb-4 leading-relaxed">
                "{testimonials[2].content}"
              </blockquote>

              <div className="mb-3">
                <h4 className="font-urbanist text-midnight-900 font-semibold">{testimonials[2].name}</h4>
                <p className="font-inter text-midnight-600 text-sm">
                  {testimonials[2].role}, {testimonials[2].company}
                </p>
              </div>

              <div
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getAccentColors(testimonials[2].accent).bg} ${getAccentColors(testimonials[2].accent).text} ${getAccentColors(testimonials[2].accent).border} border`}
              >
                {testimonials[2].results}
              </div>
            </div>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <div className="mb-4">
              <div className="from-mint-500 to-mint-600 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-urbanist text-midnight-900 mb-2 text-xl font-bold">Trusted Partner</h4>
              <p className="font-inter text-midnight-600 text-sm">
                Join 500K+ users who trust our platform for their daily communication
              </p>
            </div>
          </motion.div>

          {/* Values Grid - Spans full width */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:col-span-3"
          >
            <motion.div
              className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-gray-200/30 blur-2xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10">
              <div className="mb-8 text-center">
                <h3 className="font-urbanist text-midnight-900 mb-3 text-2xl font-bold">Our Core Values</h3>
                <p className="font-inter text-midnight-600">The principles that drive everything we do</p>
              </div>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {values.map((value, index) => {
                  const ValueIcon = value.icon;
                  return (
                    <motion.div
                      key={value.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="rounded-2xl border border-white/40 bg-white/60 p-6 text-center backdrop-blur-sm transition-all duration-200 hover:bg-white/80"
                    >
                      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} className="mb-4">
                        <ValueIcon className={`h-8 w-8 ${value.color} mx-auto`} />
                      </motion.div>
                      <h4 className="font-urbanist text-midnight-900 mb-2 font-semibold">{value.title}</h4>
                      <p className="font-inter text-midnight-600 text-sm">{value.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="from-mint-50 to-mint-100 relative overflow-hidden rounded-3xl bg-gradient-to-r p-12">
            <motion.div
              className="bg-mint-200/30 absolute right-0 top-0 h-40 w-40 rounded-full blur-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10">
              <h3 className="font-urbanist text-midnight-900 mb-4 text-3xl font-bold">
                Ready to Join the Conversation?
              </h3>
              <p className="font-inter text-midnight-600 mx-auto mb-8 max-w-2xl text-lg">
                Join these satisfied users and experience the future of communication today.
              </p>
              <motion.button
                onClick={() => navigate(NAVIGATION_ROUTES.LOGIN)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-mint-500 hover:bg-mint-600 font-inter rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                Start Chatting Today
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
