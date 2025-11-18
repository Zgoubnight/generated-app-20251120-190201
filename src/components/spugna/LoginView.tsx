import { motion } from 'framer-motion';
import { Gift, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MEMBERS } from './constants';
import { useSpugnaStore } from '@/hooks/useSpugnaStore';
import { useState } from 'react';
export function LoginView() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const login = useSpugnaStore(s => s.login);
  const playersWhoPlayed = useSpugnaStore(s => s.playersWhoPlayed);
  const handleLogin = () => {
    if (selectedUser) {
      login(selectedUser);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="w-full max-w-md"
    >
      <Card className="overflow-hidden shadow-2xl bg-card/80 backdrop-blur-sm border-spugna-gold/20">
        <CardHeader className="text-center bg-spugna-dark-blue text-spugna-off-white p-8">
          <motion.div
            animate={{ y: [-2, 2, -2], rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mb-4"
          >
            <Gift className="w-16 h-16 text-spugna-gold" />
          </motion.div>
          <CardTitle className="font-display text-4xl text-spugna-gold">La Roue SPUGNA</CardTitle>
          <CardDescription className="text-spugna-off-white/80">Mystery Christmas Gift Wheel</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="user-select" className="text-sm font-medium text-muted-foreground">
              Qui est-ce ?
            </label>
            <Select onValueChange={setSelectedUser}>
              <SelectTrigger id="user-select" className="w-full">
                <SelectValue placeholder="Sélectionne ton nom..." />
              </SelectTrigger>
              <SelectContent>
                {MEMBERS.filter(m => m.role === 'Giver/Recipient').map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} {playersWhoPlayed.has(member.id) && '(A JOUÉ)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleLogin}
            disabled={!selectedUser}
            className="w-full bg-spugna-red hover:bg-spugna-red/90 text-white font-bold text-lg py-6 transition-transform duration-200 hover:scale-105 active:scale-100"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Entrer dans le Mystère
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}