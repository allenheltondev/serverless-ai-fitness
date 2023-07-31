const workoutTypes = [
  {
    name: 'Circuit',
    value: 'circuit',
    description: 'Move from one exercise to another with little to no rest in between'
  },
  { name: 'Supersets', value: 'superset', description: 'Multiple sets of two exercises are performed back-to-back without any rest' },
  { name: 'Standard', value: 'standatd', description: 'Typical set and rep structure. Complete an exercise completely before moving to the next' },
  { name: 'HIIT', value: 'hiit', description: 'High Intensity Interval Training. Short bursts of high-intensity exercises followed by a short rest period' },
  { name: 'EMOM', value: 'emom', description: 'Every Minute On the Minute.  At the start of each minute, perform a specific number of reps and rest for the remainder of the minute' },
  { name: 'AMRAP', value: 'amrap', description: 'As Many Rounds As Possible. Complete as many rounds of a circuit as possible within a specific time frame' }
]
export default workoutTypes;