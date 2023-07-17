import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Auth, API } from 'aws-amplify';
import { Text, TextField, Button, RadioGroupField, Radio, View, Flex, Heading, Image, Divider, SelectField, SliderField, CheckboxField, SwitchField } from '@aws-amplify/ui-react';
import { getWorkoutSettings } from '@/graphql/queries';

interface Settings {
  targetTime: number,
  frequency: string[],
  muscleGroups: string[]
};

interface GetWorkoutSettingsResponse {
  data: {
    getWorkoutSettings: Settings
  }
}

interface MuscleGroupTracker {
  isEnabled: boolean,
  count: number | undefined
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({    
    targetTime: 45,
    frequency: [],
    muscleGroups: []
  });

  const [isSundayChecked, setIsSundayChecked] = useState(false);
  const [isMondayChecked, setIsMondayChecked] = useState(false);
  const [isTuesdayChecked, setIsTuesdayChecked] = useState(false);
  const [isWednesdayChecked, setIsWednesdayChecked] = useState(false);
  const [isThursdayChecked, setIsThursdayChecked] = useState(false);
  const [isFridayChecked, setIsFridayChecked] = useState(false);
  const [isSatdayChecked, setIsSaturdayChecked] = useState(false);
  const [armTracker, setArmTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [backTracker, setBackTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [legTracker, setLegTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [shoulderTracker, setShoulderTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [chestTracker, setChestTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [cardioTracker, setCardioTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [totalBodyTracker, setTotalBodyTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined })

  useEffect(() => {
    const fetchUserData = async () => {
      const workoutSettings = await API.graphql({ query: getWorkoutSettings });
      initializeSettings(workoutSettings.data.getWorkoutSettings);
    }

    fetchUserData();
  }, []);

  const initializeSettings = (settings: Settings) => {
    toggleFrequencyCheckboxes(settings.frequency);
    toggleTrackers(settings.muscleGroups);

    setSettings(settings);
  };

  const toggleTrackers = (muscleGroups: string[]) => {
    setArmTracker(initializeTracker(muscleGroups, 'arm'));
    setBackTracker(initializeTracker(muscleGroups, 'back'));
    setLegTracker(initializeTracker(muscleGroups, 'leg'));
    setCardioTracker(initializeTracker(muscleGroups, 'cardio'));
    setTotalBodyTracker(initializeTracker(muscleGroups, 'total body'));
    setShoulderTracker(initializeTracker(muscleGroups, 'shoulder'));
    setChestTracker(initializeTracker(muscleGroups, 'chest'));
  };

  const initializeTracker = (muscleGroups: string[], muscleGroup: string) => {
    const count = muscleGroups.reduce((c, mg) => {
      return c + (mg === muscleGroup ? 1 : 0);
    }, 0);

    const tracker: MuscleGroupTracker = { isEnabled: (count > 0), count };
    console.log(muscleGroup, tracker);
    console.log(muscleGroups);
    return tracker;
  };

  const handleRootFieldChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
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
    muscleGroups = addToArray(muscleGroups, 'arm', armTracker);
    muscleGroups = addToArray(muscleGroups, 'shoulder', shoulderTracker);
    muscleGroups = addToArray(muscleGroups, 'back', backTracker);
    muscleGroups = addToArray(muscleGroups, 'chest', chestTracker);
    muscleGroups = addToArray(muscleGroups, 'leg', legTracker);
    muscleGroups = addToArray(muscleGroups, 'cardio', cardioTracker);
    muscleGroups = addToArray(muscleGroups, 'total body', totalBodyTracker);

    return muscleGroups;
  };

  const addToArray = (muscleGroups: string[], muscleGroupName: string, muscleGroup: MuscleGroupTracker) => {
    let count = muscleGroup.count ?? 0;
    for (let i = 0; i < count; i++) {
      muscleGroups.push(muscleGroupName)
    }

    return muscleGroups;
  };

  return (

    <Flex direction="column">
      <Flex direction="row" justifyContent="space-between" paddingRight="2em">
        <Flex direction="column" width="60%">
          <Heading level={4}>Workout Settings</Heading>
          <View className="mt-3">
            <Flex direction="column" gap="1em">              
              
            </Flex>
            <Divider margin="1em .5em" />
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
            <Flex direction="row" justifyContent="space-between" gap="2em">
              <Flex direction="column" basis="50%">
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Arms"
                    labelPosition="end"
                    isChecked={armTracker.isEnabled}
                    width="8em"
                    onChange={(e) => { setArmTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!armTracker.isEnabled}
                    placeholder="Times per week"
                    value={armTracker.count}
                    max="7"
                    onChange={(e) => { setArmTracker({ ...armTracker, count: Number(e.target.value) }) }} />
                </Flex>
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Chest"
                    labelPosition="end"
                    isChecked={chestTracker.isEnabled}
                    width="8em"
                    onChange={(e) => { setChestTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!chestTracker.isEnabled}
                    placeholder="Times per week"
                    value={chestTracker.count}
                    max="7"
                    onChange={(e) => { setChestTracker({ ...armTracker, count: Number(e.target.value) }) }} />
                </Flex>
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Shoulders"
                    labelPosition="end"
                    isChecked={shoulderTracker.isEnabled}
                    width="8em"
                    onChange={(e) => { setShoulderTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!shoulderTracker.isEnabled}
                    placeholder="Times per week"
                    value={shoulderTracker.count}
                    max="7"
                    onChange={(e) => { setShoulderTracker({ ...shoulderTracker, count: Number(e.target.value) }) }} />
                </Flex>
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Full Body"
                    labelPosition="end"
                    isChecked={totalBodyTracker.isEnabled}
                    width="8em"
                    onChange={(e) => { setTotalBodyTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!totalBodyTracker.isEnabled}
                    placeholder="Times per week"
                    value={totalBodyTracker.count}
                    max="7"
                    onChange={(e) => { setTotalBodyTracker({ ...totalBodyTracker, count: Number(e.target.value) }) }} />
                </Flex>
              </Flex>
              <Flex direction="column" basis="50%">
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Back"
                    labelPosition="end"
                    isChecked={backTracker.isEnabled}
                    width="6em"
                    onChange={(e) => { setBackTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!backTracker.isEnabled}
                    placeholder="Times per week"
                    value={backTracker.count}
                    max="7"
                    onChange={(e) => { setBackTracker({ ...backTracker, count: Number(e.target.value) }) }} />
                </Flex>
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Legs"
                    labelPosition="end"
                    isChecked={legTracker.isEnabled}
                    width="6em"
                    onChange={(e) => { setLegTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!legTracker.isEnabled}
                    placeholder="Times per week"
                    value={legTracker.count}
                    max="7"
                    onChange={(e) => { setLegTracker({ ...legTracker, count: Number(e.target.value) }) }} />
                </Flex>
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Cardio"
                    labelPosition="end"
                    isChecked={cardioTracker.isEnabled}
                    width="6em"
                    onChange={(e) => { setCardioTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!cardioTracker.isEnabled}
                    placeholder="Times per week"
                    value={cardioTracker.count}
                    max="7"
                    onChange={(e) => { setCardioTracker({ ...cardioTracker, count: Number(e.target.value) }) }} />
                </Flex>
              </Flex>
              <SliderField
                name="targetTime"
                label="Preferred workout length"
                value={settings.targetTime}
                min={15}
                max={90}
                width="50%"
                onChange={(e: number) => setSettings(prev => ({ ...prev, targetTime: e }))}
              />
            </Flex>
            <Button type="submit" onClick={updateProfile}>Save</Button>
          </View>
        </Flex>
        <Image src="https://readysetcloud.s3.amazonaws.com/profile.png" height="15em" borderRadius="50%" alt="man lifting barbell over his head" />
      </Flex>
    </Flex>

  );
};

export default SettingsPage;
