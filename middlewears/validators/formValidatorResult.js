import {validationResult} from 'express-validator';

function formValidatorResult(req) {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg);

        return {
            contextOptions: {
                oldInput: { ...req.body},
                messages
            },
            isOk: false
        };
    }

    return { isOk: true };
}

export default formValidatorResult;