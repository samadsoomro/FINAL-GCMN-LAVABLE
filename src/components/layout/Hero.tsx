import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Archive, ArrowRight } from 'lucide-react';
import PakistanMap from '@/components/icons/PakistanMap';
import { Button } from '@/components/ui/button';

const Hero: React.FC = () => {
  const features = [
    {
      icon: <BookOpen size={32} />,
      title: 'Book Borrowing',
      description: 'Access thousands of books with easy borrowing system',
      link: '/books',
    },
    {
      icon: <FileText size={32} />,
      title: 'Notes & Syllabus',
      description: 'Download study materials and course notes',
      link: '/notes',
    },
    {
      icon: <Archive size={32} />,
      title: 'Rare Books',
      description: 'Explore our digital archive of rare collections',
      link: '/rare-books',
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center py-24 lg:py-32 overflow-hidden pakistan-bg">
      {/* Watermark Logo Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/college-logo.png"
          alt=""
          className="w-[60%] max-w-3xl opacity-[0.02]"
        />
      </div>

      {/* Pakistan Map Background */}
      <div className="absolute top-[10%] right-[-10%] w-1/2 max-w-xl pointer-events-none text-primary">
        <PakistanMap opacity={0.03} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Main Content */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center w-fit px-4 py-2 rounded-full border-2 border-primary bg-primary/5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Welcome to Digital Learning
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-gradient">GCFM</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Your gateway to knowledge and academic excellence. Access thousands of books,
              study materials, and rare collections at Gov. College For Men Nazimabad.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/books">
                <Button size="lg" className="gap-2">
                  Explore Books
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="secondary" className="gap-2">
                  Events
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="gap-2">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Link to={feature.link}>
                  <div className="group flex items-center gap-4 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
