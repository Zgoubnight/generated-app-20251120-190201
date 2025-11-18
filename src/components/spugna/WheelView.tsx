import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSpugnaStore } from '@/hooks/useSpugnaStore';
import { Gift, RotateCw } from 'lucide-react';
export function WheelView() {
  const spinWheel = useSpugnaStore(s => s.spinWheel);
  const isInitialDrawDone = useSpugnaStore(s => s.isInitialDrawDone);
  const currentUser = useSpugnaStore(s => s.currentUser);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-center"
    >
      <h1 className="font-display text-5xl md:text-6xl font-bold text-spugna-dark-blue mb-4">
        Bonjour, {currentUser?.name}!
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Prêt(e) à d��couvrir tes missions cadeaux ?
      </p>
      <Card className="relative w-80 h-80 md:w-96 md:h-96 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-spugna-gold to-spugna-orange shadow-2xl border-8 border-spugna-dark-blue overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-1 h-full bg-spugna-dark-blue/20"
              style={{ transform: `translateX(-50%) rotate(${i * 45}deg)` }}
            />
          ))}
        </motion.div>
        <div className="absolute w-24 h-24 rounded-full bg-spugna-dark-blue flex items-center justify-center shadow-inner">
          <Gift className="w-12 h-12 text-spugna-gold" />
        </div>
      </Card>
      <div className="mt-10">
        {isInitialDrawDone ? (
          <Button
            onClick={spinWheel}
            className="bg-spugna-red hover:bg-spugna-red/90 text-white font-bold text-2xl px-12 py-8 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            <RotateCw className="mr-3 h-8 w-8 animate-spin" style={{ animationDuration: '3s' }} />
            Révéler mon Destin
          </Button>
        ) : (
          <Card className="max-w-md mx-auto p-6 bg-spugna-off-white border-spugna-orange">
            <p className="text-lg font-semibold text-spugna-dark-blue">
              Le tirage au sort global n'a pas encore été effectué.
            </p>
            <p className="text-muted-foreground mt-2">
              Veuillez patienter qu'un administrateur (Dorian ou Alexia) lance le tirage.
            </p>
          </Card>
        )}
      </div>
    </motion.div>
  );
}