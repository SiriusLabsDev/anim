import { Skeleton } from "@/components/ui/skeleton";


const LoadingSkeleton = () => {
    return (
        <div className="px-4">
        <Skeleton className="bg-[#27282D] flex flex-col justify-center w-full rounded-xl text-white py-2 mb-4 pl-2 pr-8">
            <span className="bg-[#dfdfdf] text-[#27282D] font-bold rounded-full w-6 h-6 p-4 inline-flex items-center justify-center mr-2">
            </span>
        </Skeleton>
        <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-1/2" />
        </div>
        <br />
        <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-1/2" />
        </div>
        </div>
    )
}

export default LoadingSkeleton;