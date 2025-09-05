"use client"
import { Card, CardHeader, CardContent, CardFooter, CardDescription, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Check } from 'lucide-react';
import AnimationContainer from '../ui/animation-container';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';


const Pricing = () => {
    const { isSignedIn } = useAuth()
    const router = useRouter();
    const plans = [{
        name: "Free",
        info: "Free for beta users.",
        price: {
            monthly: 0,
        },
        features: [
            { text: "No credit card required" },
            { text: "100 credits" },
            { text: "1 video generation at a time" },
            { text: "Conversation history" },
        ],
        btn: {
            text: "Get Started",
            href: isSignedIn ? "/chat" : "/sign-in",
        },
    },{
        name: "Pro",
        info: "Coming soon",
        price: {
            monthly: 8,
        },
        features: [
            { text: "Payment method required" },
            { text: "2500 credits" },
            { text: "3 video generations at a time" },
            { text: "Conversation history" },
        ],
        btn: {
            text: "Continue with Pro",
            href: "/chat",
        },
    }]
  return (
    <AnimationContainer className='flex flex-col' delay={0.1}>
        <AnimationContainer className='mb-8' delay={0.2}>
            <h1 className="!leading-tight mt-6 text-center font-heading font-semibold text-2xl md:text-4xl lg:text-5xl">
                Simple and <br/> transparent pricing
            </h1>
            <p className="mt-6 text-center text-base text-muted-foreground md:text-lg">
                Choose a plan that works for you. No hidden fees. No surprises.
            </p>
        </AnimationContainer>
        <AnimationContainer className='flex flex-col w-full md:flex-row gap-4' delay={0.3}>
            {plans.map((plan) => (
                <Card
                    key={plan.name}
                    className={cn(
                        "relative flex w-full flex-col rounded-xl border-border",
                        "bg-[#0a0a0ac0]",
                        // "bg-black"
                    )}
                >
                    <CardHeader
                        className={cn(
                            "border-border border-b",
                        )}
                    >
                        <CardTitle
                            className={cn(
                                "font-medium text-lg",
                            )}
                        >
                            {plan.name}
                        </CardTitle>
                        <CardDescription>{plan.info}</CardDescription>
                        <h5 className="font-semibold text-3xl">
                            ${plan.price.monthly}
                            <span className="font-normal text-base text-muted-foreground">
                                {plan.name !== "Free" ? "/month" : ""}
                            </span>
                        </h5>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Check 
                                    className="h-4 w-4 text-primary" style={{
                                        filter: 'brightness(4)'
                                    }}
                                />
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <p>
                                                {feature.text}
                                            </p>
                                        </TooltipTrigger>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="mt-auto w-full">
                        <Button
                            onClick={() => {
                                // Handle button click
                                router.push(plan.btn.href)
                            }}
                            style={{ width: "100%" }}
                            className={buttonVariants({
                                className:
                                'bg-white text-black hover:bg-primary hover:text-primary-foreground w-full',
                            })}
                            disabled={plan.name == "Pro"}
                        >
                            {plan.btn.text}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </AnimationContainer>
    </AnimationContainer>
    
  )
}

export default Pricing;
