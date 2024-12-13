import { List } from "@mui/material"
import MultipleChoiceAnswers from "./MultipleChoiceAnswers"
import ShortAnswerAnswer from "./ShortAnswerAnswer"
import TrueFalseAnswer from "./TrueFalseAnswer"

export default function Answers({question}) {

    const listItems = () => {
        if (question.type === 'MC') {
            return question.options.map((option, i) => (
                <MultipleChoiceAnswers key={`mc-${i}`} option={option} />
            ));
        } else if (question.type === 'TF') {
            return question.options.map((option) => (
                <TrueFalseAnswer key={`tf-${option}`} option={option} />
            ));
        } else if (question.type === 'SA') {
            return question.options.map((option, i) => (
                <ShortAnswerAnswer key={`sa-${i}`} option={option} />
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