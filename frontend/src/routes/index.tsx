import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Mail, Calendar, Users, CalendarClock, Send, Check } from "lucide-react";
import myLogo from "../assets/logo.svg"


export const Route = createFileRoute('/')({
  component: Index,
})


function register(){
  return console.log("register")
}

function signin(){
  return console.log("sign in")
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top thin bar */}
      <div className=" border-b border-border">
        <div className="mx-auto max-w-7xl px-6 flex gap-8 text-xs text-muted-foreground h-10 items-center">
          <a href="#" className="text-primary border-b-2 border-primary h-10 flex items-center">MailForYou</a>
        </div>
      </div>

      {/* Hero */}
      <section style={{ background: "var(--gradient-hero)" }} className="relative pb-24">
        <header className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <img className="w-10 h-10 rounded-lg border-none outline-none" alt='img' src={myLogo}/>
            </div>
            <span className="font-semibold tracking-tight">Email4U</span>
          </div>
          <button onClick={signin} className="px-5 py-2 cursor-pointer rounded-md border border-border text-sm font-medium hover:bg-accent transition">
            SIGN IN
          </button>
        </header>

        <div className="mx-auto max-w-4xl px-6 pt-16 text-center">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight">
            Email For You
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Ad free, privacy-first email from Email For You that puts you in control.
          </p>
          <button
            className="mt-10 cursor-pointer inline-flex items-center gap-3 px-7 py-3.5 rounded-md font-semibold text-primary-foreground tracking-wide text-sm"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            onClick={register}
          >
            JOIN US <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mock app screenshot */}
        <div className="mx-auto max-w-5xl px-6 mt-16 relative">
          <div className="rounded-xl bg-card border border-border p-3 shadow-2xl" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex gap-1.5 mb-3 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.18_25)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.8_0.15_85)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.7_0.17_145)]" />
            </div>

            <div className="grid grid-cols-12 gap-3 bg-[oklch(0.95_0.005_250)] rounded-lg p-3 text-[oklch(0.2_0.02_250)]">
              <aside className="col-span-3 space-y-1.5 text-xs">
                <div className="px-2 py-1.5 rounded bg-primary/10 text-primary font-medium">Inbox <span className="float-right">10</span></div>
                <div className="px-2 py-1.5">Drafts</div>
                <div className="px-2 py-1.5">Templates</div>
                <div className="px-2 py-1.5">Sent</div>
                <div className="px-2 py-1.5">Archive</div>
              </aside>

              <div className="col-span-4 space-y-2 text-xs border-x border-[oklch(0.85_0.01_250)] px-2">
                {["Brilliant Chang","Garrison Nguyen","no-reply@appointment","Ada Lindberg","Robin Wald"].map((n,i)=>(
                  <div key={i} className={`p-2 rounded ${i===1?"bg-primary/10":""}`}>
                    <div className="font-semibold">{n}</div>
                    <div className="text-[oklch(0.5_0.02_250)] truncate">Email4U Send link: Content…</div>
                  </div>
                ))}
              </div>

              <div className="col-span-5 text-xs p-2">
                <div className="font-semibold mb-1">Garrison Nguyen</div>
                <div className="text-[oklch(0.5_0.02_250)] mb-3">To me</div>
                <div className="h-px bg-[oklch(0.9_0.01_250)] mb-3" />
                <div className="text-primary font-semibold mb-1">Emailforyou PRO</div>
                <p className="text-[oklch(0.4_0.02_250)] leading-relaxed text-[11px]">
                  Welcome — whether you're scheduling, sharing, or staying connected, Appointment, Send, and Email For You combine powerful features with open-source principles.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Meet EmailForYou */}
      <section style={{ background: "var(--gradient-meet)" }} className="py-24 text-[oklch(0.2_0.02_250)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-4 justify-center mb-16">
            <span className="h-px w-24 bg-primary/40" />
            <h2 className="text-3xl md:text-4xl font-medium text-primary">Meet Email For You</h2>
            <span className="h-px w-24 bg-primary/40" />
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { Icon: Mail, title: "Email" },
              { Icon: Calendar, title: "Calendar" },
              { Icon: Users, title: "Contacts" },
            ].map(({ Icon, title }) => (
              <div key={title} className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              { t: "No ads", d: "You'll never see ads in Email For You. Stay focused on what matters, not on what advertisers want to sell you." },
              { t: "Your data, not ours", d: "Many email services rely on selling your data. Email For You doesn't. Your data stays yours, and we don't share it." },
              { t: "You are in control", d: "Use it in Email For You or your favorite apps. Email For You is built on open standards, so you're never locked in." },
            ].map((f) => (
              <div key={f.t}>
                <h4 className="font-semibold text-lg mb-2">{f.t}</h4>
                <p className="text-sm text-[oklch(0.4_0.02_250)] leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-6">
          {[
            { Icon: CalendarClock, tag: "Appointment", title: "Schedule Easily", desc: "Stop exchanging multiple messages to schedule a meeting. Share a link and let others book time on your calendar." },
            { Icon: Send, tag: "Send", title: "Attach Securely", desc: "Send large, end to end encrypted files directly from your email. From personal videos to sensitive documents, it's simple and secure." },
          ].map(({ Icon, tag, title, desc }) => (
            <a key={tag} href="#" className="group rounded-2xl border border-border bg-card p-8 hover:border-primary transition flex gap-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-brand)" }}>
                <Icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <div className="text-primary text-sm font-semibold">{tag}</div>
                <h3 className="text-2xl font-semibold mt-1 mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-[oklch(0.13_0.02_250)]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-muted-foreground mb-12 leading-relaxed">
            Get EmailForYou, Appointment, and Send in one simple subscription. You'll love the confidence, ease, and security these services add to Emailforyou. Thank you for supporting freedom.
          </p>

          <div className="rounded-2xl border border-primary/30 bg-card p-10 text-left" style={{ boxShadow: "var(--shadow-glow)" }}>
            <h3 className="text-2xl font-semibold">Early Bird Plan</h3>
            <p className="text-muted-foreground text-sm mt-1">Our initial offering, ideal for most users</p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-bold">$6</span>
              <span className="text-muted-foreground">per month, paid annually</span>
            </div>

            <button
              className="mt-6 w-full cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-primary-foreground tracking-wide text-sm"
              style={{ background: "var(--gradient-brand)" }}
              onClick={register}
            >
              JOIN US PLUS <ArrowRight className="w-4 h-4" />
            </button>

            <ul className="mt-8 space-y-3 text-sm">
              {[
                ["30 GB", "of Mail Storage"],
                ["60 GB", "of Send Storage"],
                ["15", "Email Addresses"],
                ["3", "Custom Domains"],
              ].map(([a, b]) => (
                <li key={b} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" />
                  <span><strong className="font-semibold">{a}</strong> <span className="text-muted-foreground">{b}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EmailForYou. Built on open standards.
      </footer>
    </div>
  );
}
