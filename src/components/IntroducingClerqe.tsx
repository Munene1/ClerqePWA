import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

export default function IntroducingClerqe() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh bg-white dark:bg-black">
      <div className="mx-auto w-full max-w-3xl px-0 sm:px-5">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-gray-800 dark:bg-black/95 sm:relative sm:mb-10 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none dark:sm:bg-transparent pt-[var(--sat,0px)] sm:pt-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="grid h-8 w-8 place-items-center rounded-[6px] bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Icon name="arrow_back" className="text-sm" />
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Back</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] dark:text-[var(--brand-primary)] dark:hover:text-[var(--brand-primary-hover)]"
          >
            Sign in
          </button>
        </div>

        <article className="px-4 pb-16 pt-8 sm:px-0 sm:pt-0">
          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-50 sm:text-5xl sm:leading-tight">
            Introducing Clerqe
          </h1>

          {/* Metadata */}
          <div className="mt-6 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span>June 2026</span>
            <span className="h-3 w-px bg-gray-300 dark:bg-gray-700" />
            <span>5 min read</span>
            <span className="h-3 w-px bg-gray-300 dark:bg-gray-700" />
            <span>Clerqe Team</span>
          </div>

          {/* NVIDIA banner */}
          <div className="mt-8 -mx-4 bg-gray-50 px-5 py-5 sm:-mx-0 sm:rounded-[8px] dark:bg-gray-900/50">
            <div className="flex flex-col items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <span>We are powered by</span>
              <img src="/nvidia-inception-logo-dark-text-transparentbg.png" alt="NVIDIA" className="w-4/5 block dark:hidden" />
              <img src="/NVIDIA_Inception_dark-bg-white-text.jpg" alt="NVIDIA" className="w-4/5 hidden dark:block" />
            </div>
          </div>

          <div className="mt-8 space-y-6 text-[15px] leading-7 text-gray-600 dark:text-gray-300">
            <p>
              For most of us, the hardest part about money is not always the money itself, but the{" "}
              <strong className="font-semibold text-gray-900 dark:text-gray-100">systems and procedures</strong> wrapped around it.
            </p>

            <p className="text-base italic text-gray-700 dark:text-gray-200">
              Everyone knows <em className="not-italic font-semibold text-gray-900 dark:text-gray-100">exactly</em> what they want to do with their money
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li className="text-[15px] leading-7 text-gray-600 dark:text-gray-300">Pay someone</li>
              <li className="text-[15px] leading-7 text-gray-600 dark:text-gray-300">Lipa a bill</li>
              <li className="text-[15px] leading-7 text-gray-600 dark:text-gray-300">Save towards a goal</li>
              <li className="text-[15px] leading-7 text-gray-600 dark:text-gray-300">Dispute a transaction</li>
              <li className="text-[15px] leading-7 text-gray-600 dark:text-gray-300">Understand spending habits</li>
            </ul>

            <p>
              The intent is clear. What is not always clear is <em className="italic text-gray-900 dark:text-gray-100">the process</em>. That gap, between knowing what you want and navigating how to get it done, is where most people get stuck.
            </p>

            <div className="bg-gray-50 px-4 py-5 dark:bg-gray-900/50">
              <p className="text-base leading-7 text-gray-700 dark:text-gray-200">
                We have come a long way. Apps, mobile money, digital banking, call centers, and branch networks have made financial services more available than ever. Now the next step is bringing them closer to our most natural interface{" "}
                <strong className="font-semibold text-gray-900 dark:text-gray-100">language</strong>.
              </p>
            </div>

            <p>
              Instead of waiting, figuring it out, queuing, and wrestling through apps, bank lobbies, and USSD menus, we can simply <em className="italic">say what we want</em> and get the result immediately. This is the world we live in today.
            </p>

            <p>
              I am genuinely excited to share what we have been building around this for the last quarter{" "}
              <strong className="font-semibold text-gray-900 dark:text-gray-100">Clerqe</strong>.
            </p>

            <div className="rounded-[8px] border-l-4 border-[var(--brand-primary)] bg-gray-50 px-4 py-3 dark:bg-gray-900/50 dark:border-[var(--brand-primary)]">
              <p className="text-[15px] leading-7 text-gray-700 dark:text-gray-200">
                <strong className="font-semibold">Clerqe lets people complete money workflows through language.</strong>{" "}
                You say what you need in the language you would naturally use, and Clerqe gets it done. The queues, support tickets, USSDs, and menus, all gone.
              </p>
            </div>

            {/* Why language matters */}
            <h2 className="!mt-10 flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl">
              <span className="h-0.5 w-6 rounded-full bg-[var(--brand-primary)]" />
              Why language matters
            </h2>

            <div className="bg-green-50 px-4 py-4 dark:bg-green-950/30">
              <p className="text-[15px] leading-7 text-gray-700 dark:text-gray-200">
                Language is the most natural way we have ever developed to express ourselves. We do not think in app menus, procedures, dropdowns, forms, or account hierarchies.{" "}
                <strong className="font-semibold text-gray-900 dark:text-gray-100">We think in outcomes.</strong>
              </p>
            </div>

            <ol className="list-decimal space-y-2 pl-6">
              <li className="pl-1 text-[15px] leading-7 text-gray-600 dark:text-gray-300">&ldquo;Pay my employees.&rdquo;</li>
              <li className="pl-1 text-[15px] leading-7 text-gray-600 dark:text-gray-300">&ldquo;Settle this bill by tomorrow.&rdquo;</li>
              <li className="pl-1 text-[15px] leading-7 text-gray-600 dark:text-gray-300">&ldquo;What did I spend my money on last week?&rdquo;</li>
              <li className="pl-1 text-[15px] leading-7 text-gray-600 dark:text-gray-300">&ldquo;How is my financial health?&rdquo;</li>
            </ol>

            <p>
              Digital systems, as great as they have made our financial lives, still force us to translate these needs into <em className="italic">their</em> structure. We have to know which app to open, which web page to visit, which process to follow, which documents to submit, which emails to send, and then <strong className="font-semibold text-gray-900 dark:text-gray-100">wait</strong>.
            </p>

            <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
              <p className="text-[15px] leading-7 text-amber-800 dark:text-amber-300">
                <strong className="font-semibold">Financial access goes beyond having an account, or a phone.</strong>
              </p>
              <p className="mt-2 text-[15px] leading-7 text-amber-800 dark:text-amber-300">
                We believe that access also means being able to use financial services with confidence, in your own way, with your own language.
              </p>
            </div>

            <p>
              A system that can meet people in English, Swahili, Sheng, or the everyday language they already use around money makes financial services more usable beyond mere availability.
            </p>



            {/* For financial institutions */}
            <div className="!mt-10 border-t border-gray-200 pt-8 dark:border-gray-800" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl">
              For financial institutions
            </h2>

            <p>
              Banks, fintechs, SACCOs, NGOs, and employers already have the infrastructure that moves money. The ledger, rules, approvals, compliance, limits, and risk controls remain where they are.
            </p>

            <p>
              What changes now is <em className="italic">the layer between people and those systems</em>.
            </p>

            <p>
              Requests that would normally require a call, a branch visit, a long form, or several app steps can become guided self service.
            </p>

            <p>
              Support teams can focus on issues that genuinely need human judgment. Institutions can see what people are trying to do, where they get stuck, and which workflows create the most demand.
            </p>

            <p className="font-semibold text-gray-900 dark:text-gray-100">
              This is what we are building Clerqe around.
            </p>

            {/* Money is trust */}
            <div className="!mt-10 border-t border-gray-200 pt-8 dark:border-gray-800" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl">
              Money is trust
            </h2>

            <p>
              Financial execution must be controlled. There is no doubt about that. Every workflow needs the right checks like confirmation, authentication, permissions, audit records, limits, escalation, and human handover where necessary.
            </p>

            <div className="rounded-[8px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black/50">
              <ul className="space-y-2 text-[15px] leading-7 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-600" />
                  <span>If something needs <strong className="font-semibold text-gray-900 dark:text-gray-100">approval</strong>, it should be approved.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-600" />
                  <span>If a request is <strong className="font-semibold text-gray-900 dark:text-gray-100">unclear</strong>, the system should ask.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-600" />
                  <span>If a process needs a <strong className="font-semibold text-gray-900 dark:text-gray-100">human</strong>, it should hand over.</span>
                </li>
              </ul>
            </div>

            <p>
              The goal is not to make finance casual. It is to make it easier to use without weakening the controls that make it safe.
            </p>

            {/* Clerqe is here */}
            <div className="!mt-10 border-t border-gray-200 pt-8 dark:border-gray-800" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl">
              Clerqe is here. Try it out.
            </h2>

            <p>
              Clerqe is live as a sandbox.
            </p>

            <p>
              Go to{" "}
              <a
                href="https://clerqe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--brand-primary)] underline underline-offset-2 hover:text-[var(--brand-primary-hover)]"
              >
                clerqe.com
              </a>{" "}
              and sign up with an email you can access to try it out. No real money moves yet, no live account is connected, and nothing executes against a financial institution yet.
            </p>

            <p>
              This is a safe, phased way for users, partners, banks, and investors to experience the workflow before live integration.
            </p>

            {/* The bigger picture */}
            <div className="!mt-10 border-t border-gray-200 pt-8 dark:border-gray-800" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl">
              The bigger picture
            </h2>

            <p>
              Financial access should include the ability for everyone to move money, understand it, get support when needed, and maintain clear visibility over money without needing a translator or long call holds over dead call center lines.
            </p>

            <p>
              <strong className="font-semibold text-gray-900 dark:text-gray-100">That</strong> is what people need.
            </p>

            <p>
              <strong className="font-semibold text-gray-900 dark:text-gray-100">That</strong> is what institutions need to deliver better.
            </p>

            <p>
              Clerqe uses language to bring those two sides closer together.
            </p>

            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              You say what you need and get it done as you watch.
            </p>

            {/* CTA */}
            <div className="!mt-10 rounded-[12px] border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50 sm:p-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-50">Experience Clerqe</h2>
              <p className="mb-6 text-[15px] leading-7 text-gray-600 dark:text-gray-300">
                Clerqe is now live as a sandbox. Create an account, interact with the agent, and experience conversational banking workflows in a safe, controlled environment.
              </p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-[3px] bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-95 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Get started
                <Icon name="arrow_upward" className="rotate-45 text-base" />
              </button>
            </div>
          </div>
        </article>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500 sm:px-0">
          {'\u00A9'} {new Date().getFullYear()} Clerqe. All rights reserved.
        </div>
      </div>
    </div>
  );
}
