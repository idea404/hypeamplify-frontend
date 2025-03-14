'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

// Shader code
const vertexShader = `
attribute vec3 position;

void main() {
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float xScale;
uniform float yScale;
uniform float distortion;
uniform bool isDarkTheme;

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  
  float d = length(p) * distortion;
  
  float rx = p.x * (1.0 + d);
  float gx = p.x;
  float bx = p.x * (1.0 - d);

  float r, g, b;
  
  if (isDarkTheme) {
    // Original colors for dark theme
    r = 0.025 / abs(p.y + sin((rx + time) * xScale) * yScale);
    g = 0.025 / abs(p.y + sin((gx + time) * xScale) * yScale);
    b = 0.025 / abs(p.y + sin((bx + time) * xScale) * yScale);
  } else {
    // Inverted colors for light theme - dark waves on light background
    r = 1.0 - (0.025 / abs(p.y + sin((rx + time) * xScale) * yScale));
    g = 1.0 - (0.025 / abs(p.y + sin((gx + time) * xScale) * yScale));
    b = 1.0 - (0.025 / abs(p.y + sin((bx + time) * xScale) * yScale));
    
    // Make it more subtle for light theme
    r = mix(1.0, r, 0.7);
    g = mix(1.0, g, 0.7);
    b = mix(1.0, b, 0.7);
  }
  
  gl_FragColor = vec4(r, g, b, 1.0);
}
`

export function WebGLBackground() {
  const { resolvedTheme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene>(null as unknown as THREE.Scene)
  const cameraRef = useRef<THREE.OrthographicCamera>(null as unknown as THREE.OrthographicCamera)
  const rendererRef = useRef<THREE.WebGLRenderer>(null as unknown as THREE.WebGLRenderer)
  const materialRef = useRef<THREE.RawShaderMaterial>(null as unknown as THREE.RawShaderMaterial)
  const uniformsRef = useRef({
    resolution: { value: new THREE.Vector2(1, 1) },
    time: { value: 0.0 },
    xScale: { value: 1.0 },
    yScale: { value: 0.5 },
    distortion: { value: 0.050 },
    isDarkTheme: { value: true }
  })

  // Update theme in shader
  useEffect(() => {
    if (materialRef.current) {
      uniformsRef.current.isDarkTheme.value = resolvedTheme === 'dark';
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (!canvasRef.current) return

    // Set up scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Set up camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)
    cameraRef.current = camera

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    rendererRef.current = renderer

    // Set initial theme value
    uniformsRef.current.isDarkTheme.value = resolvedTheme === 'dark'

    // Update uniforms with correct resolution
    uniformsRef.current.resolution.value = new THREE.Vector2(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    )

    // Create mesh with shaders
    const positions = new THREE.BufferAttribute(
      new Float32Array([
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0
      ]), 
      3
    )

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', positions)

    // Use RawShaderMaterial instead of ShaderMaterial
    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      side: THREE.DoubleSide
    })
    
    materialRef.current = material

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Handle resize
    const handleResize = () => {
      if (!rendererRef.current) return
      
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      uniformsRef.current.resolution.value = new THREE.Vector2(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      )
    }

    window.addEventListener('resize', handleResize)

    // Animation loop
    const animate = () => {
      uniformsRef.current.time.value += 0.01
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
      
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      
      if (geometry) geometry.dispose()
      if (material) material.dispose()
      if (rendererRef.current) rendererRef.current.dispose()
    }
  }, [resolvedTheme])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  )
}