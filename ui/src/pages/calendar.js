import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Authenticator, Card, Heading, Text, Flex, Loader, Divider, Link, Alert } from '@aws-amplify/ui-react';
import { getWorkoutList } from '../graphql/queries';
import { API } from 'aws-amplify';
import muscleGroupList from '../../lib/MuscleGroups';
import workoutTypes from '../../lib/WorkoutTypes';

const CalendarPage = ({ signout, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sunday, setSunday] = useState(undefined);
  const [workouts, setWorkouts] = useState([]);
  const [calendar, setCalendar] = useState([]);

  useEffect(() => {
    let date = new Date();
    date.setUTCDate(date.getUTCDate() - date.getUTCDay());
    setSunday(date);
  }, []);

  useEffect(() => {
    const fetchWorkouts = async () => {
      console.log('here')
      setLoading(true);
      try {
        const workouts = await API.graphql({
          query: getWorkoutList,
          variables: {
            date: sunday.toISOString().split('T')[0]
          }
        });

        setWorkouts(workouts?.data?.getWorkoutList?.workouts ?? []);
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false);
      }
    };
    if (sunday) {
      fetchWorkouts();
    }
  }, [sunday]);

  useEffect(() => {
    if (sunday) {
      const workoutCalendar = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        const shortDate = date.toISOString().split('T')[0];
        const workout = workouts.find(w => w.date == shortDate);
        workoutCalendar.push({ date, ...workout && { workout } });
      }

      setCalendar(workoutCalendar);
    }
  }, [workouts]);

  const getFormattedDate = (date) => {
    const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    const dayOfWeek = days[date.getDay()];
    const formattedDate = date.toLocaleDateString(undefined, {
      month: 'numeric',
      day: 'numeric'
    });

    return `${dayOfWeek}, ${formattedDate}`;
  }

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" justifyContent="center" >
        <Loader size="large" />
      </Flex>
    );
  }

  return (
    <Authenticator socialProviders={["google"]}>
      {({ signOut, user }) => (
        <Flex direction="column" width="100%">
          <Head>
            <title>Calendar | Ready, Set, Cloud Fitness!</title>
          </Head>
          <Alert backgroundColor={"var(--primary)"} hasIcon={false} isDismissible={false}>
            <Heading level={5} color="white">Workouts This Week</Heading>
          </Alert>
          <Flex direction="row" gap="0em" wrap="wrap">
            {calendar.map(day => (
              <Card variation="outlined" key={day.date.toISOString()} flex={1}>
                <Flex direction="column" gap=".5em" borderWidth="1px" borderColor="black">
                  <Heading level={6}>{getFormattedDate(day.date)}</Heading>
                  <Divider size="small" />
                  {day.workout && (
                    <Flex direction="column" gap=".5em" maxWidth="10em" onClick={() => router.push(`/?date=${day.workout.date}`)} style={{ cursor: "pointer" }}>
                      <Text>{muscleGroupList.find(mg => mg.value == day.workout.muscleGroup).name} - {workoutTypes.find(wt => wt.value == day.workout.workoutType)?.name}</Text>
                      <Text fontSize=".9rem"><i>{day.workout.equipment}</i></Text>
                    </Flex>
                  )}
                </Flex>
              </Card>
            ))}
          </Flex>
          <Text textAlign="center"><i>If you don't see anything here, try <Link href="/settings">updating your settings</Link>.
            Once your setup is complete, allow a couple of minutes for your workouts to be created.</i></Text>
        </Flex>
      )}
    </Authenticator>
  );
};

export default CalendarPage;
