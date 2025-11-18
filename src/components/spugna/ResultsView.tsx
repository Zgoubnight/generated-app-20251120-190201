import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpugnaStore } from '@/hooks/useSpugnaStore';
import { Sparkles, User, Loader, Bot } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
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
      type: 'spring' as const,
      stiffness: 100,
    },
  },
};
export function ResultsView() {
  const currentUser = useSpugnaStore(s => s.currentUser);
  const optimalDraw = useSpugnaStore(s => s.gameState?.optimalDraw);
  const generateGiftIdeas = useSpugnaStore(s => s.generateGiftIdeas);
  const isGeneratingIdeas = useSpugnaStore(s => s.isGeneratingIdeas);
  const aiGiftIdeas = useSpugnaStore(s => s.aiGiftIdeas);
  const clearGiftIdeas = useSpugnaStore(s => s.clearGiftIdeas);
  const userResults = currentUser && optimalDraw ? optimalDraw[currentUser.id] || [] : [];
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);
  const handleGenerateClick = () => {
    if (userResults.length > 0) {
      generateGiftIdeas(userResults);
    }
  };
  // Reset AI ideas when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      clearGiftIdeas();
    }
  }, [isDialogOpen, clearGiftIdeas]);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-spugna-dark-blue hover:bg-spugna-dark-blue/90 text-white font-bold text-xl px-8 py-6"
              onClick={handleGenerateClick}
            >
              <Sparkles className="mr-3 h-6 w-6 text-spugna-gold" />
              ✨ Générer des Idées Cadeaux IA
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] bg-spugna-off-white">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl text-spugna-dark-blue flex items-center gap-2">
                <Bot className="w-8 h-8 text-spugna-red" />
                Assistant Cadeaux IA
              </DialogTitle>
              <DialogDescription>
                Voici quelques idées générées par l'IA pour vous inspirer.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isGeneratingIdeas && (
                <div className="flex flex-col items-center justify-center h-48 gap-4 text-spugna-dark-blue">
                  <Loader className="w-12 h-12 animate-spin" />
                  <p className="font-semibold">L'IA réfléchit à des cadeaux parfaits...</p>
                </div>
              )}
              {aiGiftIdeas && !isGeneratingIdeas && (
                <ScrollArea className="h-72 w-full rounded-md border border-spugna-gold/50 p-4 bg-white/50">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: aiGiftIdeas
                        .replace(/## (.*)/g, '<h2 class="text-spugna-dark-blue font-display text-xl">$1</h2>')
                        .replace(/\* (.*)/g, '<li class="text-spugna-dark-blue/90">$1</li>')
                    }}
                  />
                </ScrollArea>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <p className="text-sm text-muted-foreground mt-3">
          Note: L'IA a une limite d'utilisation. Utilisez-la à bon escient !
        </p>
      </motion.div>
    </div>
  );
}