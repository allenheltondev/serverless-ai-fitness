import Head from "next/head";
import {Heading, Text, Flex, Expander, ExpanderItem, Link, Alert} from '@aws-amplify/ui-react';

const HelpPage = () => {

  return (
    <>
      <Head>
        <title>Help | Ready, Set, Cloud Fitness!</title>
      </Head>
      <Flex direction="column" width="100%">
      <Alert backgroundColor={"var(--primary)"} hasIcon={false} isDismissible={false}>
          <Heading level={5} color="white">Need some help?</Heading>
          <Text marginTop=".3em" color="white">This can be a little confusing as we build out the onboarding experience. Check out the FAQ below.</Text>
        </Alert>        
        <Expander type="multiple" defaultValue={["what-do-i-do"]}>
          <ExpanderItem title="What do I do now?" value="what-do-i-do" color="black">
            If you're brand new, welcome! After you first sign up, you'll need to configure your <Link href="/settings">settings</Link> and <Link href="/profile">profile</Link>. 
            After you finish filling out your settings, workouts will be automatically generated for the week. 
            You can view the whole week on your <Link href="/calendar">calendar</Link>, or check out today's workout on the <Link href="/">homepage</Link>.
          </ExpanderItem>
          <ExpanderItem title="Where are my workouts?" value="where-are-my-workouts">
            Did you expect to see a workout today but it's not there? Chances are you need to <Link href="/settings">configure your settings</Link>. 
            Workout settings must be configured in order for us to generate them for you. <br/>
            When you save your settings, the workouts for the week will be generated for you automatically. But please note - 
            <i>workouts will only be generated one time per day.</i> You can save your settings as many times as you want, but it will only trigger
            workouts to be created for you one time.
          </ExpanderItem>
          <ExpanderItem title="How does this work?" value="how-does-this-work">
            Workout programs are hard. They usually rely on specialty coaches and expensive gym equipment. They also don't usually tailor to your exact preferences.
            Our goal is to fix that. You <Link href="/settings">configure your personal preferences</Link>, what gym equipment you have available, and what muscle groups you want to work out, and
            we'll take care of the rest. We use AI to generate your workout program for you - making it custom to your needs! 
          </ExpanderItem>
          <ExpanderItem title="I don't know some of these workout types" value="workout-types">
            No problem, here's a summary of all the workout types: <br/><br/>
            <ul>
              <li><b>AMRAP</b> - As Many Rounds As Possible. Complete as many rounds of a circuit as possible within a specific time frame</li>
              <li><b>Circuit</b> - Move from one exercise to another with little to no rest in between</li>
              <li><b>EMOM</b> - Every Minute On the Minute.  At the start of each minute, perform a specific number of reps and rest for the remainder of the minute</li>
              <li><b>HIIT</b> - High Intensity Interval Training. Short bursts of high-intensity exercises followed by a short rest period</li>
              <li><b>Standard</b> - Typical set and rep structure. Complete an exercise completely before moving to the next</li>
              <li><b>Supersets</b> - Multiple sets of two exercises are performed back-to-back without any rest</li>
            </ul>
          </ExpanderItem>
          <ExpanderItem title="What is my profile used for?" value="profile">
            Well, nothing right now. But in the near future we'll implement training groups, allowing you and your workout partners to share the same daily workouts. 
            Your profile information will be listed to help your buddies find you!
          </ExpanderItem>
          <ExpanderItem title="Why do my workouts only generate once a day?" value="workout-generation">
            As much as we'd like to regenerate your workouts as often as you'd like, it's expensive! In an effort to reduce operational costs, you'll be limited to only one generation a day.
          </ExpanderItem>
        </Expander>
      </Flex>
    </>
  )
};

export default HelpPage;