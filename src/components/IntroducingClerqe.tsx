import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

export default function IntroducingClerqe() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-dvh overflow-y-auto bg-[linear-gradient(180deg,_#ffffff_0%,_#eef5f5_20%,_#c6dddd_48%,_#6e9fa1_74%,_#1c666c_90%,_#0f5258_100%)] dark:bg-[linear-gradient(180deg,_#020907_0%,_#051412_34%,_#0a211e_68%,_#102f2b_100%)]">
      <div className="pointer-events-none fixed right-[-4rem] top-[-2rem] h-96 w-96 rounded-full bg-[#77b3b3]/16 blur-3xl dark:bg-[#3a6763]/12" />
      <div className="pointer-events-none fixed bottom-[-5rem] left-[18%] h-80 w-80 rounded-full bg-white/22 blur-3xl dark:bg-[#0f2a27]/18" />
      <div className="relative mx-auto max-w-3xl px-5 py-12 sm:py-20">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand-primary)] text-white">
              <Icon name="forum" className="text-sm" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Clerqe</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Sign in
          </button>
        </div>

        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Introducing</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-50 sm:text-4xl sm:leading-tight">
            Clerqe: Banking You Can Talk To
          </h1>
        </div>

        {/* Body */}
        <div className="space-y-6 rounded-[12px] border border-black/6 bg-white/10 p-6 text-base leading-7 text-slate-700 backdrop-blur-[2px] dark:border-white/8 dark:bg-white/[0.03] dark:text-slate-300 sm:p-8">
          <p>Banking should not feel like a maze.</p>

          <p>
            For millions of people across Africa, the problem is not that they do not understand money. They do. They send
            money, receive money, pay rent, buy food, pay school fees, buy airtime, settle bills, support family, run
            small businesses, and manage daily financial pressure with discipline and creativity.
          </p>

          <p>
            The problem is that the banking experience often asks them to behave like systems.
          </p>

          <p>
            It asks them to find the right menu, open the right app, follow the right sequence, understand the right terms,
            speak the right language, wait for the right support agent, or visit the right branch.
          </p>

          <p>
            But people do not think in menus.
          </p>

          <p>They think in intent.</p>

          <p>A customer knows exactly what they want to ask:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>"Did I buy something at Naivas last week?"</li>
            <li>"How much money do I have left?"</li>
            <li>"When did rent go out?"</li>
            <li>"Send me my mini statement."</li>
            <li>"How much have I spent on fuel this month?"</li>
            <li>"Help me send money."</li>
          </ul>

          <p>That is where Clerqe begins.</p>

          <p>
            Clerqe is a conversational banking agent built to make financial services accessible through the simplest
            interface humans have ever had: language.
          </p>

          <p>
            It allows customers to interact with banking through natural conversation, starting with chat and expanding
            toward speech. A customer should be able to ask, type, or eventually speak what they need, and Clerqe should
            understand the request, guide the workflow, and help get it done safely.
          </p>

          <p>This is the access layer we believe African banking needs next.</p>

          {/* Why Clerqe, Why Now */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">Why Clerqe, Why Now</h2>

          <p>
            Africa has already proved that digital finance can scale.
          </p>

          <p>
            Kenya has 48.6 million mobile money subscriptions and 92.8% mobile money penetration. M-PESA processed KES
            40.2 trillion in transaction value in 2024. This is not a market waiting to be convinced that money can move
            digitally. That decision has already been made by the people.
          </p>

          <p>
            The deeper question now is whether formal financial services are easy enough to use.
          </p>

          <p>
            In Kenya, mobile money reaches 23.2 million adult users, while banks reach 14.8 million. That means millions
            of people are already digitally financial, but many are still underserved by formal banking experiences. The
            gap is no longer only infrastructure. It is experience, language, confidence, and access.
          </p>

          <p>And access cannot be solved by apps alone.</p>

          <p>
            Today, 59.5% of connected devices in Kenya are smartphones, but 40.5% are still not smartphones. That matters.
            It means the future of financial access cannot depend only on beautiful app screens. It must also work through
            chat, SMS, voice, and the languages people actually use.
          </p>

          <p>Clerqe is built for that world.</p>

          {/* What Clerqe Is */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">What Clerqe Is</h2>

          <p>
            Clerqe is a banking agent that helps customers manage financial workflows through conversation.
          </p>

          <p>It is built to help customers:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>check balances;</li>
            <li>search transactions;</li>
            <li>understand spending;</li>
            <li>request statements;</li>
            <li>start transfers;</li>
            <li>manage payouts;</li>
            <li>raise service requests;</li>
            <li>follow up on account actions;</li>
            <li>receive guided financial support;</li>
            <li>complete routine banking tasks with less friction.</li>
          </ul>

          <p>
            Clerqe is not built merely to answer questions. It is built to help people get things done.
          </p>

          <p>
            A customer does not need to know where a feature is hidden. They do not need to remember the exact steps. They
            do not need to use perfect banking language.
          </p>

          <p>They only need to say what they want.</p>

          <p>Clerqe turns that intent into a guided banking workflow.</p>

          {/* A Better Experience for Customers */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">
            A Better Experience for Customers
          </h2>

          <p>Imagine a young worker in Nairobi.</p>

          <p>
            She receives money through mobile money, pays rent digitally, buys groceries at Naivas, sends money home, pays
            for transport, and tries to keep track of what is left before the month ends.
          </p>

          <p>She is already financially active.</p>

          <p>
            But when she needs a clear view of her spending, a recent transaction, a statement, a payment confirmation, or
            a banking product, the experience becomes harder than it should be.
          </p>

          <p>Clerqe changes that experience.</p>

          <p>
            Instead of forcing her to navigate a system, Clerqe allows her to ask:
          </p>

          <p className="italic text-slate-500 dark:text-slate-400">
            "Did I buy something at Naivas last week?"
          </p>

          <p>
            Clerqe understands the request, checks the relevant transaction history, and returns the answer.
          </p>

          <p>She can ask:</p>

          <p className="italic text-slate-500 dark:text-slate-400">
            "How much did I spend on fuel this month?"
          </p>

          <p>Clerqe turns that into a spending insight.</p>

          <p>She can ask:</p>

          <p className="italic text-slate-500 dark:text-slate-400">"Send me my mini statement."</p>

          <p>Clerqe starts the statement workflow.</p>

          <p>She can ask:</p>

          <p className="italic text-slate-500 dark:text-slate-400">"How much money do I have left?"</p>

          <p>Clerqe gives her a clear account view.</p>

          <p>
            This is what access should feel like: simple, direct, human, and useful.
          </p>

          <p>
            For common banking tasks that often take 4 to 6 navigation steps, Clerqe targets a shift to one conversational
            request. That is a 75% to 83% reduction in interaction complexity for selected workflows.
          </p>

          <p>That is not just convenience. It is access.</p>

          {/* Why This Matters for Banks */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">
            Why This Matters for Banks and Financial Partners
          </h2>

          <p>
            Banks and financial institutions do not need another channel that adds complexity.
          </p>

          <p>
            They need an access layer that makes existing services easier to use, while preserving control, security,
            compliance, and customer protection.
          </p>

          <p>
            Clerqe gives banks and partners a new way to serve customers without replacing their core systems.
          </p>

          <p>
            The bank keeps the regulated rails. The bank keeps the ledger. The bank keeps compliance, approvals, risk
            rules, and control.
          </p>

          <p>Clerqe provides the conversational experience that customers can actually use.</p>

          <p>For banks and partners, this means:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>more customers can access services confidently;</li>
            <li>routine support requests can move into guided self-service;</li>
            <li>branches and call centers can focus on higher-value issues;</li>
            <li>digital adoption can improve because the interface is simpler;</li>
            <li>
              banks can see what customers are asking for, where they struggle, and which workflows create value;
            </li>
            <li>local-language financial access can be tested before deep deployment;</li>
            <li>
              the institution gains a clearer bridge between digital finance behavior and formal banking participation.
            </li>
          </ul>

          <p>This is where Clerqe becomes critical infrastructure.</p>

          <p>
            It is not just a chatbot sitting on top of banking. It is the interface layer that connects customer language
            to banking systems.
          </p>

          {/* Built for African Language Realities */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">
            Built for African Language Realities
          </h2>

          <p>Financial access in Africa cannot be English-only.</p>

          <p>
            Customers explain money in Swahili, Sheng, English, mixed language, mother tongue, and everyday local
            expressions. They do not separate financial life from language. Banking should not force them to.
          </p>

          <p>
            Clerqe is being developed to support local-language banking experiences, starting commercially with Kenyan
            Swahili, Sheng, and English, then expanding into more African languages.
          </p>

          <p>
            The current rollout starts with chat because chat gives us a controlled way to validate real customer intent,
            language patterns, workflow design, and institutional value.
          </p>

          <p>The long-term direction is broader: chat and voice.</p>

          <p>
            Voice matters because not everyone should have to read complex screens, type perfectly, or navigate an app to
            access financial services. Some customers will always prefer to speak. Some will need voice because reading is
            difficult. Some will need voice because the phone they have, the environment they live in, or the support they
            need makes voice the most natural path.
          </p>

          <p>
            That is why Clerqe is being built toward text-to-speech and speech-to-speech banking.
          </p>

          <p>
            The goal is simple: banking that can understand people in the languages they use, across the channels they
            already have.
          </p>

          {/* How Clerqe Works */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">How Clerqe Works</h2>

          <p>Clerqe starts with the customer's request.</p>

          <p>The customer asks a normal financial question or gives a normal financial instruction.</p>

          <p>Clerqe identifies the intent, understands the context, and starts the right workflow.</p>

          <p>
            If the customer asks about a transaction, Clerqe searches for the relevant record.
          </p>

          <p>If the customer asks for a statement, Clerqe starts the statement workflow.</p>

          <p>If the customer wants to send money, Clerqe guides the customer through a controlled transfer process.</p>

          <p>
            If a request needs confirmation, authentication, or escalation, Clerqe applies the required controls.
          </p>

          <p>The customer gets a clear answer, next step, receipt, or status update.</p>

          <p>The institution gets visibility into what happened.</p>

          <p>
            This is the balance that matters: a simpler experience for the customer, and stronger control for the
            financial institution.
          </p>

          {/* Safety, Trust, and Control */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">Safety, Trust, and Control</h2>

          <p>Financial services require trust.</p>

          <p>
            Clerqe is designed around controlled workflows, confirmation steps, authentication flows, audit records,
            partner-bank controls, and operational visibility.
          </p>

          <p>
            In the current rollout, Clerqe is operating in a controlled sandbox environment using sandboxed banking
            workflows and test financial data. No real money is moved in this environment, no live customer bank account
            is connected, and no actual banking instruction is executed against a financial institution.
          </p>

          <p>That does not reduce what Clerqe is.</p>

          <p>
            Clerqe is a functional banking agent being introduced through a controlled rollout so partners, users, and
            institutions can experience the system safely before live integration.
          </p>

          <p>
            In production, Clerqe connects through approved banking systems, licensed financial institutions,
            authentication services, payment rails, and compliance controls.
          </p>

          <p>The bank remains in control of regulated financial activity.</p>

          <p>Clerqe makes that activity easier for customers to access.</p>

          {/* Who Clerqe Is For */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">Who Clerqe Is For</h2>

          <p>Clerqe is for the young person checking whether rent was paid.</p>

          <p>It is for the mother confirming school fees.</p>

          <p>It is for the small trader reviewing money in and money out.</p>

          <p>It is for the first-time banking user who needs confidence.</p>

          <p>
            It is for the rural customer who should not have to travel or call support for simple financial help.
          </p>

          <p>
            It is for the woman managing household spending across groceries, rent, school, transport, and bills.
          </p>

          <p>
            It is for the informal worker who needs quick financial visibility but does not want to fight a complicated
            app.
          </p>

          <p>It is for banks that want to serve more customers without losing control.</p>

          <p>
            It is for partners who believe financial inclusion must go beyond account ownership and transaction rails.
          </p>

          <p>
            It is for ecosystem builders who understand that Africa's next leap in finance will come from making financial
            services easier to use.
          </p>

          {/* Why Partners Should Care */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">Why Partners Should Care</h2>

          <p>
            The next phase of financial inclusion is not only about opening more accounts.
          </p>

          <p>It is about helping people use financial services confidently.</p>

          <p>
            A person can have access to a financial product and still be excluded by the interface. They can have a phone
            and still struggle with the app. They can understand money and still not understand banking language. They can
            transact every day and still avoid formal services because the experience is too hard.
          </p>

          <p>Clerqe addresses that gap.</p>

          <p>
            For investors, Clerqe represents a critical interface opportunity in one of the world's most active digital
            finance markets.
          </p>

          <p>
            For banks, Clerqe offers a practical path to improve digital adoption, reduce routine support load, and
            understand customer intent at scale.
          </p>

          <p>
            For NGOs and development partners, Clerqe creates a new access layer for women, young people, first-time
            users, informal workers, rural communities, and multilingual customers.
          </p>

          <p>
            For infrastructure and AI partners, Clerqe creates the foundation for African-language conversational banking
            across chat and speech.
          </p>

          <p>This is not another app.</p>

          <p>This is a new way for customers to reach banking.</p>

          {/* Our Mission */}
          <h2 className="!mt-10 text-2xl font-bold text-slate-900 dark:text-slate-50">Our Mission</h2>

          <p>
            Our mission is to make banking accessible for everyone, especially those currently underserved by complex
            interfaces, language barriers, limited support, and low digital confidence.
          </p>

          <p>
            We are building Clerqe because we believe the future of banking in Africa should feel less like navigating a
            system and more like having a conversation that gets things done.
          </p>

          <p>
            Africa already built one of the strongest digital money environments in the world.
          </p>

          <p>Now we need to make financial services easier to reach.</p>

          <p>Clerqe is our answer to that challenge.</p>

          {/* Experience Clerqe */}
          <div className="!mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-50">Experience Clerqe</h2>

            <p className="mb-4 text-base leading-7 text-slate-700 dark:text-slate-300">
              Clerqe is now being rolled out in a controlled sandbox environment for early users, partners, banks,
              investors, and ecosystem collaborators.
            </p>

            <p className="mb-4 text-base leading-7 text-slate-700 dark:text-slate-300">
              You can create an account, interact with the agent, and experience how conversational banking workflows
              operate through a safe controlled environment.
            </p>

            <p className="mb-6 text-base leading-7 text-amber-700 dark:text-amber-400">
              No real money is moved in this rollout. No live bank account is connected. No actual financial instruction
              is executed against a financial institution.
            </p>

            <p className="mb-6 text-base leading-7 text-slate-700 dark:text-slate-300">
              The purpose of this rollout is to let partners experience Clerqe as the banking access layer it is
              becoming: a critical piece of technology for making financial services simpler, more human, and more
              accessible across Africa.
            </p>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-[3px] bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Get started
              <Icon name="arrow_upward" className="text-base rotate-45" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          {'\u00A9'} {new Date().getFullYear()} Clerqe. All rights reserved.
        </div>
      </div>
    </div>
  );
}
