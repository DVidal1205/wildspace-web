import React from "react";
import { Button } from "./ui/button";

const MarkdownSave = ({ entity }: { entity: any }) => {
    const convertToMarkdown = (entity: any) => {
        let markdown = "";
        // Define the keys to ignore in a case-insensitive manner
        const ignoreKeys = ["worldid", "userid", "id", "imagekey"];

        // Iterate over all keys and values in the data object
        for (const [key, value] of Object.entries(entity)) {
            // Convert key to lowercase for case-insensitive comparison
            const keyLower = key.toLowerCase();

            if (!ignoreKeys.includes(keyLower) && value !== "") {
                if (keyLower === "name") {
                    // Format the 'name' property as an H1 header
                    markdown += `# ${value}\n\n`;
                } else {
                    // Format other properties as H2 headers followed by their values
                    markdown += `## ${
                        key.charAt(0).toUpperCase() + key.slice(1)
                    }\n${value}\n\n`;
                }
            }
        }

        return markdown;
    };

    const downloadMarkdown = (markdown: string) => {
        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${entity.name}.md`; // Use the name for the file name
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSave = () => {
        const markdown = convertToMarkdown(entity);
        downloadMarkdown(markdown);
    };

    return (
        <Button onClick={handleSave} className="my-2">
            Download
        </Button>
    );
};

export default MarkdownSave;
