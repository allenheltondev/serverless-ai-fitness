import React, { useState, useEffect, ChangeEvent } from 'react';
import { API } from 'aws-amplify';
import { Text, TextField, Button, CheckboxField, View, Flex, Heading, Image, Divider, SelectField, SliderField, SwitchField } from '@aws-amplify/ui-react';
import { getWorkoutSettings } from '@/graphql/queries';

interface Settings {
  targetTime: number,
  frequency: string[],
  muscleGroups: string[],
  equipment: Equipment[],
  workoutTypes: WorkoutType[],
  specialWorkouts: SpecialWorkouts
};

interface Equipment {
  type: string,
  threshold: number
}

interface WorkoutType {
  type: string,
  modifier: string
}

interface SpecialWorkouts {
  days: string[],
  percentChance: number,
  equipment: string[],
  objective: string
}

interface GetWorkoutSettingsResponse {
  data: {
    getWorkoutSettings: Settings
  }
}

interface Tracker {
  label: string,
  value: string,
  isEnabled: boolean,
  count: number | undefined
};

interface EquipmentTracker {
  barbells: Tracker,
  dumbbells: Tracker,
  kettlebells: Tracker,
  battleRopes: Tracker,
  bodyweight: Tracker,
  medicineBalls: Tracker
}

interface MuscleGroupTracker {
  arms: Tracker,
  chest: Tracker,
  shoulders: Tracker,
  fullBody: Tracker,
  back: Tracker,
  legs: Tracker,
  cardio: Tracker
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    targetTime: 45,
    frequency: [],
    muscleGroups: [],
    equipment: [
      {
        type: 'bodyweight exercises',
        threshold: 1
      }
    ],
    workoutTypes: [{ type: 'circuit', modifier: '' }],
    specialWorkouts: {
      days: [],
      percentChance: 0,
      equipment: [],
      objective: ''
    }
  });

  const [equipmentTracker, setEquipmentTracker] = useState<EquipmentTracker>(
    {
      barbells: { isEnabled: false, count: .50, label: "Barbells", value: "barbells" },
      dumbbells: { isEnabled: false, count: .50, label: "Dumbbells", value: "dumbbells" },
      kettlebells: { isEnabled: false, count: .50, label: "Kettlebells", value: "kettlebells" },
      battleRopes: { isEnabled: false, count: .50, label: "Battle Ropes", value: "battle ropes" },
      bodyweight: { isEnabled: false, count: .50, label: "Bodyweight", value: "bodyweight exercises" },
      medicineBalls: { isEnabled: false, count: .50, label: "Medicine Balls", value: "medicine balls" }
    });

  const [muscleGroupTracker, setMuscleGroupTracker] = useState<MuscleGroupTracker>({
    arms: { isEnabled: false, count: 0, label: "Arms", value: "arm" },
    chest: { isEnabled: false, count: 0, label: "Chest", value: "chest" },
    shoulders: { isEnabled: false, count: 0, label: "Shoulders", value: "shoulder" },
    fullBody: { isEnabled: false, count: 0, label: "Full Body", value: "total body" },
    back: { isEnabled: false, count: 0, label: "Back", value: "back" },
    legs: { isEnabled: false, count: 0, label: "Legs", value: "leg" },
    cardio: { isEnabled: false, count: 0, label: "Cardio", value: "cardio" }
  });

  const [isSundayChecked, setIsSundayChecked] = useState(false);
  const [isMondayChecked, setIsMondayChecked] = useState(false);
  const [isTuesdayChecked, setIsTuesdayChecked] = useState(false);
  const [isWednesdayChecked, setIsWednesdayChecked] = useState(false);
  const [isThursdayChecked, setIsThursdayChecked] = useState(false);
  const [isFridayChecked, setIsFridayChecked] = useState(false);
  const [isSatdayChecked, setIsSaturdayChecked] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const workoutSettings = await API.graphql({ query: getWorkoutSettings });
      initializeSettings(workoutSettings.data.getMySettings);
    };

    fetchUserData();
  }, []);

  const initializeSettings = (settings: Settings) => {
    toggleFrequencyCheckboxes(settings.frequency);
    toggleTrackers(settings.muscleGroups);

    setSettings(settings);
  };

  const toggleTrackers = (muscleGroups: string[]) => {
    const mgTracker: MuscleGroupTracker = {
      arms: initializeTracker(muscleGroups, muscleGroupTracker.arms),
      back: initializeTracker(muscleGroups, muscleGroupTracker.back),
      cardio: initializeTracker(muscleGroups, muscleGroupTracker.cardio),
      chest: initializeTracker(muscleGroups, muscleGroupTracker.chest),
      fullBody: initializeTracker(muscleGroups, muscleGroupTracker.fullBody),
      legs: initializeTracker(muscleGroups, muscleGroupTracker.legs),
      shoulders: initializeTracker(muscleGroups, muscleGroupTracker.shoulders),
    }
    
    setMuscleGroupTracker(mgTracker);
  };

  const initializeTracker = (muscleGroups: string[], tracker: Tracker) => {
    const count = muscleGroups.reduce((c, mg) => {
      return c + (mg === tracker.value ? 1 : 0);
    }, 0);

    tracker.count = count;
    tracker.isEnabled = count > 0;
    return tracker;
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEquipmentTracker(prev => ({ ...prev, [name]: { ...prev[name as keyof EquipmentTracker], isEnabled: value } }))
  };

  const handleWorkoutDayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let newFrequency = [...settings.frequency];
    const index = newFrequency.indexOf(value);
    if (index == -1) {
      newFrequency.push(value);
    } else {
      newFrequency.splice(index, 1);
    }
    setSettings(prev => ({ ...prev, frequency: newFrequency }));
    toggleFrequencyCheckboxes(newFrequency);
  };

  const toggleFrequencyCheckboxes = (frequency: string[]) => {
    if (!frequency) {
      frequency = [];
    }

    setIsSundayChecked(frequency.includes('Su'));
    setIsMondayChecked(frequency.includes('M'));
    setIsTuesdayChecked(frequency.includes('T'));
    setIsWednesdayChecked(frequency.includes('W'));
    setIsThursdayChecked(frequency.includes('Th'));
    setIsFridayChecked(frequency.includes('F'));
    setIsSaturdayChecked(frequency.includes('Sa'));
  };

  const updateProfile = async () => {
    settings.muscleGroups = calculateMuscleGroups();
  }

  const calculateMuscleGroups = () => {
    let muscleGroups: string[] = [];
    muscleGroups = addToArray(muscleGroups, muscleGroupTracker.arms);
    muscleGroups = addToArray(muscleGroups, muscleGroupTracker.back);
    muscleGroups = addToArray(muscleGroups, muscleGroupTracker.cardio);
    muscleGroups = addToArray(muscleGroups, muscleGroupTracker.chest);
    muscleGroups = addToArray(muscleGroups, muscleGroupTracker.fullBody);
    muscleGroups = addToArray(muscleGroups, muscleGroupTracker.legs);
    muscleGroups = addToArray(muscleGroups, muscleGroupTracker.shoulders);

    return muscleGroups;
  };

  const addToArray = (muscleGroups: string[], muscleGroup: Tracker) => {
    let count = muscleGroup.count ?? 0;
    for (let i = 0; i < count; i++) {
      muscleGroups.push(muscleGroup.value);
    }

    return muscleGroups;
  };

  return (
    <Flex direction="column">
      <Flex direction="row" justifyContent="space-between" paddingRight="2em">
        <Flex direction="column" width="70%">
          <Heading level={4}>Workout Settings</Heading>
          <View className="mt-3">
            <Flex direction="column" gap="1em">
              <SliderField
                name="targetTime"
                label="Preferred workout length (mins)"
                value={settings.targetTime}
                min={15}
                max={90}
                width="50%"
                onChange={(e: number) => setSettings(prev => ({ ...prev, targetTime: e }))}
              />
              <Text marginBottom=".3em">Workout Days</Text>
              <Flex direction="row" gap=".7em">
                <CheckboxField label="Sunday" name="su" value="Su" checked={isSundayChecked} onChange={handleWorkoutDayChange} />
                <CheckboxField label="Monday" name="m" value="M" checked={isMondayChecked} onChange={handleWorkoutDayChange} />
                <CheckboxField label="Tuesday" name="t" value="T" checked={isTuesdayChecked} onChange={handleWorkoutDayChange} />
                <CheckboxField label="Wednesday" name="w" value="W" checked={isWednesdayChecked} onChange={handleWorkoutDayChange} />
                <CheckboxField label="Thursday" name="th" value="Th" checked={isThursdayChecked} onChange={handleWorkoutDayChange} />
                <CheckboxField label="Friday" name="f" value="F" checked={isFridayChecked} onChange={handleWorkoutDayChange} />
                <CheckboxField label="Saturday" name="sa" value="Sa" checked={isSatdayChecked} onChange={handleWorkoutDayChange} />
              </Flex>
              <Divider size="large" />
              <Heading level={5}>Workout Builder</Heading>
              <Text fontSize=".9rem"><i>Every week, we will generate a workout for you for every day you have checked above. To help optimize the workouts 
                to best fit your needs, please fill out some additional details below like how many times you'd like to work out certain muscle groups 
                each week and what equipment you have available.</i></Text>
              <Text><b>Muscle Groups</b></Text>
              <Text fontSize=".9rem"><i>Select what you'd like to work out each week. When you enable a muscle group, you can choose up to how many 
                times you'd possibly like to work it out each week. We pick muscle groups at random when building workouts, so there's no guarantee a muscle group
                will be worked out on a given week if you select more groups than workout days.</i></Text>
              <Flex direction="row" justifyContent="space-between" gap=".5em" wrap="wrap">
                {Object.keys(muscleGroupTracker).map(muscleGroup => (
                  <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em" width="49%">
                  <SwitchField
                    label={muscleGroupTracker[muscleGroup as keyof MuscleGroupTracker].label}
                    labelPosition="end"
                    isChecked={muscleGroupTracker[muscleGroup as keyof MuscleGroupTracker].isEnabled}
                    width="8em"
                    onChange={(e) => { setMuscleGroupTracker(prev => ({...prev, [muscleGroup]: { ...muscleGroupTracker[muscleGroup as keyof MuscleGroupTracker], isEnabled: e.target.checked, count: e.target.checked ? 1 : 0}}))}}/>
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!muscleGroupTracker[muscleGroup as keyof MuscleGroupTracker].isEnabled}
                    placeholder="Times per week"
                    value={muscleGroupTracker[muscleGroup as keyof MuscleGroupTracker].count}
                    max={7}
                    min={1}
                    onChange={(e) => { setMuscleGroupTracker(prev => ({...prev, [muscleGroup]: { ...muscleGroupTracker[muscleGroup as keyof MuscleGroupTracker], count: e.target.value}}))}} />
                </Flex>
                ))}
              </Flex>
              <Text marginTop="1em"><b>Available Equipment</b></Text>
              <Text fontSize=".9rem"><i>Select the equipment you have available. Up to 3 will be randomly selected for each workout we create.
                If you have a preference for a particular piece of equipment, increase the percent chance slider to up the likelihood of using it in a workout.</i></Text>
              <Flex direction="row" wrap="wrap">
                {Object.keys(equipmentTracker).map(equipment => (
                  <Flex direction="row" gap="1em" key={equipment} alignItems="center" style={{ width: '49%' }}>
                    <CheckboxField label={equipmentTracker[equipment as keyof EquipmentTracker].label} name={equipment} value={equipmentTracker[equipment as keyof EquipmentTracker].isEnabled.toString()} onChange={handleCheckboxChange} />
                    {equipmentTracker[equipment as keyof EquipmentTracker].isEnabled && (
                      <Flex direction="row" gap="1em" alignItems="center">
                        <SliderField
                          label="" labelHidden
                          name={equipment}
                          min={0} max={1} step={.01}
                          value={equipmentTracker[equipment as keyof EquipmentTracker].count}
                          onChange={(e: number) => setEquipmentTracker(prev => ({ ...prev, [equipment as keyof EquipmentTracker]: { ...prev[equipment as keyof EquipmentTracker], count: e } }))}
                        />
                        <Text fontSize=".9rem"><i>{`${(equipmentTracker[equipment as keyof EquipmentTracker].count ?? 0) * 100}% chance`}</i></Text>
                      </Flex>
                    )}
                  </Flex>
                ))}
              </Flex>
              <Button type="submit" onClick={updateProfile}>Save</Button>
            </Flex>
          </View>
        </Flex>
        <Image src="https://readysetcloud.s3.amazonaws.com/profile.png" height="15em" borderRadius="50%" alt="man lifting barbell over his head" />
      </Flex>
    </Flex>
  );
};

export default SettingsPage;
