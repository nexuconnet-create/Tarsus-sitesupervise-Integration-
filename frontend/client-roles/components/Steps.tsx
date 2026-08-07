/* ---------------------------------- Steps --------------------------------- */
import Image from "next/image";
import { motion } from "framer-motion";
import { SOLID, CTA_BUTTON } from "@/constants";

export default function Steps() {
  const steps = [
    {
      title: "Create an account",
      desc: "Register your company and add your projects.",
      Image:
        "https://res.cloudinary.com/depeqzb6z/image/upload/v1763210697/user_2_lklnai.svg",
    },
    {
      title: "Add your team",
      desc: "Assign roles for managers, engineers, and workers.",
      Image:
        "https://res.cloudinary.com/depeqzb6z/image/upload/v1763210700/group-chat_opjikf.svg",
    },
    {
      title: "Track and monitor",
      desc: "Follow project progress, costs, and site activity in real time.",
      Image:
        "https://res.cloudinary.com/depeqzb6z/image/upload/v1763210696/track_kan7wj.svg",
    },
    {
      title: "Analyze and reports",
      desc: "Generate automated reports and performance summaries.",
      Image:
        "https://res.cloudinary.com/depeqzb6z/image/upload/v1763210697/analyzing_qmkva8.svg",
    },
  ];

  return (
    <section id="solutions" className="bg-slate-50 py-14">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 md:gap-8 lg:gap-15 items-center">
        <div className="hidden md:inline-flex">
          <Image
            src="/images/helmet.png"
            alt="steps"
            width={700}
            height={560}
            className=""
          />
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 text-center md:text-start">
            Simple Steps to Smarter Site Management
          </h3>
          <div className="space-y-4">
            {steps.map((s, idx) => (
              <motion.div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-start text-center sm:text-left items-center gap-4"
                initial={{ opacity: 0, x: 6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20  bg-slate-400 flex items-center justify-center text-slate-900 font-bold">
                  <img src={s.Image} alt="" />
                </div>
                <div className="my-auto">
                  <h4 className="font-semibold text-slate-900 text-lg sm:text-2xl">
                    {s.title}
                  </h4>
                  <p className="text-sm sm:text-md font-medium text-slate-600">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 w-full md:justify-start flex justify-center items-center ">
            <button className={`${CTA_BUTTON} ${SOLID} py-4 px-4`}>
              Start Managing Project Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
