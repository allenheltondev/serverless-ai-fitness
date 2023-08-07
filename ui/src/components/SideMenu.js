import { Flex, Card, Text, View } from "@aws-amplify/ui-react";
import { GiWeightLiftingUp, GiWeight } from 'react-icons/gi';
import { CgProfile, CgCalendar } from 'react-icons/cg';
import { BiHelpCircle } from 'react-icons/bi';
import { useRouter } from 'next/router';

const SideMenu = ({ isOpen }) => {
  const router = useRouter();
  
  return (
    <Card variation="elevated" width="fit-content" height="auto" transition="'0.5s" paddingRight={isOpen ? "2em" : "1em"}>
      <Flex direction="column" gap="1em" alignItems="flex-start" >
        <Flex direction="row" gap=".5em" alignItems="center" style={{cursor: "pointer"}} onClick={() => router.push('/')}>
          <GiWeightLiftingUp color="black" size="1.5em"/>
          {isOpen && <Text marginLeft=".6em">Workout</Text>}
        </Flex>
        <Flex direction="row" gap=".5em" alignItems="center" style={{cursor: "pointer"}} onClick={() => router.push('/calendar')}>
          <CgCalendar color="black" size="1.5em"/>
          {isOpen && <Text marginLeft=".6em">Calendar</Text>}
        </Flex>
        <Flex direction="row" gap=".5em" alignItems="center" style={{cursor: "pointer"}} onClick={() => router.push('/profile')}>
          <CgProfile color="black" size="1.5em"/>
          {isOpen && <Text marginLeft=".6em">Profile</Text>}
        </Flex>
        <Flex direction="row" gap=".5em" alignItems="center" style={{cursor: "pointer"}} onClick={() => router.push('/settings')}>
          <GiWeight color="black" size="1.5em"/>
          {isOpen && <Text marginLeft=".6em">Settings</Text>}
        </Flex>        
        <Flex direction="row" gap=".5em" alignItems="center" style={{cursor: "pointer"}} onClick={() => router.push('/help')}>
          <BiHelpCircle color="black" size="1.5em"/>
          {isOpen && <Text marginLeft=".6em">Help</Text>}
        </Flex>
      </Flex>
    </Card>
  );
};

export default SideMenu;