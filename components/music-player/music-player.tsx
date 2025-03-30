import { Box, Flex, Text, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb, HStack, VStack, useColorModeValue, Image, Badge, Tooltip, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, Button } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { BsFillPlayFill, BsFillPauseFill, BsVolumeUp, BsVolumeMute, BsSkipBackwardFill, BsSkipForwardFill, BsMusicNoteList } from 'react-icons/bs';

// Define the track interface
interface Track {
  id: number;
  title: string;
  artist: string;
  src: string;
  cover: string;
}

// Sample tracks - replace with your actual tracks
const tracks: Track[] = [
  {
    id: 1,
    title: "Chill Vibes",
    artist: "LoFi Producer",
    src: "/music/track1.mp3",
    cover: "/music/covers/track1.jpg"
  },
  {
    id: 2,
    title: "Coding Session",
    artist: "Dev Beats",
    src: "/music/track2.mp3",
    cover: "/music/covers/track2.jpg"
  },
  {
    id: 3,
    title: "Late Night",
    artist: "Ambient Dreams",
    src: "/music/track3.mp3",
    cover: "/music/covers/track3.jpg"
  },
  {
    id: 4,
    title: "Synthwave",
    artist: "Retro Future",
    src: "/music/track4.mp3",
    cover: "/music/covers/track4.jpg"
  },
  {
    id: 5,
    title: "Rainy Day",
    artist: "Melancholy",
    src: "/music/track5.mp3",
    cover: "/music/covers/track5.jpg"
  },
  {
    id: 6,
    title: "Morning Coffee",
    artist: "Acoustic Feels",
    src: "/music/track6.mp3",
    cover: "/music/covers/track6.jpg"
  }
];

export function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Canvas ref for visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initialize audio on component mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      // Setup audio context for visualizer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;
      
      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
      sourceRef.current = source;
      
      // Start visualizer
      if (canvasRef.current) {
        startVisualizer();
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update audio element when track changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle track change
  const changeTrack = (direction: 'next' | 'prev') => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % tracks.length;
    } else {
      newIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    }
    
    setCurrentTrack(tracks[newIndex]);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  // Handle seeking
  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle track end
  const handleTrackEnd = () => {
    changeTrack('next');
  };

  // Visualizer function
  const startVisualizer = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const width = canvas.width;
    const height = canvas.height;
    
    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      
      analyzer.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        // Use gradient based on frequency
        const hue = i / bufferLength * 360;
        ctx.fillStyle = isPlaying ? `hsl(${hue}, 70%, 60%)` : `rgba(128, 128, 128, 0.5)`;
        
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    renderFrame();
  };

  // Select a specific track
  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    onClose();
  };

  return (
    <Box 
      py={2} 
      px={4} 
      bg={bgColor} 
      borderBottom="1px solid" 
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <HStack spacing={4} flex="1">
          <Box 
            position="relative" 
            width="50px" 
            height="50px" 
            borderRadius="md" 
            overflow="hidden"
            boxShadow="md"
          >
            <Image 
              src={currentTrack.cover || "/placeholder.svg"} 
              alt={currentTrack.title}
              fallbackSrc="/placeholder.svg?height=50&width=50"
              width="100%"
              height="100%"
              objectFit="cover"
            />
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              width="100%" 
              height="100%" 
              bg="blackAlpha.300"
              display={isPlaying ? "none" : "flex"}
              alignItems="center"
              justifyContent="center"
            >
              <BsFillPlayFill size={24} color="white" />
            </Box>
          </Box>
          
          <VStack spacing={0} alignItems="flex-start" width="150px">
            <Text fontWeight="bold" fontSize="sm" noOfLines={1} color={textColor}>
              {currentTrack.title}
            </Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {currentTrack.artist}
            </Text>
          </VStack>
        </HStack>
        
        <HStack spacing={4} flex="2" justifyContent="center">
          <IconButton
            aria-label="Previous track"
            icon={<BsSkipBackwardFill />}
            size="sm"
            variant="ghost"
            onClick={() => changeTrack('prev')}
          />
          
          <IconButton
            aria-label={isPlaying ? "Pause" : "Play"}
            icon={isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
            size="md"
            colorScheme="purple"
            isRound
            onClick={togglePlay}
          />
          
          <IconButton
            aria-label="Next track"
            icon={<BsSkipForwardFill />}
            size="sm"
            variant="ghost"
            onClick={() => changeTrack('next')}
          />
        </HStack>
        
        <HStack spacing={4} flex="3" justifyContent="flex-end">
          <Text fontSize="xs" color="gray.500" width="40px" textAlign="right">
            {formatTime(currentTime)}
          </Text>
          
          <Box flex="1" maxWidth="200px">
            <Slider
              aria-label="track-progress"
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleSeek}
              colorScheme="purple"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={3} />
            </Slider>
          </Box>
          
          <Text fontSize="xs" color="gray.500" width="40px">
            {formatTime(duration)}
          </Text>
          
          <HStack spacing={2} width="100px">
            <IconButton
              aria-label={isMuted ? "Unmute" : "Mute"}
              icon={isMuted ? <BsVolumeMute /> : <BsVolumeUp />}
              size="sm"
              variant="ghost"
              onClick={toggleMute}
            />
            
            <Slider
              aria-label="volume"
              value={isMuted ? 0 : volume}
              min={0}
              max={1}
              step={0.01}
              onChange={handleVolumeChange}
              colorScheme="purple"
              width="60px"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={2} />
            </Slider>
          </HStack>
          
          <Tooltip label="Playlist">
            <IconButton
              aria-label="Playlist"
              icon={<BsMusicNoteList />}
              size="sm"
              variant="ghost"
              onClick={onOpen}
            />
          </Tooltip>
        </HStack>
      </Flex>
      
      <Box mt={2} height="30px">
        <canvas 
          ref={canvasRef} 
          width="1200" 
          height="30" 
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
      
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadedMetadata={handleTimeUpdate}
      />
      
      {/* Playlist drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Music Playlist
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={2} align="stretch">
              {tracks.map((track) => (
                <Box 
                  key={track.id}
                  p={2}
                  borderRadius="md"
                  bg={track.id === currentTrack.id ? 'purple.100' : 'transparent'}
                  _hover={{ bg: 'gray.100' }}
                  cursor="pointer"
                  onClick={() => selectTrack(track)}
                >
                  <HStack>
                    <Box position="relative" width="40px" height="40px" borderRadius="md" overflow="hidden">
                      <Image 
                        src={track.cover || "/placeholder.svg"} 
                        alt={track.title}
                        fallbackSrc="/placeholder.svg?height=40&width=40"
                      />
                      {track.id === currentTrack.id && isPlaying && (
                        <Box 
                          position="absolute" 
                          top="0" 
                          left="0" 
                          width="100%" 
                          height="100%" 
                          bg="blackAlpha.300"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Badge colorScheme="purple">Playing</Badge>
                        </Box>
                      )}
                    </Box>
                    <VStack spacing={0} alignItems="flex-start">
                      <Text fontWeight="medium" fontSize="sm">{track.title}</Text>
                      <Text fontSize="xs" color="gray.500">{track.artist}</Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
