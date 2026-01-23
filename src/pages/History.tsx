import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import historyImage from '@/assets/images/history-college.jpg';

const History: React.FC = () => {
    return (
        <motion.div
            className="min-h-screen pt-24 pb-12 pakistan-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="container px-4 md:px-6">
                <motion.div
                    className="max-w-4xl mx-auto space-y-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            History of GCFM
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            A legacy of academic excellence spanning over seven decades.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                            <CardContent className="p-6 space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Calendar size={24} />
                                </div>
                                <h3 className="text-xl font-semibold">Establishment</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Government College For Men Nazimabad was established in 1953. It has the distinction of being one of the oldest and most prestigious educational institutions in Karachi, playing a pivotal role in shaping the academic landscape of the city.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                            <CardContent className="p-6 space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Award size={24} />
                                </div>
                                <h3 className="text-xl font-semibold">Academic Excellence</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Over the years, GCFM has produced countless leaders, scholars, and professionals who have made significant contributions to Pakistan and the world. The college is renowned for its strong emphasis on both academic rigor and character building.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 space-y-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <BookOpen size={24} />
                                    </div>
                                    <h3 className="text-2xl font-semibold">Our Library</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        The college library, now modernized as GCFM Library, has been a cornerstone of knowledge since the beginning. It houses a vast collection of books, including rare manuscripts and academic resources, serving generations of students in their pursuit of learning.
                                    </p>
                                </div>
                                <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden border-2 border-primary/10 shadow-lg">
                                    <img
                                        src={historyImage}
                                        alt="Historic GCFM Campus"
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default History;
