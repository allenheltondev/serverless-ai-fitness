import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { Text, ToggleButton, Button, View, Flex, Heading, Divider, SliderField } from '@aws-amplify/ui-react';
import { getWorkoutSettings } from '../graphql/queries';
import { updateSettings } from '../graphql/mutations';
import Head from 'next/head';
import { Tooltip } from 'react-tooltip';
import { toast } from 'react-toastify';
import { isMobile } from 'react-device-detect';
import { FiThumbsUp } from 'react-icons/fi';
import muscleGroupList from '../../lib/MuscleGroups';
import workoutTypes from '../../lib/WorkoutTypes';
import equipment from '../../lib/Equipment';

const SettingsPage = () => {
  const days = [
    { name: 'Sunday', value: 'Su' },
    { name: 'Monday', value: 'M' },
    { name: 'Tuesday', value: 'T' },
    { name: 'Wednesday', value: 'W' },
    { name: 'Thursday', value: 'Th' },
    { name: 'Friday', value: 'F' },
    { name: 'Saturday', value: 'Sa' },
  ]
  const [settings, setSettings] = useState({
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

  useEffect(() => {
    const fetchUserData = async () => {
      const workoutSettings = await API.graphql({ query: getWorkoutSettings });
      setSettings(workoutSettings.data.getMySettings);
    };

    fetchUserData();
  }, []);

  const saveSettings = async () => {
    try {
      const response = await API.graphql({
        query: updateSettings,
        variables: {
          input: settings
        }
      });
      if (response?.data?.updateSettings) {
        toast.success('Settings saved', { position: 'top-right', autoClose: 10000, draggable: false, hideProgressBar: true, theme: 'colored' });
      } else {
        toast.error('Failed to update settings. Please try again', { position: 'top-right', autoClose: 10000, draggable: false, hideProgressBar: true, theme: 'colored' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update settings. Please try again', { position: 'top-right', autoClose: 10000, draggable: false, hideProgressBar: true, theme: 'colored' });
    }
  };

  const updateMuscleGroups = (muscleGroup) => {
    const mg = [...settings.muscleGroups];
    const index = mg.indexOf(muscleGroup);
    if (index > -1) {
      mg.splice(index, 1);
    } else {
      mg.push(muscleGroup)
    }

    setSettings((prev) => ({ ...prev, muscleGroups: mg }));
  };

  const updateWorkoutTypes = (workoutType) => {
    const wt = [...settings?.workoutTypes ?? []];
    const index = wt.indexOf(w => wt.type == workoutType);
    if (index > -1) {
      wt.splice(index, 1);
    } else {
      wt.push({ type: workoutType, modifier: '' });
    }

    setSettings((prev) => ({ ...prev, workoutTypes: wt }));
  };

  const updateEquipment = (equipment) => {
    const e = [...settings?.equipment ?? []];
    const index = e.indexOf(eq => eq.type == equipment);
    if (index > -1) {
      e.splice(index, 1);
    } else {
      e.push({ type: equipment, threshold: .5 });
    }

    setSettings((prev) => ({ ...prev, equipment: e }));
  };

  const updateDaysOfTheWeek = (day) => {
    const days = [...settings.frequency];
    const index = days.indexOf(day);
    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day)
    }

    setSettings((prev) => ({ ...prev, frequency: days }));
  };

  return (
    <>
      <Head>
        <title>Settings | Ready, Set, Cloud Fitness!</title>
      </Head>
      <Flex direction="column">
        <Heading level={4}>Workout Settings</Heading>
        <Text fontSize=".9rem"><i>Changes to your settings will update your workouts. Your workouts will regenerate one time a day when you make updates.
          If you're missing workouts on your calendar, you're in the right spot!</i></Text>
        <Flex direction="column" gap="1em">
          <SliderField
            name="targetTime"
            label="Preferred workout length (mins)"
            value={settings.targetTime}
            min={15}
            max={90}
            maxWidth={"25em"}
            onChange={(e) => setSettings(prev => ({ ...prev, targetTime: e }))}
          />
          <Text marginBottom=".3em"><b>Workout Days</b></Text>
          <Flex direction="row" wrap="wrap" gap=".75em">
            {days.map(day => (
              <ToggleButton
                variation="primary"
                name={day.value}
                key={day.value + '-btn'}
                borderRadius='large'
                width="fit-content"
                size={isMobile ? "small" : ""}
                isPressed={settings.frequency?.includes(day.value)}
                onClick={() => updateDaysOfTheWeek(day.value)}
              >{day.name}
              </ToggleButton>
            ))}
          </Flex>
          <Divider size="large" />
          <Text><b>Workout Types</b></Text>
          <Flex direction="row" wrap="wrap" gap=".75em">
            {workoutTypes.map(wt => (
              <ToggleButton
                variation="primary"
                name={wt.value}
                key={wt.value + '-btn'}
                borderRadius='large'
                width="fit-content"
                size={isMobile ? "small" : ""}
                isPressed={settings.workoutTypes?.find(type => type.type == wt.value)}
                data-tooltip-id={wt.value + '-tooltip'}
                onClick={() => updateWorkoutTypes(wt.value)}
              >{wt.name}
                {!isMobile && (<Tooltip id={wt.value + '-tooltip'} content={wt.description} />)}
              </ToggleButton>
            ))}
          </Flex>
          <Text><b>Muscle Groups</b></Text>
          <Text fontSize=".9rem"><i>Select what you'd like to work out each week. If you choose more muscle groups than workout days, some muscle groups will not be worked out in a given week.</i></Text>
          <Flex direction="row" wrap="wrap" gap=".75em">
            {muscleGroupList.map(mg => (
              <ToggleButton
                variation="primary"
                name={mg.value}
                key={mg.value + '-btn'}
                borderRadius='large'
                width="fit-content"
                size={isMobile ? "small" : ""}
                isPressed={settings.muscleGroups.includes(mg.value)}
                onClick={() => updateMuscleGroups(mg.value)}
              >{mg.name}</ToggleButton>
            ))}
          </Flex>
          <Text marginTop="1em"><b>Available Equipment</b></Text>
          <Text fontSize=".9rem"><i>Select the equipment you have available. Up to 3 will be randomly selected for each workout.</i></Text>
          <Flex direction="row" wrap="wrap" gap=".75em">
            {equipment.map(e => (
              <ToggleButton
                variation="primary"
                name={e.value}
                key={e.value + '-btn'}
                borderRadius='large'
                width="fit-content"
                size={isMobile ? "small" : ""}
                isPressed={settings.equipment.find(eq => eq.type == e.value)}
                onClick={() => updateEquipment(e.value)}
              >{e.name}</ToggleButton>
            ))}
          </Flex>
        </Flex>
        <Button marginTop="2em" type="submit" width={isMobile ? "100%" : "fit-content"} onClick={saveSettings}>Save</Button>
      </Flex>
    </>
  );
};

export default SettingsPage;
