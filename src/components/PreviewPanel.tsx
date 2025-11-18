import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, Copy, Check, AlertTriangle } from 'lucide-react';
export function PreviewPanel() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    // Simulate fetching the deployment URL. In a real app, this might be an API call.
    // For this context, we use the current window location.
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          setPreviewUrl(window.location.href);
        } else {
          throw new Error("Cannot access window object.");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to get preview URL:", err);
        setError("Could not load preview URL.");
        setIsLoading(false);
      }
    }, 1500); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);
  const handleCopy = async () => {
    if (!previewUrl) return;
    try {
      await navigator.clipboard.writeText(previewUrl);
      setIsCopied(true);
      toast.success("URL copiée dans le presse-papiers!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Impossible de copier l'URL.");
      console.error('Failed to copy text: ', err);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}
      className="fixed bottom-4 left-4 z-50 w-full max-w-sm"
    >
      <Card className="shadow-2xl bg-spugna-dark-blue/90 backdrop-blur-lg border-spugna-gold/30 text-spugna-off-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-spugna-gold font-display">
            <Link className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription className="text-spugna-off-white/70">
            This is the live deployed version of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-spugna-gold/20" />
              <Skeleton className="h-10 w-full bg-spugna-gold/20" />
            </div>
          )}
          {error && !isLoading && (
            <div className="flex items-center gap-2 text-spugna-red">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          {previewUrl && !isLoading && (
            <div className="flex flex-col gap-3">
              <p className="truncate text-sm p-2 rounded-md bg-black/30 border border-spugna-gold/20 font-mono">
                {previewUrl}
              </p>
              <div className="flex gap-2">
                <Button
                  asChild
                  className="flex-1 bg-spugna-gold hover:bg-spugna-gold/90 text-spugna-dark-blue font-bold"
                >
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    <Link className="mr-2 h-4 w-4" />
                    Open
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="border-spugna-gold/50 hover:bg-spugna-gold/10 text-spugna-gold"
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}