import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Authenticator, Heading, Text, Flex, Loader, Image, Alert, Link } from '@aws-amplify/ui-react';
import { getWorkoutById } from '../../graphql/queries';
import { API } from 'aws-amplify';
import Workout from '../../components/Workout';

const ArchivedWorkoutPage = ({ signout, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workoutId, setWorkoutId] = useState('');
  const [workoutDetail, setWorkoutDetail] = useState();

  useEffect(() => {
    if (router.query.id) {
      setWorkoutId(router.query.id);
    }
  }, [router.query]);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      setLoading(true);
      try {
        const workoutSettings = await API.graphql({
          query: getWorkoutById,
          variables: {
            id: workoutId
          }
        });

        setWorkoutDetail(workoutSettings.data.getWorkoutById);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [workoutId]);

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
            <title>Workout | Ready, Set, Cloud Fitness!</title>
          </Head>         
          {workoutDetail && (
            <Workout detail={workoutDetail} showDate={false} showGoBack={true} backDestination={`/workouts${workoutDetail?.muscleGroup ? '?muscleGroup=' + workoutDetail.muscleGroup : ''}`} />
          )}
          {!workoutDetail && (
            <Flex direction="column" alignItems="center">
              <Heading level={5}>Cannot Find Workout</Heading>
              <Text>That's weird, we can't find what you're looking for</Text>
            </Flex>
          )}
        </Flex>
      )}
    </Authenticator>
  );
};

export default ArchivedWorkoutPage;
