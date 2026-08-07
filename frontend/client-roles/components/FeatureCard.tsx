import { motion } from "framer-motion";
/* ------------------------------ Feature Card ------------------------------- */

export default function FeatureCard({
  image,
  title,
  desc,
}: {
  image: string;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      className="p-6 bg-white"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex flex-col items-center md:items-start gap-6">
        <img src={image} alt="" />
        <div className="text-center md:text-left">
          <h4 className="font-semibold md:text-lg text-sm text-slate-900">
            {title}
          </h4>
          <p className="md:text-md text-sm text-slate-600 mt-2">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}