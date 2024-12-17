import { useQuery } from "react-query"; // Import React Query's useQuery
import axios from "axios"; // Axios is used for making HTTP requests

type PercentageFormat = {
    Problems: number;
    Questions: number;
    Task: number;
};

// Helper function to calculate the percentage of each issue type (problem, task, question)
function calculateTypePercentages(
    data: { type: string | number }[]
): PercentageFormat {
    const total = data.length; // Get the total number of issues
    const counts: PercentageFormat = {
        Problems: 0,
        Questions: 0,
        Task: 0,
    }; // Initialize an empty object to store counts for each type

    // Count the occurrences of each issue type
    data.forEach(function (issue: { type: string | number }) {
        switch (issue.type) {
            case "problem":
                counts.Problems += 1;
                break;
            case "question":
                counts.Questions += 1;
                break;
            case "task":
                counts.Task += 1;
                break;

            default:
                break;
        }
    });

    // Return an array of percentages for each issue type
    const percentages = [];
    for (const type in counts) {
        const count = counts[type];
        const percentage = ((count / total) * 100).toFixed(2); // Calculate the percentage
        percentages.push({ type: type, percentage: percentage });
    }

    return percentages;
}

// Helper function to calculate the percentage of each priority (high, medium, low)
function calculatePriorityPercentages(data) {
    const total = data.length; // Get the total number of issues
    const counts = {}; // Initialize an empty object to store counts for each priority

    // Count the occurrences of each priority
    data.forEach(function (issue) {
        counts[issue.priority] = (counts[issue.priority] || 0) + 1;
    });

    // Return an array of percentages for each priority
    const percentages = [];
    for (const priority in counts) {
        const count = counts[priority];
        const percentage = ((count / total) * 100).toFixed(2); // Calculate the percentage
        percentages.push({ priority: priority, percentage: percentage });
    }

    return percentages;
}

// Helper function to calculate the average time it took to close high priority issues
function calculateAverageResolutionTime(data) {
    const highPriorityIssues = data.filter(function (issue) {
        return issue.priority === "high"; // Filter only high priority issues
    });

    // If there are no high priority issues, return 0
    if (highPriorityIssues.length === 0) return 0;

    // Calculate the total resolution time for high priority issues
    const totalResolutionTime = highPriorityIssues.reduce(function (
        sum,
        issue
    ) {
        const createdTime = new Date(issue.created).getTime(); // Convert created date to timestamp
        const updatedTime = new Date(issue.updated).getTime(); // Convert updated date to timestamp
        return sum + (updatedTime - createdTime); // Add the difference (resolution time)
    },
    0);

    // Calculate the average resolution time in hours
    const averageResolutionTime = (
        totalResolutionTime /
        highPriorityIssues.length /
        (1000 * 60 * 60)
    ).toFixed(2);
    return averageResolutionTime; // Return the average resolution time in hours
}

// Helper function to find the satisfaction score for the issue that took the longest time to solve
function findLongestResolutionSatisfactionScore(data) {
    let longestIssue = { time: 0, score: null };

    // Loop through the issues to find the one with the longest resolution time
    data.forEach(function (issue) {
        const createdTime = new Date(issue.created).getTime();
        const updatedTime = new Date(issue.updated).getTime();
        const resolutionTime = updatedTime - createdTime;

        // If this issue took longer to resolve, update the longestIssue object
        if (resolutionTime > longestIssue.time) {
            longestIssue.time = resolutionTime;
            longestIssue.score = issue.satisfaction_rating.score; // Store the satisfaction score
        }
    });

    return longestIssue.score; // Return the satisfaction score of the longest resolved issue
}

// The main Data component
function Data() {
    // Fetch data using React Query
    const { data, isLoading, error } = useQuery(
        "fetchData", // The query name
        async () => {
            // Make a request to the API and return the data
            const response = await axios.get("/api/data");
            return response.data; // Return the data from the API
        }
    );

    // If the data is still loading, display a loading message
    if (isLoading) return <div>Loading data...</div>;

    // If there was an error fetching the data, display an error message
    if (error) return <div>Error fetching data</div>;

    // Process the data to calculate the insights
    const typePercentages = calculateTypePercentages(data.results);
    const priorityPercentages = calculatePriorityPercentages(data.results);
    const averageResolutionTime = calculateAverageResolutionTime(data.results);
    const longestResolutionSatisfactionScore =
        findLongestResolutionSatisfactionScore(data.results);

    // Render the results and insights
    return (
        <div className="border p-4">
            <h2 className="mb-2 text-lg font-bold">Insights</h2>

            <div className="mb-4">
                <h3 className="text-sm font-semibold">
                    Issue Type Percentages:
                </h3>
                <ul>
                    {typePercentages.map(function (item) {
                        return (
                            <li key={item.type}>
                                {item.type}: {item.percentage}%
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="mb-4">
                <h3 className="text-sm font-semibold">Priority Percentages:</h3>
                <ul>
                    {priorityPercentages.map(function (item) {
                        return (
                            <li key={item.priority}>
                                {item.priority}: {item.percentage}%
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="mb-4">
                <h3 className="text-sm font-semibold">
                    Average Resolution Time for High Priority Issues:
                </h3>
                <p>{averageResolutionTime} hours</p>
            </div>

            <div className="mb-4">
                <h3 className="text-sm font-semibold">
                    Satisfaction Score of the Longest Resolved Issue:
                </h3>
                <p>{longestResolutionSatisfactionScore}</p>
            </div>

            <h3 className="text-sm font-semibold">Raw Data:</h3>
            <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}

export default Data;
