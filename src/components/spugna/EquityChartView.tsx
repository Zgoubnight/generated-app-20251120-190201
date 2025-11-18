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
import { MOCK_EQUITY_DATA } from './constants';
import { BarChart } from 'lucide-react';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export function EquityChartView() {
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
            <Bar options={options} data={MOCK_EQUITY_DATA} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}