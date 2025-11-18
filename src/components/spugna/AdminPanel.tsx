import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Play, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSpugnaStore } from '@/hooks/useSpugnaStore';
import { toast } from 'sonner';
export function AdminPanel() {
  const performInitialDraw = useSpugnaStore(s => s.performInitialDraw);
  const resetGlobalDraw = useSpugnaStore(s => s.resetGlobalDraw);
  const isInitialDrawDone = useSpugnaStore(s => s.isInitialDrawDone);
  const handleInitialDraw = () => {
    performInitialDraw();
    toast.success("Tirage Global Effectué!", {
      description: "Les joueurs peuvent maintenant découvrir leurs résultats.",
    });
  };
  const handleReset = () => {
    resetGlobalDraw();
    toast.warning("Réinitialisation Globale!", {
      description: "Tous les tirages ont été annulés. Le jeu est réinitialisé.",
    });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 right-4 z-20"
    >
      <Card className="w-full max-w-sm shadow-lg border-spugna-red">
        <CardHeader className="flex flex-row items-center gap-3">
          <Shield className="w-6 h-6 text-spugna-red" />
          <div>
            <CardTitle>Panneau Admin</CardTitle>
            <CardDescription>Actions critiques</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full bg-spugna-dark-blue hover:bg-spugna-dark-blue/90" disabled={isInitialDrawDone}>
                <Play className="mr-2 h-4 w-4" />
                Effectuer le Tirage Initial
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer le tirage global ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irr��versible et lancera le tirage pour tous les participants.
                  Êtes-vous sûr de vouloir continuer ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleInitialDraw}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={!isInitialDrawDone}>
                <Trash2 className="mr-2 h-4 w-4" />
                Réinitialiser le Tirage
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réinitialiser TOUT le jeu ?</AlertDialogTitle>
                <AlertDialogDescription>
                  ATTENTION: Cette action effacera le tirage actuel pour TOUS les joueurs.
                  Le jeu reviendra à son état initial.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Oui, tout réinitialiser
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </motion.div>
  );
}