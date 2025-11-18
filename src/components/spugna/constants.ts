export type Member = {
  id: string;
  name: string;
  role: 'Giver/Recipient' | 'Child/Recipient';
  isAdmin?: boolean;
  partner?: string;
  children?: string[];
};
export const MEMBERS: Member[] = [
  { id: 'julian', name: 'Julian', role: 'Giver/Recipient', partner: 'marion', children: ['milan', 'deva'] },
  { id: 'marion', name: 'Marion', role: 'Giver/Recipient', partner: 'julian', children: ['milan', 'deva'] },
  { id: 'franck', name: 'Franck', role: 'Giver/Recipient', partner: 'pascale' },
  { id: 'pascale', name: 'Pascale', role: 'Giver/Recipient', partner: 'franck' },
  { id: 'lorris', name: 'Lorris', role: 'Giver/Recipient', partner: 'renata', children: ['marie-louise'] },
  { id: 'renata', name: 'Renata', role: 'Giver/Recipient', partner: 'lorris', children: ['marie-louise'] },
  { id: 'dorian', name: 'Dorian', role: 'Giver/Recipient', isAdmin: true, partner: 'alexia' },
  { id: 'alexia', name: 'Alexia', role: 'Giver/Recipient', isAdmin: true, partner: 'dorian' },
  { id: 'milan', name: 'Milan', role: 'Child/Recipient' },
  { id: 'deva', name: 'Deva', role: 'Child/Recipient' },
  { id: 'marie-louise', name: 'Marie-Louise', role: 'Child/Recipient' },
];
export const MOCK_RESULTS: Record<string, string[]> = {
  julian: ['Franck', 'Pascale', 'Dorian', 'Marie-Louise'],
  marion: ['Lorris', 'Renata', 'Alexia', 'Milan'],
  franck: ['Julian', 'Marion', 'Lorris', 'Deva'],
  pascale: ['Renata', 'Dorian', 'Alexia', 'Marie-Louise'],
  lorris: ['Julian', 'Marion', 'Franck', 'Milan'],
  renata: ['Pascale', 'Dorian', 'Alexia', 'Deva'],
  dorian: ['Julian', 'Franck', 'Lorris', 'Marie-Louise'],
  alexia: ['Marion', 'Pascale', 'Renata', 'Milan'],
};
export const MOCK_EQUITY_DATA = {
  labels: MEMBERS.map(m => m.name),
  datasets: [
    {
      label: '# of Gifts Received',
      data: [3, 3, 3, 3, 3, 3, 2, 2, 4, 3, 3], // Example distribution
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