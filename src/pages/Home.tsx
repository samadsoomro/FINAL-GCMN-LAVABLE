import React from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/layout/Hero';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import biekLogo from '@/assets/images/affiliations/biek-logo.png';
import seccapLogo from '@/assets/images/affiliations/seccap-logo.png';
import dgcsLogo from '@/assets/images/affiliations/dgcs-logo.png';

const Home: React.FC = () => {
  const stats = [
    {
      icon: <BookOpen size={40} />,
      number: '5000+',
      label: 'Books Available',
      color: 'text-pakistan-green',
    },
    {
      icon: <Users size={40} />,
      number: '1000+',
      label: 'Active Students',
      color: 'text-pakistan-green-light',
    },
    {
      icon: <Award size={40} />,
      number: '500+',
      label: 'Study Materials',
      color: 'text-accent',
    },
    {
      icon: <TrendingUp size={40} />,
      number: '95%',
      label: 'Satisfaction Rate',
      color: 'text-pakistan-emerald',
    },
  ];

  const features = [
    {
      title: 'Easy Book Borrowing',
      description: 'Browse our extensive collection and borrow books with just a few clicks. Track your borrowings and due dates easily.',
      emoji: '📚',
    },
    {
      title: 'Digital Study Materials',
      description: 'Access course notes, syllabus, and study guides organized by subjects and semesters.',
      emoji: '📖',
    },
    {
      title: 'Rare Books Archive',
      description: 'Explore our digital archive of rare and historical books with secure viewing technology.',
      emoji: '🏛️',
    },
    {
      title: 'Admin Dashboard',
      description: 'Efficient management system for librarians to handle requests, inventory, and user accounts.',
      emoji: '⚙️',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center p-6 lg:p-8 bg-secondary rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`mb-4 ${stat.color}`}>{stat.icon}</div>
                <span className="text-3xl lg:text-4xl font-bold text-primary mb-1">
                  {stat.number}
                </span>
                <span className="text-sm lg:text-base text-muted-foreground">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Why Choose GCFM?
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Discover the features that make our library the perfect learning companion
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-card p-6 lg:p-8 rounded-2xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* College Affiliations Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              College Affiliations & Authorities
            </motion.h2>
          </div>

          <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            {/* Row 1: BIEK & SECCAP */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24">
              {/* BIEK */}
              <motion.a
                href="https://biek.edu.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group hover:opacity-90 transition-opacity"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <img src={biekLogo} alt="BIEK Logo" className="w-24 h-24 lg:w-28 lg:h-28 object-contain" />
                <span className="text-2xl lg:text-3xl font-bold text-neutral-800 tracking-tight">BIEK</span>
              </motion.a>

              {/* SECCAP */}
              <motion.a
                href="https://seccap.dgcs.gos.pk/?fbclid=IwY2xjawPV3S9leHRuA2FlbQIxMABicmlkETFHWmpIVFdSUWV1M2VVazJxc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHv0bwUTzk8V0XckBH0ATIYLf-grT6jLOr61zQK5R82p8EkQ6u7GjgT_Cg05x_aem_OnkzP8dOiNzzGxVl70F-jQ#/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group hover:opacity-90 transition-opacity"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <img src={seccapLogo} alt="SECCAP Logo" className="w-24 h-24 lg:w-28 lg:h-28 object-contain" />
                <span className="text-2xl lg:text-3xl font-bold text-neutral-800 tracking-tight">SECCAP</span>
              </motion.a>
            </div>

            {/* Row 2: DGCS */}
            <div className="flex justify-center w-full mt-8 md:mt-4">
              <motion.a
                href="https://www.dgcs.gos.pk/index.php?#top"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full max-w-3xl px-4 group hover:opacity-90 transition-opacity"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <img src={dgcsLogo} alt="Directorate General Colleges Sindh" className="w-full h-auto object-contain mx-auto" />
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 gradient-primary text-white">
        <div className="container">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of students who are already using GCFM for their academic success.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/register"
                className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Create Free Account
              </a>
              <a
                href="/books"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Browse Library
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
