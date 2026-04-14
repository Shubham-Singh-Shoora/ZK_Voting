import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingPulse } from "../components/landing/LandingPulse";
import { LandingWorkflow } from "../components/landing/LandingWorkflow";
import "../components/landing/Landing.css";
import { motion, AnimatePresence } from "framer-motion";

interface LandingPageProps {
    walletConnected: boolean;
    walletLabel: string;
    chainLabel: string;
    unreadNotifications: number;
    proposalsLength: number;
    activeCount: number;
    endingSoonCount: number;
    passedCount: number;
    onConnectWallet: () => void;
    onGoVerify: () => void;
    onGoDocs: () => void;
    onGoResources: () => void;
    onGoExplorer: () => void;
    onGoNotifications: () => void;
    onGoHub: () => void;
    onGoSupport: () => void;
}

export function LandingPage(props: LandingPageProps) {
    return (
        <AnimatePresence>
            <motion.div 
                className="aegis-landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
            >
                <LandingHero
                    walletConnected={props.walletConnected}
                    onConnectWallet={props.onConnectWallet}
                    onGoDocs={props.onGoDocs}
                    onGoResources={props.onGoResources}
                    onGoExplorer={props.onGoExplorer}
                    onGoSupport={props.onGoSupport}
                />

                <LandingWorkflow />

                <LandingPulse
                    chainLabel={props.chainLabel}
                    activeCount={props.activeCount}
                    onGoExplorer={props.onGoExplorer}
                />

                <LandingFooter
                    onGoHub={props.onGoHub}
                    onGoDocs={props.onGoDocs}
                    onGoResources={props.onGoResources}
                    onGoSupport={props.onGoSupport}
                />
            </motion.div>
        </AnimatePresence>
    );
}
