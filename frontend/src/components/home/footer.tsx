import AnimationContainer from "../ui/animation-container";
import Logo from "../ui/logo";
import { cn } from "@/lib/utils";

import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Github, Linkedin } from "lucide-react";
import Link from "next/link";

const Footer = () => {
	return (
		<footer 
            className={cn(
                "relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center", 
                // "border-border border-t",
                // "bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)]",
                "px-6 pt-16 pb-8 md:pb-0 lg:px-8 lg:pt-32"
            )}
        >
			<div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
				<AnimationContainer delay={0.1}>
					<div className="flex flex-col items-start justify-start md:max-w-[200px]">
						<div className="flex items-start">
							<Logo />
						</div>
						<p className="mt-4 text-start text-muted-foreground text-sm">
							Create your animations like magic.
						</p>
						<span className="mt-4 flex items-center text-neutral-200 text-sm">
							Made by{" "}
							<Link
								href="https://linkedin.com/in/shrey-singh7"
								className="ml-1 font-semibold hover:underline"
							>
								Shrey
							</Link>
						</span>
					</div>
				</AnimationContainer>

				<div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
					<div className="md:grid md:grid-cols-2 md:gap-8">
						<AnimationContainer delay={0.2}>
							<div className="">
								<h3 className="font-medium text-base text-white">Socials</h3>
								<ul className="mt-4 text-muted-foreground text-sm">
									<li className="mt-2">
										<Link
											href="https://linkedin.com/in/shrey-singh7"
											className="transition-all duration-300 hover:text-foreground"
										>
											LinkedIn
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="https://x.com/atshrey"
											className="transition-all duration-300 hover:text-foreground"
										>
											Twitter
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="https://github.com/cs7-shrey"
											className="transition-all duration-300 hover:text-foreground"
										>
											Github
										</Link>
									</li>
								</ul>
							</div>
						</AnimationContainer>
                        {/* Company - About, Privacy policy, Terms and Conditions */}
						<AnimationContainer delay={0.3}>
							<div className="mt-10 flex flex-col md:mt-0">
								<h3 className="font-medium text-base text-white">Company</h3>
								<ul className="mt-4 text-muted-foreground text-sm">
									<li className="">
										<Link
											href="#"
											className="transition-all duration-300 hover:text-foreground"
										>
											About Us
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="/privacy"
											className="transition-all duration-300 hover:text-foreground"
										>
											Privacy Policy
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="/terms"
											className="transition-all duration-300 hover:text-foreground"
										>
											Terms & Conditions
										</Link>
									</li>
								</ul>
							</div>
						</AnimationContainer>
					</div>
				</div>
			</div>

			<div className="mt-8 w-full border-border/40 border-t pt-4 md:flex md:items-center md:justify-between md:pt-8">
				<AnimationContainer delay={0.4}>
					<p className="mt-8 text-muted-foreground text-sm md:mt-0">
						&copy; {new Date().getFullYear()} Anim INC. All rights reserved.
					</p>
				</AnimationContainer>
			</div>

            <div className="h-4">

            </div>
		</footer>
    )
}

export default Footer;