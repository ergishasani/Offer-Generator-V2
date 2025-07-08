// src/components/WindowPreview.jsx
import React from 'react'
import WindowSvg from '../assets/window.svg'   // make sure this path matches
const MM_TO_PX = 3.78                         // ~96 DPI

const WindowPreview = React.forwardRef(({ widthMm, heightMm }, ref) => {
  const w = widthMm * MM_TO_PX
  const h = heightMm * MM_TO_PX

  return (
    <div
      ref={ref}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        border: '1px solid #ccc',
        overflow: 'hidden',
      }}
    >
      <WindowSvg width={w} height={h} />
    </div>
  )
})

export default WindowPreview
