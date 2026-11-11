import { motion, type HTMLMotionProps } from "framer-motion";

// NOTE: any filter left on an ancestor stops glass panels inside from blurring the
// page backdrop, so the blur is cleared to "none" when the reveal finishes.
const variants = {
  hidden: { opacity: 0, y: 48, scale: 0.97, filter: "blur(14px)" },
  shown: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } },
};

/** Blur-and-rise reveal when the block scrolls into view. */
export function Reveal({ delay = 0, children, ...rest }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
