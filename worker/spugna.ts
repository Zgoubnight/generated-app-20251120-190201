// This file contains the core logic for the "La Roue SPUGNA" application.
// It includes the constraint satisfaction algorithm for generating the optimal gift draw.
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
const GIFTS_PER_GIVER = 4;
const CHILDREN_PER_GIVER = 1;
// Helper function to shuffle an array
const shuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
// The main algorithm to generate the optimal draw
export const generateOptimalDraw = (): Record<string, string[]> | null => {
  const givers = MEMBERS.filter(m => m.role === 'Giver/Recipient');
  const children = MEMBERS.filter(m => m.role === 'Child/Recipient');
  const adults = givers;
  const MAX_ATTEMPTS = 5000; // Failsafe to prevent infinite loops
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const assignments: Record<string, string[]> = {};
    const recipientCounts: Record<string, number> = {};
    MEMBERS.forEach(m => { recipientCounts[m.name] = 0; });
    let success = true;
    // Create a pool of children to be assigned
    let childPool = Array.from({ length: GIFTS_PER_GIVER }, () => children.map(c => c.id)).flat();
    childPool = shuffle(childPool);
    // First, assign one child to each giver
    const giversShuffledForChildren = shuffle([...givers]);
    for (const giver of giversShuffledForChildren) {
      const potentialChildren = shuffle([...children]);
      let childAssigned = false;
      for (const child of potentialChildren) {
        // Rule: Cannot give to own child
        if (giver.children?.includes(child.id)) continue;
        // Rule: Child must be available in the pool
        const childIndexInPool = childPool.indexOf(child.id);
        if (childIndexInPool !== -1) {
          assignments[giver.id] = [child.name];
          recipientCounts[child.name]++;
          childPool.splice(childIndexInPool, 1); // Remove from pool
          childAssigned = true;
          break;
        }
      }
      if (!childAssigned) {
        success = false;
        break;
      }
    }
    if (!success) continue; // Retry if child assignment fails
    // Second, assign remaining adults
    for (const giver of givers) {
      const potentialAdults = shuffle([...adults]);
      for (const adult of potentialAdults) {
        if (assignments[giver.id].length >= GIFTS_PER_GIVER) break;
        // Rule: Cannot give to self
        if (giver.id === adult.id) continue;
        // Rule: Cannot give to partner
        if (giver.partner === adult.id) continue;
        // Rule: Recipient not already assigned to this giver
        if (assignments[giver.id].includes(adult.name)) continue;
        assignments[giver.id].push(adult.name);
        recipientCounts[adult.name]++;
      }
      // Check if we managed to assign enough people
      if (assignments[giver.id].length < GIFTS_PER_GIVER) {
        success = false;
        break;
      }
    }
    if (success) {
      // We found a valid solution.
      // A more complex implementation would calculate variance and try multiple
      // valid solutions to find the "best" one. For this scope, the first valid one is sufficient.
      return assignments;
    }
  }
  console.error("Failed to generate an optimal draw after MAX_ATTEMPTS.");
  return null; // Failed to find a solution
};