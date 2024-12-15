import { List } from "@mui/material"
import MultipleChoiceOption from "./MultipleChoiceOption"
import ShortAnswerOption from "./ShortAnswerOption"
import TrueFalseAnswer from "./TrueFalseAnswer"

export default function Answers({to: question}) {

    const listItems = () => {
        if (question.type === 'MC') {
            return question.options.map((option, i) => (
                <MultipleChoiceOption key={`mc-${i}`} option={option} />
            ));
        } else if (question.type === 'TF') {
            const answer = question.options.find(option => (option[1] === '100'));
            return (
                <TrueFalseAnswer answer={answer[0]} />
            );
        } else if (question.type === 'SA') {
            return question.options.map((option, i) => (
                <ShortAnswerOption key={`sa-${i}`} option={option} />
            ));
        }
    }

    return (
        <>
            {question.type === 'SA' ? <b>Mogelijk(e) antwoord(en):</b> : null}
            <List dense component="ol" sx={{ listStyle: 'upper-alpha', pl: '2em' }}>
                {listItems()}
            </List>
        </>
    );
}