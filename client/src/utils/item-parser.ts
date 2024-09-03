const questionRegex = /(?<=\*\*Item \d:\*\*\s\s).+(?=\n)/g;
const answerRegex = /(?<=[a-fA-F]\))(?!\*\*).+/g;
const correctAnswerRegex = /(?<=Answer: )[a-fA-F]/g;

export const parseItem = (text: string) => {
    const questions = text.match(questionRegex);
    const answers = text.match(answerRegex);
    const correctAnswers = text.match(correctAnswerRegex);

    const items = {"questions": questions,
                   "correctAnswers": correctAnswers, 
                   "answers": answers};
    return toTableFormat(items);
}

const toTableFormat = (items: Object) => {
    let data = [
        ['Question Text', 'Answer 1', 'Answer 2', 'Answer 3', 'Answer 4']
    ]

    for (let index = 0; index < items.questions.length; ++index) {
        let questionIndex = 4*index;
        data.push([items.questions[index],
                   items.answers[questionIndex] + 
                     ((items.correctAnswers[index] === 'A' || items.correctAnswers[index] === 'a') ?
                     "*" : ""), 
                   items.answers[questionIndex+1] + 
                     ((items.correctAnswers[index] === 'B' || items.correctAnswers[index] === 'b') ?
                     "*" : ""),
                   items.answers[questionIndex+2] + 
                     ((items.correctAnswers[index] === 'C' || items.correctAnswers[index] === 'c') ?
                     "*" : ""), 
                   items.answers[questionIndex+3] + 
                     ((items.correctAnswers[index] === 'D' || items.correctAnswers[index] === 'd') ?
                     "*" : "")])
    }
    return data;
}
