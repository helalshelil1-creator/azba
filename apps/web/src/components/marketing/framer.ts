'use client'

// Re-export animation utilities from a single place.
// Using CSS transitions + IntersectionObserver to avoid extra bundle weight,
// with framer-motion available if installed.
export { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
