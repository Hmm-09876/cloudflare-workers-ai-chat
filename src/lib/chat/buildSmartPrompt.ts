export function buildWebContext(results: any[]) {
    const filteredResults = results.slice(0,5);

    return filteredResults.length > 0
        ? filteredResults
            .map(
            (r: any, i: number) => 
                `${i + 1}. ${r.title}\n${r.url}\n${r.content}\nDate: ${r.published_date}\nScore: ${r.score}`
            )
            .join("\n\n")
        : "No recent web results found";
}

export function buildSmartSystemPrompt(
    basePrompt: string,
    webContext: string,
    currentDate: string
) {
    return `
        ${basePrompt}
        Current date: ${currentDate}
        
        STRICT RULES FOR SMART MODE:
        - Use WEB RESULTS only if they are relevant.
        - Priority global/english sources.
        - If web results do not clearly support an answer, say you could not verify it.
        - Prefer a short direct answer over a long list.
        - Mention the basis of the answer, for example: search trend, current popularity, or recent mentions.
        - Never combine unrelated sources into one.
            
        WEB RESULTS:
        ${webContext}
    `;
}