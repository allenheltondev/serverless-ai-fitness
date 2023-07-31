import '../styles/globals.css';
import '@aws-amplify/ui-react/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { Amplify } from 'aws-amplify';
import { AmplifyProvider, Card, Flex, Text, Button } from '@aws-amplify/ui-react';
import { GiWeightLiftingUp, GiWeight } from 'react-icons/gi';
import { CgProfile, CgCalendar } from 'react-icons/cg';
import { config } from '../config';
import { useRouter } from 'next/router';
import TitleBar from '../components/TitleBar';
import { ToastContainer } from 'react-toastify';
import { isMobile } from 'react-device-detect'

Amplify.configure(config);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <AmplifyProvider>
      <Flex id="page" direction="column" height="100%">
        <Card padding="0">
          <TitleBar showMenu={true} />
        </Card>

        <Flex id="navAndContent" direction="row" padding="0em 1em 1em 1em" justifyContent="space-between" minHeight="93vh">
          <Flex id="content" direction="column" style={{ flexBasis: "100%" }} justifyContent="space-between">
            <Card variation="elevated" height="relative.full" padding={isMobile ? "1em" : "2em 2em"}>
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
      <ToastContainer />
    </AmplifyProvider>
  )
};
