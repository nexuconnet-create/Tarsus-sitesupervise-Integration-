/* -------------------------------- Projects -------------------------------- */

import Image from "next/image";
import { SOLID, CTA_BUTTON } from "@/constants";

export default function Projects() {
  return (
    <section id="resources" className="relative bg-[#021422] text-white py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row gap-12 items-center">
        <div className="flex justify-center lg:justify-start">
          <Image
            src="/images/iPhone_in_Hand.png"
            alt="laptop"
            width={700}
            height={500}
            className="mx-auto"
          />
        </div>

        <div>
          <h3 className="text-5xl sm:text-3xl font-extrabold mb-4 text-center md:text-left">
            <i> Your Projects at a Glance</i>
          </h3>
          <p className="text-slate-300 max-w-md mb-6 text-center md:text-left">
            Get a complete visual overview of your construction sites, project
            timelines, and workforce data. Stay ahead with live reports and
            alerts that help you make informed decisions every day.
          </p>

           <div className="mt-6 w-full md:justify-start flex justify-center items-center ">
                    <button className={`${CTA_BUTTON} ${SOLID} py-4 px-4`}>
                     Request a Demo
                    </button>
          </div>

        </div>
      </div>
    </section>
  );
}
