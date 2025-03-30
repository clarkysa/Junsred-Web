import { Box, Container, Heading, Text, VStack, HStack, Icon, Divider, useColorModeValue } from '@chakra-ui/react';
import { FaJava, FaJs, FaLock, FaBook, FaLaptopCode, FaGamepad, FaHeart } from 'react-icons/fa';
import { GiCoffeeCup, GiCupcake, GiIceCreamCone } from 'react-icons/gi';
import { BiDrink } from 'react-icons/bi';

import PresentationCard from '../components/cards/presentation';

export default function Home() {
  const bgAccent = useColorModeValue('purple.50', 'purple.900');
  
  return (
    <Container maxW="container.lg" py={8}>
      <PresentationCard />
      
      <Box 
        marginTop="10" 
        p={6} 
        borderRadius="lg" 
        bg={bgAccent}
        boxShadow="md"
      >
        <Heading size="xl" mb={4} borderBottom="2px solid" borderColor="purple.400" pb={2}>
          Who am I?
        </Heading>
        
        <VStack spacing={6} align="stretch">
          <Text fontSize="lg" lineHeight="tall">
            My name is Junsred, I am a 20yo programmer from Argentina who likes to
            develop <Icon as={FaBook} color="blue.500" mx="1" /> libraries, 
            <Icon as={FaLaptopCode} color="teal.500" mx="1" /> APIs, 
            <Icon as={FaHeart} color="purple.500" mx="1" /> utilities for streamers, 
            <Icon as={FaGamepad} color="green.500" mx="1" /> games,
            <Icon as={FaJs} color="yellow.500" mx="1" /> crypto and many more varied things that come from my imagination.
          </Text>

          <Text fontSize="lg" lineHeight="tall">
            I am very passionate about programming and <Icon as={FaLock} color="gray.500" mx="1" /> cybersecurity. 
            I am fullstack but I prefer backend.
          </Text>

          <Divider />

          <Box>
            <Heading size="md" mb={3}>Things I enjoy:</Heading>
            <HStack spacing={4} flexWrap="wrap">
              <Box p={3} bg="red.50" borderRadius="md" boxShadow="sm">
                <HStack>
                  <Icon as={FaJava} color="brown.500" boxSize={5} />
                  <Text>Java</Text>
                </HStack>
              </Box>
              <Box p={3} bg="yellow.50" borderRadius="md" boxShadow="sm">
                <HStack>
                  <Icon as={FaJs} color="yellow.500" boxSize={5} />
                  <Text>JavaScript</Text>
                </HStack>
              </Box>
              <Box p={3} bg="blue.50" borderRadius="md" boxShadow="sm">
                <HStack>
                  <Icon as={GiCoffeeCup} color="brown.500" boxSize={5} />
                  <Text>Coffee</Text>
                </HStack>
              </Box>
              <Box p={3} bg="pink.50" borderRadius="md" boxShadow="sm">
                <HStack>
                  <Icon as={BiDrink} color="pink.500" boxSize={5} />
                  <Text>Frappuccinos</Text>
                </HStack>
              </Box>
              <Box p={3} bg="orange.50" borderRadius="md" boxShadow="sm">
                <HStack>
                  <Icon as={GiCupcake} color="orange.500" boxSize={5} />
                  <Text>Donuts</Text>
                </HStack>
              </Box>
              <Box p={3} bg="purple.50" borderRadius="md" boxShadow="sm">
                <HStack>
                  <Icon as={GiIceCreamCone} color="purple.500" boxSize={5} />
                  <Text>Mascarpone ice cream</Text>
                </HStack>
              </Box>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
}
