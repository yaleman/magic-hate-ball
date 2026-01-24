/// gets the answer from the backend API
async function getAnswer(): Promise<string> {
    try {
        const response = await fetch("/answer");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.answer || null;
    } catch (error) {
        console.error("Failed to fetch answer:", error);
        throw error;
    }
}

async function showError(message: string) {
    console.error(message);
    const errorDiv = document.getElementById("error");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("hidden");
    }
}

async function displayAnswer() {
    const errorDiv = document.getElementById("error");
    try {
        const answer = await getAnswer();
        if (!answer) {
            showError("No answer received from the server.");
        } else {
            console.debug(`Received answer: ${answer}`);
            const answerDiv = document.getElementById("answer");
            if (answerDiv) {
                answerDiv.textContent = answer;
                answerDiv.classList.remove("hidden");
            }
            if (errorDiv) {
                errorDiv.classList.add("hidden");
            }
        }
    }
    catch (error) {
        showError(`Error fetching answer: ${error}`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("get_answer") as HTMLButtonElement;
    if (button) {
        button.addEventListener("click", displayAnswer);
    }
});
