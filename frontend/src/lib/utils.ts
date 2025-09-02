import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function compressTitle(title: string, maxLength: number) {
  title = title.trim();
  const words = title.split(" ");
  let compressed = "";
  for (const word of words) {
    if (compressed.length + word.length + 1 > maxLength) {
      break;
    }
    compressed += (compressed ? " " : "") + word;
  }
  if (compressed == title) return title;

  return compressed ? compressed + "..." : title;
}