/* --------------------------------- Contact -------------------------------- */

import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="relative -mt-40 z-10">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-slate-900 text-white overflow-hidden flex flex-col md:flex-row">
          <div className="p-16 flex-1">
            <h4 className="text-4xl  sm:text-5xl font-bold">Contact Us</h4>
            <p className="text-slate-300 mt-2">Start building smarter today.</p>

            <form
              className="mt-6 space-y-8"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="sr-only">Name</label>
                <input
                  placeholder="Name"
                  className="w-full border-b-2 outline-none  border-slate-100 bg-transparent px-3 py-4 text-white text-xl"
                />
              </div>

              <div>
                <label className="sr-only">Email</label>
                <input
                  placeholder="Email"
                  className="w-full border-b-2 outline-none  border-slate-100 bg-transparent px-3 py-4 text-white text-xl"
                />
              </div>

              <div>
                <label className="sr-only">Message</label>
                <input
                  placeholder="Message"
                  className="w-full border-b-2 outline-none  border-slate-100 bg-transparent px-3 py-4 text-white text-xl"
                />
              </div>

              <div>
                <button className={` py-4 bg-[#021422] w-full text-center `}>
                  Send Us a Message
                </button>
              </div>
            </form>
          </div>
          <div
            className="flex-1 flex justify-center items-center w-full relative"
            style={{
              backgroundImage: "url(/images/Rectangle 26.svg)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute right-0 top-0 w-35 h-full bg-[#D9D9D9] hidden md:block"></div>
            <div className="absolute bottom-0 left-0 w-full h-20 bg-[#D9D9D9] md:hidden"></div>
            <div className="p-8 border-l md:border-l border-slate-800 h-80 w-4/5 md:w-full bg-[#021422] z-20 mx-auto md:ml-0">
              {/* Small rectangle on right side */}
              <div className="mb-8">
                <h5 className="font-semibold text-xl">Info</h5>
              </div>

              <div className="flex items-center gap-3 text-white mb-6">
                <Mail className="w-7 h-7 text-white" />
                <span>info@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-white mb-6">
                <Phone className="w-7 h-7 text-white" />
                <span>+234 0000 000</span>
              </div>

              <div className="flex items-start gap-3 text-white">
                <MapPin className="w-7 h-7 text-white" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
