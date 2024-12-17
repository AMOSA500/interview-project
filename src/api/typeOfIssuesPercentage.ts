import axios from 'axios';
import { Request, Response } from 'express';
import { SampleData } from './types';

const DATA_URL = 'https://sampleapi.squaredup.com/integrations/v1/service-desk?datapoints=500';

type TypeOfIssuesCounts = {
    problem: number;
    questions: number;
    tasks: number;
};

export const GET = async (req: Request, res: Response) => {
    try {
        const { data } = await axios.get<SampleData>(DATA_URL);
        const typeOfIssuesCounts: TypeOfIssuesCounts = {
            problem: 0,
            questions: 0,
            tasks: 0,
        };

        data.results.forEach((result) => {
            switch (result.type) {
                case 'problem':
                    typeOfIssuesCounts.problem += 1;
                    break;
                case 'question':
                    typeOfIssuesCounts.questions += 1;
                    break;
                case 'task':
                    typeOfIssuesCounts.tasks += 1;
                    break;
                default:
                    break;
            }
        });

        const totalCount = data.results.length;
        const typeOfIssuesPercentage: TypeOfIssuesCounts = {
            problem: (typeOfIssuesCounts.problem / totalCount) * 100,
            questions: (typeOfIssuesCounts.questions / totalCount) * 100,
            tasks: (typeOfIssuesCounts.tasks / totalCount) * 100,
        };

        res.send(typeOfIssuesPercentage);
    } catch (error) {
        res.status(500).send({ error: 'Issue fetching data...' });
    }
}
