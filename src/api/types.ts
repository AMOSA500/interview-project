export interface SampleData {
    results: {
        id: number;
        created: string;
        updated: string;
        due: string;
        status: string;
        type: string;
        priority: string;
        assignee_id: string;
        subject: string;
        satisfaction_rating: {
            score: string;
        };
        organization_id: string;
        via: {
            channel: string;
            source: {
                from: {
                    name: string;
                    email: string;
                };
            };
        };
        ticket_form_id: string;
    }[];
}
