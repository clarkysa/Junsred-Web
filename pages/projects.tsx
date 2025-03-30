import { Box, Input, SimpleGrid, Heading, Text, InputGroup, InputLeftElement, Flex, Tag, Badge, Container, VStack, HStack, useColorModeValue, Divider, Alert, AlertIcon } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Search } from 'react-icons/fa';

import CategoryButton from '@/components/buttons/category-button';
import ProjectCard from '@/components/cards/project';
import useProjects from '@/hooks/useProjects';
import { Category } from '@/lib/category';
import Project from '@/lib/project';

interface ProjectDeckProps {
  projects: Project[];
  categories: Category[];
}

function ProjectDeck({ projects, categories }: ProjectDeckProps) {
  const [selected, setSelected] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Filter projects based on search term and selected category
  const filteredProjects = projects
    .filter((item) => {
      const term = searchTerm.toLowerCase();
      const name = item.name.toLowerCase();
      const desc = item.description.toLowerCase();

      return name.includes(term) || desc.includes(term);
    })
    .filter((item) => {
      return selected === 'All'
        ? true
        : item.categories.includes(selected);
    });

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={2}>Projects</Heading>
          <Text color="gray.600">Browse through my portfolio of projects</Text>
        </Box>
        
        <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="sm" border="1px solid" borderColor={borderColor}>
          <VStack spacing={6} align="stretch">
            <Box>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Search color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search projects by name or description"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  borderRadius="md"
                  boxShadow="sm"
                />
              </InputGroup>
            </Box>
            
            <Divider />
            
            <Box>
              <Text fontWeight="medium" mb={3}>Filter by category:</Text>
              <Flex flexWrap="wrap" gap={2}>
                <CategoryButton
                  category={{ name: 'All', projects: projects.length }}
                  selected={selected}
                  onSelect={setSelected}
                />
                {categories.map((item, index) => (
                  <CategoryButton
                    category={item}
                    key={index}
                    selected={selected}
                    onSelect={setSelected}
                  />
                ))}
              </Flex>
            </Box>
            
            <HStack>
              <Badge colorScheme="purple">{filteredProjects.length} projects</Badge>
              {searchTerm && (
                <Badge colorScheme="blue">Search: "{searchTerm}"</Badge>
              )}
              {selected !== 'All' && (
                <Badge colorScheme="green">Category: {selected}</Badge>
              )}
            </HStack>
          </VStack>
        </Box>

        {filteredProjects.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {filteredProjects.map((item, index) => (
              <ProjectCard key={index} project={item} />
            ))}
          </SimpleGrid>
        ) : (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            No projects match your current filters. Try adjusting your search or category selection.
          </Alert>
        )}
      </VStack>
    </Container>
  );
}

export default function Projects() {
  const { getProjects } = useProjects();
  const [categories, setCategories] = useState<Category[]>([]);
  const projects = getProjects();

  useEffect(() => {
    if (projects) {
      const categories: { [index: string]: number } = {};

      for (const project of projects) {
        for (const categoryName of project.categories) {
          const old = categories[categoryName] || 0;
          categories[categoryName] = old + 1;
        }
      }

      setCategories(
        Object.keys(categories).map((key) => ({
          name: key,
          projects: categories[key],
        })),
      );
    }
  }, [projects]);

  return (
    <>
      {projects && <ProjectDeck projects={projects} categories={categories} />}
    </>
  );
}
