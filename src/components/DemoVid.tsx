import React from "react";

export default function DemoVid() {
    return (
        <div className="overflow-hidden aspect-video mt-12">
            <iframe
                src="https://www.youtube.com/embed/EGwAVXVsP9M"
                title="Project Wildspace Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="border-2 rounded border-primary w-[80vw] md:w-[55vw] h-auto aspect-video"
            ></iframe>
        </div>
    );
}
