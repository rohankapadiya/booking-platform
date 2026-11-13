"use client";

export default function LocalTime({ iso }) {
    return (
    <time dateTime={iso} suppressHydrationWarning>
        {new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
    </time>
    );
}