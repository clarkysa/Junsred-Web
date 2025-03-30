"use client"

import {
  Box,
  Flex,
  Text,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  VStack,
  useColorModeValue,
  Image,
  Badge,
  Tooltip,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
} from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  BsFillPlayFill,
  BsFillPauseFill,
  BsVolumeUp,
  BsVolumeMute,
  BsSkipBackwardFill,
  BsSkipForwardFill,
  BsMusicNoteList,
} from "react-icons/bs"

// Define the track interface
interface Track {
  id: number
  title: string
  artist: string
  src: string
  cover: string
}

// Sample tracks - replace with your actual tracks
const tracks: Track[] = [
  {
    id: 1,
    title: "稲葉曇余裕欲Vo. nagiβ & カゼヒキβ",
    artist: "稲葉曇",
    src: "/music/稲葉曇余裕欲Vo. nagiβ & カゼヒキβ.mp3",
    cover: "/music/covers/track1.jpg",
  },
  {
    id: 2,
    title: "Coding Session",
    artist: "Dev Beats",
    src: "/music/track2.mp3",
    cover: "/music/covers/track2.jpg",
  },
  {
    id: 3,
    title: "Late Night",
    artist: "Ambient Dreams",
    src: "/music/track3.mp3",
    cover: "/music/covers/track3.jpg",
  },
  {
    id: 4,
    title: "Synthwave",
    artist: "Retro Future",
    src: "/music/track4.mp3",
    cover: "/music/covers/track4.jpg",
  },
  {
    id: 5,
    title: "Rainy Day",
    artist: "Melancholy",
    src: "/music/track5.mp3",
    cover: "/music/covers/track5.jpg",
  },
  {
    id: 6,
    title: "Morning Coffee",
    artist: "Acoustic Feels",
    src: "/music/track6.mp3",
    cover: "/music/covers/track6.jpg",
  },
]

export function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Semi-transparent background
  const bgColor = useColorModeValue("rgba(255, 255, 255, 0.7)", "rgba(26, 32, 44, 0.7)")
  const accentColor = useColorModeValue("purple.500", "purple.300")
  const textColor = useColorModeValue("gray.800", "white")
  const borderColor = useColorModeValue("rgba(226, 232, 240, 0.5)", "rgba(74, 85, 104, 0.5)")

  const drawerBg = useColorModeValue("white", "gray.900")
  const drawerHeaderBg = useColorModeValue("purple.50", "gray.800")
  const drawerHeaderColor = useColorModeValue("purple.700", "purple.300")
  const drawerBodyBg = useColorModeValue("gray.50", "gray.800")
  const drawerHeaderBorderColor = useColorModeValue("gray.200", "gray.700")
  const selectedTrackBg = useColorModeValue("purple.200", "purple.700")
  const hoverTrackBg = useColorModeValue("purple.50", "gray.700")
  const badgeBg = useColorModeValue("purple.500", "purple.300")
  const selectedTrackBorderColor = useColorModeValue("purple.300", "purple.600")

  // Canvas ref for visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  // Visualizer function
  const startVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyzerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyzer = analyzerRef.current
    const bufferLength = analyzer.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const width = canvas.width
    const height = canvas.height

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame)

      analyzer.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, width, height)

      const barWidth = (width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height

        // Use gradient based on frequency with transparency
        const hue = (i / bufferLength) * 360
        ctx.fillStyle = isPlaying ? `hsla(${hue}, 70%, 60%, 0.7)` : `rgba(128, 128, 128, 0.3)`

        ctx.fillRect(x, height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    renderFrame()
  }, [isPlaying])

  // Initialize audio on component mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume

      // Setup audio context for visualizer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const analyzer = audioContext.createAnalyser()
      analyzer.fftSize = 256
      analyzerRef.current = analyzer

      const source = audioContext.createMediaElementSource(audioRef.current)
      source.connect(analyzer)
      analyzer.connect(audioContext.destination)
      sourceRef.current = source

      // Start visualizer
      if (canvasRef.current) {
        startVisualizer()
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [volume, startVisualizer])

  // Update audio element when track changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }, [currentTrack, isPlaying])

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle track change
  const changeTrack = (direction: "next" | "prev") => {
    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id)
    let newIndex

    if (direction === "next") {
      newIndex = (currentIndex + 1) % tracks.length
    } else {
      newIndex = (currentIndex - 1 + tracks.length) % tracks.length
    }

    setCurrentTrack(tracks[newIndex])
  }

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setVolume(newVolume)
      if (newVolume === 0) {
        setIsMuted(true)
      } else {
        setIsMuted(false)
      }
    }
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    }
  }

  // Handle seeking
  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Handle track end
  const handleTrackEnd = () => {
    changeTrack("next")
  }

  // Select a specific track
  const selectTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    onClose()
  }

  return (
    <Box
      py={1}
      px={3}
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(8px)"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <HStack spacing={2} flex="1">
          <Box position="relative" width="36px" height="36px" borderRadius="md" overflow="hidden" boxShadow="sm">
            <Image
              src={currentTrack.cover || "/placeholder.svg"}
              alt={currentTrack.title}
              fallbackSrc="/placeholder.svg?height=36&width=36"
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
              <BsFillPlayFill size={18} color="white" />
            </Box>
          </Box>

          <VStack spacing={0} alignItems="flex-start" width="120px">
            <Text fontWeight="bold" fontSize="xs" noOfLines={1} color={textColor}>
              {currentTrack.title}
            </Text>
            <Text fontSize="2xs" color="gray.500" noOfLines={1}>
              {currentTrack.artist}
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={2} flex="1" justifyContent="center">
          <IconButton
            aria-label="Previous track"
            icon={<BsSkipBackwardFill />}
            size="xs"
            variant="ghost"
            onClick={() => changeTrack("prev")}
          />

          <IconButton
            aria-label={isPlaying ? "Pause" : "Play"}
            icon={isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
            size="sm"
            colorScheme="purple"
            isRound
            onClick={togglePlay}
          />

          <IconButton
            aria-label="Next track"
            icon={<BsSkipForwardFill />}
            size="xs"
            variant="ghost"
            onClick={() => changeTrack("next")}
          />
        </HStack>

        <HStack spacing={2} flex="2" justifyContent="flex-end">
          <Text fontSize="2xs" color="gray.500" width="30px" textAlign="right">
            {formatTime(currentTime)}
          </Text>

          <Box flex="1" maxWidth="150px">
            <Slider
              aria-label="track-progress"
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleSeek}
              colorScheme="purple"
              size="sm"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={2} />
            </Slider>
          </Box>

          <Text fontSize="2xs" color="gray.500" width="30px">
            {formatTime(duration)}
          </Text>

          <HStack spacing={1} width="80px">
            <IconButton
              aria-label={isMuted ? "Unmute" : "Mute"}
              icon={isMuted ? <BsVolumeMute /> : <BsVolumeUp />}
              size="xs"
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
              width="50px"
              size="sm"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={1.5} />
            </Slider>
          </HStack>

          <Tooltip label="Playlist">
            <IconButton aria-label="Playlist" icon={<BsMusicNoteList />} size="xs" variant="ghost" onClick={onOpen} />
          </Tooltip>
        </HStack>
      </Flex>

      <Box mt={1} height="20px">
        <canvas ref={canvasRef} width="1200" height="20" style={{ width: "100%", height: "100%" }} />
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
        <DrawerContent bg={drawerBg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={drawerHeaderBorderColor} bg={drawerHeaderBg}>
            <Text color={drawerHeaderColor}>Music Playlist</Text>
          </DrawerHeader>
          <DrawerBody bg={drawerBodyBg}>
            <VStack spacing={2} align="stretch">
              {tracks.map((track) => (
                <Box
                  key={track.id}
                  p={2}
                  borderRadius="md"
                  bg={track.id === currentTrack.id ? selectedTrackBg : "transparent"}
                  _hover={{ bg: hoverTrackBg }}
                  border="1px solid"
                  borderColor={track.id === currentTrack.id ? selectedTrackBorderColor : "transparent"}
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
                          <Badge colorScheme="purple" bg={badgeBg} color="white">
                            Playing
                          </Badge>
                        </Box>
                      )}
                    </Box>
                    <VStack spacing={0} alignItems="flex-start">
                      <Text fontWeight="medium" fontSize="sm">
                        {track.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {track.artist}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

