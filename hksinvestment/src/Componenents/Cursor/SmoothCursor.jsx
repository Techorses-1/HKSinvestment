// import { useEffect, useRef, useState } from "react"
// import { motion, useSpring } from "framer-motion"

// const DefaultCursorSVG = () => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width={50}
//       height={54}
//       viewBox="0 0 50 54"
//       fill="none"
//       style={{ scale: 0.5 }}
//     >
//       <g filter="url(#filter0_d)">
//         <path
//           d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
//           fill="black"
//         />
//         <path
//           d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
//           stroke="white"
//           strokeWidth={2.25}
//         />
//       </g>
//       <defs>
//         <filter id="filter0_d" x="0" y="0" width="50" height="54">
//           <feOffset dy="2" />
//           <feGaussianBlur stdDeviation="2" />
//           <feBlend in="SourceGraphic" />
//         </filter>
//       </defs>
//     </svg>
//   )
// }

// export default function SmoothCursor({ cursor = <DefaultCursorSVG /> }) {
//   // ❌ Disable completely on mobile / touch devices
//   if (
//     typeof window !== "undefined" &&
//     (window.innerWidth < 768 || "ontouchstart" in window)
//   ) {
//     return null
//   }

//   const [hideCursor, setHideCursor] = useState(false)

//   const lastMousePos = useRef({ x: 0, y: 0 })
//   const velocity = useRef({ x: 0, y: 0 })
//   const lastUpdateTime = useRef(Date.now())
//   const previousAngle = useRef(0)
//   const accumulatedRotation = useRef(0)

//   const cursorX = useSpring(0, { damping: 45, stiffness: 400 })
//   const cursorY = useSpring(0, { damping: 45, stiffness: 400 })
//   const rotation = useSpring(0, { damping: 60, stiffness: 300 })
//   const scale = useSpring(1, { damping: 35, stiffness: 500 })

//   useEffect(() => {
//     const updateVelocity = (pos) => {
//       const now = Date.now()
//       const delta = now - lastUpdateTime.current

//       if (delta > 0) {
//         velocity.current = {
//           x: (pos.x - lastMousePos.current.x) / delta,
//           y: (pos.y - lastMousePos.current.y) / delta,
//         }
//       }

//       lastUpdateTime.current = now
//       lastMousePos.current = pos
//     }

//     const onMove = (e) => {
//       const pos = { x: e.clientX, y: e.clientY }
//       updateVelocity(pos)

//       const speed = Math.hypot(velocity.current.x, velocity.current.y)

//       cursorX.set(pos.x)
//       cursorY.set(pos.y)

//       if (speed > 0.1) {
//         const angle =
//           (Math.atan2(velocity.current.y, velocity.current.x) * 180) /
//             Math.PI +
//           90

//         let diff = angle - previousAngle.current
//         if (diff > 180) diff -= 360
//         if (diff < -180) diff += 360

//         accumulatedRotation.current += diff
//         rotation.set(accumulatedRotation.current)
//         previousAngle.current = angle

//         scale.set(0.95)
//         setTimeout(() => scale.set(1), 150)
//       }
//     }

//     const handlePointerEnter = (e) => {
//       if (
//         e.target.closest(
//           "a, button, input, textarea, select, [role='button'], .cursor-pointer"
//         )
//       ) {
//         setHideCursor(true)
//         document.body.style.cursor = "pointer"
//       }
//     }

//     const handlePointerLeave = () => {
//       setHideCursor(false)
//       document.body.style.cursor = "none"
//     }

//     document.body.style.cursor = "none"
//     window.addEventListener("mousemove", onMove)
//     document.addEventListener("mouseover", handlePointerEnter)
//     document.addEventListener("mouseout", handlePointerLeave)

//     return () => {
//       window.removeEventListener("mousemove", onMove)
//       document.removeEventListener("mouseover", handlePointerEnter)
//       document.removeEventListener("mouseout", handlePointerLeave)
//       document.body.style.cursor = "auto"
//     }
//   }, [])

//   return (
//     !hideCursor && (
//       <motion.div
//         style={{
//           position: "fixed",
//           left: cursorX,
//           top: cursorY,
//           translateX: "-50%",
//           translateY: "-50%",
//           rotate: rotation,
//           scale,
//           zIndex: 9999,
//           pointerEvents: "none",
//         }}
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//       >
//         {cursor}
//       </motion.div>
//     )
//   )
// }








import { useEffect, useRef, useState } from "react"
import { motion, useSpring } from "framer-motion"
import { createPortal } from "react-dom"

const DefaultCursorSVG = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={50}
            height={54}
            viewBox="0 0 50 54"
            fill="none"
            style={{ scale: 0.5 }}
        >
            <g filter="url(#filter0_d)">
                <path
                    d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
                    fill="black"
                />
                <path
                    d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
                    stroke="white"
                    strokeWidth={2.25}
                />
            </g>
            <defs>
                <filter id="filter0_d" x="0" y="0" width="50" height="54">
                    <feOffset dy="2" />
                    <feGaussianBlur stdDeviation="2" />
                    <feBlend in="SourceGraphic" />
                </filter>
            </defs>
        </svg>
    )
}

export default function SmoothCursor({ cursor = <DefaultCursorSVG /> }) {
    // ❌ Disable on mobile / touch
    if (
        typeof window !== "undefined" &&
        (window.innerWidth < 768 || "ontouchstart" in window)
    ) {
        return null
    }

    const [isPointer, setIsPointer] = useState(false)

    const lastMousePos = useRef({ x: 0, y: 0 })
    const velocity = useRef({ x: 0, y: 0 })
    const lastUpdateTime = useRef(Date.now())
    const previousAngle = useRef(0)
    const accumulatedRotation = useRef(0)

    const cursorX = useSpring(0, { damping: 45, stiffness: 400 })
    const cursorY = useSpring(0, { damping: 45, stiffness: 400 })
    const rotation = useSpring(0, { damping: 60, stiffness: 300 })

    // 👇 scale reacts to pointer state
    const scale = useSpring(1, {
        damping: isPointer ? 25 : 35,
        stiffness: isPointer ? 600 : 500,
    })

    useEffect(() => {
        const updateVelocity = (pos) => {
            const now = Date.now()
            const delta = now - lastUpdateTime.current

            if (delta > 0) {
                velocity.current = {
                    x: (pos.x - lastMousePos.current.x) / delta,
                    y: (pos.y - lastMousePos.current.y) / delta,
                }
            }

            lastUpdateTime.current = now
            lastMousePos.current = pos
        }

        const onMove = (e) => {
            const pos = { x: e.clientX, y: e.clientY }
            updateVelocity(pos)

            const speed = Math.hypot(velocity.current.x, velocity.current.y)

            cursorX.set(pos.x)
            cursorY.set(pos.y)

            if (speed > 0.1) {
                const angle =
                    (Math.atan2(velocity.current.y, velocity.current.x) * 180) /
                    Math.PI +
                    90

                let diff = angle - previousAngle.current
                if (diff > 180) diff -= 360
                if (diff < -180) diff += 360

                accumulatedRotation.current += diff
                rotation.set(accumulatedRotation.current)
                previousAngle.current = angle
            }
        }

        const handleHoverCheck = (e) => {
            if (
                e.target.closest(
                    "a, button, input, textarea, select, [role='button'], .cursor-pointer"
                )
            ) {
                setIsPointer(true)
                scale.set(1.15) // 👈 pointer emphasis
            } else {
                setIsPointer(false)
                scale.set(1)
            }
        }

        document.body.style.cursor = "none"
        window.addEventListener("mousemove", onMove)
        document.addEventListener("mouseover", handleHoverCheck)

        return () => {
            window.removeEventListener("mousemove", onMove)
            document.removeEventListener("mouseover", handleHoverCheck)
            document.body.style.cursor = "auto"
        }
    }, [isPointer])

    return createPortal(
        <motion.div
            style={{
                position: "fixed",
                left: cursorX,
                top: cursorY,
                translateX: "-50%",
                translateY: "-50%",
                rotate: rotation,
                scale,
                zIndex: 2147483647, // absolute top
                pointerEvents: "none",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
        >
            {cursor}
        </motion.div>,
        document.body
    )
}