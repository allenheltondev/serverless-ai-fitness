import { useRouter } from 'next/router';
import { Alert, Heading, Text, View, Card, Flex } from '@aws-amplify/ui-react';
import { getWorkoutHeading, getWorkoutEquipment } from '../util/formatters';
import { BiArrowBack } from 'react-icons/bi';

const Workout = ({ detail, date, showGoBack, backDestination }) => {
  const router = useRouter();
  console.log(date);
  return (
    <>
      <Alert backgroundColor={"var(--primary)"} hasIcon={false} isDismissible={false}>
        <Flex direction="row" gap="1em" alignItems="center">
          {showGoBack && ( <BiArrowBack size="2em" color="white" onClick={() => router.push(backDestination)} style={{cursor: "pointer"}} />)}
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
                <Text><b>Set {index + 1}</b></Text>
                {set.exercises.map((exercise, exerciseIndex) => (
                  <Text key={`set-${index}-${exerciseIndex}`}>&ensp;{exercise.name}</Text>
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
      </View>
    </>
  )
};

export default Workout;