import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpugnaStore } from '@/hooks/useSpugnaStore';
import { Gift, Sparkles, User } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useState, useEffect } from 'react';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};
export function ResultsView() {
  const currentUser = useSpugnaStore(s => s.currentUser);
  const userResults = useSpugnaStore(s => s.userResults);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="text-center">
      <AnimatePresence>
        {showConfetti && <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={400} />}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-5xl md:text-6xl font-bold text-spugna-dark-blue mb-2">
          Voici tes missions, {currentUser?.name}!
        </h1>
        <p className="text-xl text-muted-foreground mb-10">
          Tu offres un cadeau à...
        </p>
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {userResults.map((name, index) => (
          <motion.div variants={itemVariants} key={index}>
            <Card className="h-full text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-spugna-off-white border-spugna-gold">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-spugna-red to-spugna-orange flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-spugna-dark-blue">{name}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-12"
      >
        <Button size="lg" className="bg-spugna-dark-blue hover:bg-spugna-dark-blue/90 text-white font-bold text-xl px-8 py-6">
          <Sparkles className="mr-3 h-6 w-6 text-spugna-gold" />
          ✨ Générer des Idées Cadeaux IA
        </Button>
        <p className="text-sm text-muted-foreground mt-3">(Fonctionnalité à venir dans la Phase 3)</p>
      </motion.div>
    </div>
  );
}