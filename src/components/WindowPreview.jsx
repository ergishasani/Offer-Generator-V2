// src/components/WindowPreview.jsx
import React from 'react'
// Import the SVG file as a raw string
import windowSvgRaw from '../assets/window.svg?raw'

const MM_TO_PX = 3.78

const WindowPreview = React.forwardRef(({ widthMm, heightMm }, ref) => {
  // compute pixel size
  const w = widthMm * MM_TO_PX
  const h = heightMm * MM_TO_PX

  // inject width/height into the SVG's root element
  // and strip any hard-coded width/height/viewBox so it scales
  const innerSvg = windowSvgRaw
    // remove existing width/height attributes
    .replace(/(width|height)="[^"]*"/g, '')
    // ensure a viewBox exists so it scales responsively
    .replace(
      /<svg([^>]*)>/,
      `<svg$1 width="${w}" height="${h}" preserveAspectRatio="none">`
    )

  return (
    <div
      ref={ref}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        overflow: 'hidden',
        border: '1px solid #ccc',
      }}
      // dangerouslySetInnerHTML inlines the SVG markup directly
      dangerouslySetInnerHTML={{ __html: innerSvg }}
    />
  )
})

export default WindowPreview