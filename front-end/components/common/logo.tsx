"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";

import { AppInfo } from "@/config";

interface LogoProps {
    link?: string;
}

export const Logo = ({ link = "/" }: LogoProps) => {
    return (
        <Link href={link} className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
                {AppInfo.APP_NAME}
            </span>
        </Link>
    );
};
