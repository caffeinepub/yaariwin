import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Loader2,
  Shield,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const HOW_TO_PLAY = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Pick a Number",
    desc: "Choose 0\u20139, bet any amount",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Lowest Bet Wins",
    desc: "Sabse kam lagaya = Winner!",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "8x Payout",
    desc: "Win 8 times your bet amount",
  },
];

const BET_EXAMPLES = [
  { no: "No. 1", bet: "\u20b91", win: "\u20b98" },
  { no: "No. 5", bet: "\u20b910", win: "\u20b980" },
  { no: "No. 9", bet: "\u20b950", win: "\u20b9400" },
];

const LOGIN_STEPS = [
  { step: 1, text: '"Abhi Khelo" button dabayein' },
  { step: 2, text: "Ek naya popup window khulega" },
  { step: 3, text: 'Popup mein "Create New" ya "Use Existing" chunein' },
  {
    step: 4,
    text: 'Pehli baar ke liye "Create New" dabayein aur account banayein',
  },
  { step: 5, text: "Account ban gaya? Game start! \uD83C\uDF89" },
];

export function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="/assets/generated/yaariwin-logo.dim_400x200.png"
            alt="YaariWin"
            className="w-64 sm:w-80 mx-auto mb-2 drop-shadow-2xl"
          />
          <motion.h1
            className="text-4xl sm:text-6xl font-black text-gradient-gold mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            YaariWin
          </motion.h1>
          <p className="text-muted-foreground text-lg sm:text-xl mb-2">
            Dosto ke saath khelo, bade jeeto! \uD83C\uDF89
          </p>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
            Friends ka number game \u2014 Lowest bet wins \u00d7 8 payout!
          </p>
        </motion.div>

        {/* How to Play */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-8"
        >
          {HOW_TO_PLAY.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-4 text-left"
            >
              <div className="text-gold mb-2">{item.icon}</div>
              <p className="font-bold text-foreground text-sm">{item.title}</p>
              <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Example Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-2xl p-4 mb-8 max-w-xs w-full"
        >
          <p className="text-xs font-bold text-gold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Bet Examples
          </p>
          <div className="space-y-2 text-xs">
            {BET_EXAMPLES.map((row) => (
              <div key={row.no} className="flex justify-between items-center">
                <span className="text-muted-foreground">{row.no}</span>
                <span className="text-foreground font-mono">{row.bet} bet</span>
                <span className="text-gold font-bold">{row.win} win</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-3"
        >
          <Button
            data-ocid="landing.primary_button"
            size="lg"
            onClick={login}
            disabled={isLoggingIn}
            className="bg-gold text-primary-foreground hover:bg-gold-light font-black text-lg px-10 py-6 rounded-full glow-gold transition-all hover:scale-105"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Connecting...
              </>
            ) : (
              "\uD83C\uDFAE Abhi Khelo \u2014 Login Karo"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Secure login via Internet Identity
          </p>

          {/* Help toggle */}
          <button
            type="button"
            data-ocid="landing.secondary_button"
            onClick={() => setShowHelp((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors underline underline-offset-2"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Login kaise karein? Help chahiye
          </button>

          {/* Help card */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                data-ocid="landing.panel"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="relative bg-card border-2 border-gold rounded-2xl p-5 max-w-sm w-full text-left shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close help"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-sm font-bold text-gold mb-3">
                  Login kaise karein? \uD83D\uDC47
                </p>
                <ol className="space-y-2">
                  {LOGIN_STEPS.map(({ step, text }) => (
                    <li
                      key={step}
                      className="flex items-start gap-2 text-xs text-foreground"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold text-primary-foreground font-bold text-xs flex items-center justify-center">
                        {step}
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
                  \u26a0\ufe0f Popup block ho raha hai? Browser mein popup allow
                  karein ya Chrome use karein.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
