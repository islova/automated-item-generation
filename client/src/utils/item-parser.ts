const itemRegex = /(?<=\*\*Item \d:\*\*)[\w\d\s:\).?,"'*]+?(?=\*\*Correct Answer: [a-fA-F]\)\*\*)/g;
const answerRegex = /(?<=Answer: )[a-fA-F]/g;

export const parseItem = (text: string) => {
    const items = text.match(itemRegex);
    const answers = text.match(answerRegex);

    return {"items": items, 
            "answers": answers}
}
