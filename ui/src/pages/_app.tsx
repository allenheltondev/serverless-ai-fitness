import '@/styles/globals.css';
import '@aws-amplify/ui-react/styles.css';
import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import { AmplifyProvider, Card, Flex, Text, Button } from '@aws-amplify/ui-react';
import { GiWeightLiftingUp, GiWeight } from 'react-icons/gi';
import { MdNotifications } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { config } from '@/config';
import { useRouter } from 'next/router';
import TitleBar from '@/components/TitleBar';

Amplify.configure(config);

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <AmplifyProvider>
      <Flex id="page" direction="column" height="100%">
        <Card padding="0">
          <TitleBar title="" />
        </Card>
        <Flex id="navAndContent" direction="row" padding="0em 1em 1em 1em" justifyContent="space-between" minHeight="93vh">
          <Card style={{ flexBasis: "14%" }} variation="elevated">
            <Button variation="link" isFullWidth={true} justifyContent="left" gap="relative.small" >
              <GiWeightLiftingUp color="black" /><Text>Workouts</Text>
            </Button>
            <Button variation="link" isFullWidth={true} justifyContent="left" gap="relative.small" onClick={(() => router.push('/settings'))} ><GiWeight color="black" /><Text>Settings</Text></Button>
            <Button variation="link" isFullWidth={true} justifyContent="left" gap="relative.small" onClick={() => router.push('/profile')}>
              <CgProfile color="black" />
              <Text>Profile</Text>
            </Button>
          </Card>
          <Flex id="content" direction="column" style={{ flexBasis: "85%" }} justifyContent="space-between">
            <Card variation="elevated" height="relative.full">
              <Component {...pageProps} />
            </Card>
            <Card variation="elevated" backgroundColor={"var(--primary)"}>
              <Flex alignContent="center" justifyContent="center" height="100%">
                <Text color="white">
                  | &copy; {currentYear} <i>Ready, Set, Cloud!</i> | All rights reserved! |
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Flex>
    </AmplifyProvider>
  )
};
