import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MEMBERS } from './constants';
import { BarChart } from 'lucide-react';
import { useSpugnaStore } from '@/hooks/useSpugnaStore';
import { useMemo } from 'react';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export function EquityChartView() {
  const optimalDraw = useSpugnaStore(s => s.gameState?.optimalDraw);
  const chartData = useMemo(() => {
    const recipientCounts: Record<string, number> = {};
    MEMBERS.forEach(m => { recipientCounts[m.name] = 0; });
    if (optimalDraw) {
      Object.values(optimalDraw).flat().forEach(recipientName => {
        if (recipientCounts[recipientName] !== undefined) {
          recipientCounts[recipientName]++;
        }
      });
    }
    return {
      labels: MEMBERS.map(m => m.name),
      datasets: [
        {
          label: '# of Gifts Received',
          data: MEMBERS.map(m => recipientCounts[m.name]),
          backgroundColor: [
            '#D62828', '#F77F00', '#FCBF49', '#003049',
            '#D62828', '#F77F00', '#FCBF49', '#003049',
            '#D62828', '#F77F00', '#FCBF49'
          ],
          borderColor: MEMBERS.map(() => '#EAE2B7'),
          borderWidth: 1,
        },
      ],
    };
  }, [optimalDraw]);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Répartition Équitable des Cadeaux',
        font: {
          size: 18,
          family: "'Cal Sans', sans-serif",
        },
        color: '#003049',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#003049',
        },
        grid: {
          color: 'rgba(0, 48, 73, 0.1)',
        }
      },
      x: {
        ticks: {
          color: '#003049',
        }
      }
    },
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-xl bg-spugna-off-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <BarChart className="w-12 h-12 mx-auto text-spugna-dark-blue" />
          <CardTitle className="font-display text-4xl text-spugna-dark-blue">Graphique d'Équité</CardTitle>
          <CardDescription>Nombre total de cadeaux reçus par chaque personne.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 md:h-[500px] p-4">
            {optimalDraw ? (
              <Bar options={options} data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Le tirage n'a pas encore été effectué.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}