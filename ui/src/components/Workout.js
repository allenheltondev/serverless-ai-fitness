import { useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Heading, Text, View, Card, Flex } from '@aws-amplify/ui-react';
import { getWorkoutHeading, getWorkoutEquipment } from '../util/formatters';
import { BiArrowBack } from 'react-icons/bi';
import { IoInformationCircleOutline } from "react-icons/io5";
import { getExerciseDefinition } from '../graphql/queries';
import { API } from 'aws-amplify';
import Popup from './Popup';

const Workout = ({ detail, date, showGoBack, backDestination }) => {
  const router = useRouter();
  const [definition, setDefinition] = useState({ title: '', description: '' });

  const showExerciseDefinition = async (exercise) => {
    try {
      const exerciseDefinition = await API.graphql({
        query: getExerciseDefinition,
        variables: {
          exercise: exercise.name
        }
      });
      const { description: def } = exerciseDefinition.data.getExerciseDefinition;

      setDefinition({ title: exercise.name, description: def });

    } catch (err) {
      console.error(err);
      setDefinition({ title: '', description: '' });
    }
  };

  return (
    <>
      <Alert backgroundColor={"var(--primary)"} hasIcon={false} isDismissible={false}>
        <Flex direction="row" gap="1em" alignItems="center">
          {showGoBack && (<BiArrowBack size="2em" color="white" onClick={() => router.push(backDestination)} style={{ cursor: "pointer" }} />)}
          <Flex direction="column" gap=".3em">
            <Heading level={5} color="white">{getWorkoutHeading(detail, date)}</Heading>
            <Text color="white"><i>With {getWorkoutEquipment(detail)}</i></Text>
          </Flex>
        </Flex>

      </Alert>
      <View>
        <Card variation="elevated">
          <Heading level={4}>Warmup</Heading>
          <Flex direction="row" wrap="wrap" gap=".5em" marginTop="1em">
            {detail?.workout?.warmup?.exercises?.map((exercise, exerciseIndex) => (
              <Text key={`workout-${exerciseIndex}`} basis="48%">{`${exercise.numReps}x ${exercise.name}`}</Text>
            ))}
          </Flex>
        </Card>
        <Card variation="elevated" marginTop="1em">
          <Heading level={4}>Main Set</Heading>
          <Flex direction="column" gap=".5em" marginTop="1em">
            <Heading level={5}>{detail?.workout?.mainSet?.numSets} rounds</Heading>
            {detail?.workout?.mainSet?.sets?.map((set, index) => (
              <View key={`set-${index}`}>
                {detail?.workout?.mainSet?.sets.length > 1 ?
                  (<Text><b>Set {index + 1}{set.exercises.some(e => e.numReps) ? '' : ' - ' + set.numReps + ' reps'}</b></Text>)
                  : (<Text><b>{set.exercises.some(e => e.numReps) ? '' : ' - ' + set.numReps + ' reps'}</b></Text>)
                }
                {set.exercises.map((exercise, exerciseIndex) => (
                  <Flex direction="row" gap=".4em" alignItems="center">
                    <Text key={`set-${index}-${exerciseIndex}`}>&ensp;{exercise.numReps ? exercise.numReps + 'x ' : ''}{exercise.name}</Text>
                    <IoInformationCircleOutline color='black' size="1em" onClick={(e) => showExerciseDefinition(exercise)}  cursor="pointer"/>
                  </Flex>
                ))}
              </View>
            ))}
          </Flex>
        </Card>
        <Card variation="elevated" marginTop="1em">
          <Heading level={4}>Abs</Heading>
          <Flex direction="row" wrap="wrap" gap=".5em" marginTop="1em">
            {detail?.workout?.abs?.exercises?.map((exercise, exerciseIndex) => (
              <Text key={`ab-${exerciseIndex}`} basis="48%">{`${exercise.numReps}x ${exercise.name}`}</Text>
            ))}
          </Flex>
        </Card>
        {definition.title && (
          <Popup title={definition.title} description={definition.description} onClose={(e) => setDefinition({ title: '' })} />
        )}
      </View>
    </>
  );
};

export default Workout;
