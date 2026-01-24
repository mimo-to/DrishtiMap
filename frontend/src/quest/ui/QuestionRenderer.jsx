import React from 'react';
import { useQuestStore } from '../engine/useQuestStore';
import { engine } from '../engine/QuestEngine';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Label from '../../components/ui/Label';

const QuestionRenderer = ({ question }) => {

    const value = useQuestStore((state) => state.answers[question.id] || '');
    const error = useQuestStore((state) => state.errors[question.id]);
    const submitAnswer = useQuestStore((state) => state.submitAnswer);

    const handleChange = (e) => {

        submitAnswer(question, e.target.value);
    };

    const handleBlur = () => {

        submitAnswer(question, value);
    };

    const commonProps = {
        label: question.prompt,
        helperText: question.helpText,
        placeholder: 'Type your answer...',
        value: value,
        onChange: handleChange,
        onBlur: handleBlur,
        error: error
    };

    switch (question.type) {
        case 'long_text':
            return <TextArea {...commonProps} />;
        case 'single_select':
            return <Select {...commonProps} options={question.options} />;
        case 'text':
        default:
            return <Input {...commonProps} type="text" />;
    }
};

export default QuestionRenderer;
